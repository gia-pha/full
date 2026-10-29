// Package contracts runs the provider-side Pact verification for the auth
// service: it replays the interactions recorded by the frontend consumer
// contract tests against the real HTTP handlers and the real go-webauthn
// verification stack.
//
// Prerequisites: the Pact FFI library (libpact_ffi). Install it once with:
//
//	bash contracts/install-pact-ffi.sh
//
// Sources:
//   - without PACT_BROKER_URL: verifies the pact files in frontend/pacts
//   - with PACT_BROKER_URL: fetches the latest pacts from the broker and
//     publishes the verification results back to it
package contracts

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"strings"
	"testing"
	"time"

	"auth-passkey/adapters"
	"auth-passkey/app"
	"auth-passkey/app/command"
	"auth-passkey/app/query"
	"auth-passkey/domain/user"
	"auth-passkey/ports"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/pact-foundation/pact-go/v2/models"
	"github.com/pact-foundation/pact-go/v2/provider"
)

// Session ids fixed by the consumer contract tests
// (frontend/tests/contracts/auth-api.test.ts).
const (
	regSessionID   = "pact-reg-session"
	loginSessionID = "pact-login-session"
)

type contractParams struct {
	RPId          string `json:"rpId"`
	Origin        string `json:"origin"`
	Challenge     string `json:"challenge"`
	UserID        string `json:"userId"`
	CredentialID  string `json:"credentialId"`
	CosePublicKey string `json:"cosePublicKey"`
}

func loadParams(t *testing.T) contractParams {
	t.Helper()
	raw, err := os.ReadFile("../../contracts/fixtures/params.json")
	if err != nil {
		t.Fatalf("read fixtures: %v (run node contracts/generate-fixtures.mjs)", err)
	}
	var p contractParams
	if err := json.Unmarshal(raw, &p); err != nil {
		t.Fatalf("parse fixtures: %v", err)
	}
	return p
}

func decodeB64URL(t *testing.T, s string) []byte {
	t.Helper()
	switch len(s) % 4 {
	case 2:
		s += "=="
	case 3:
		s += "="
	}
	b, err := base64.URLEncoding.DecodeString(s)
	if err != nil {
		t.Fatalf("decode base64url %q: %v", s, err)
	}
	return b
}

func providerVersion() string {
	if v := os.Getenv("PACT_PROVIDER_VERSION"); v != "" {
		return v
	}
	if v, err := exec.Command("git", "rev-parse", "--short", "HEAD").Output(); err == nil {
		return strings.TrimSpace(string(v))
	}
	return "dev"
}

func TestPactVerification(t *testing.T) {
	params := loadParams(t)
	userID := decodeB64URL(t, params.UserID)
	credentialID := decodeB64URL(t, params.CredentialID)
	coseKey := decodeB64URL(t, params.CosePublicKey)

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))

	webAuthn, err := webauthn.New(&webauthn.Config{
		RPDisplayName: "Gia Pha",
		RPID:          params.RPId,
		RPOrigins:     []string{params.Origin},
	})
	if err != nil {
		t.Fatalf("webauthn config: %v", err)
	}

	userRepo := adapters.NewMemoryUserRepository(logger)
	sessionRepo := adapters.NewMemorySessionRepository(logger)

	application := app.Application{
		Commands: app.Commands{
			BeginRegistration:  command.NewBeginRegistrationHandler(webAuthn, userRepo, sessionRepo),
			FinishRegistration: command.NewFinishRegistrationHandler(webAuthn, userRepo, sessionRepo),
			BeginLogin:         command.NewBeginLoginHandler(webAuthn, userRepo, sessionRepo),
			FinishLogin:        command.NewFinishLoginHandler(webAuthn, userRepo, sessionRepo, logger),
			Logout:             command.NewLogoutHandler(sessionRepo),
		},
		Queries: app.Queries{
			IsSessionValid: query.NewIsSessionValidHandler(sessionRepo),
			UserInfo:       query.NewUserInfoHandler(sessionRepo, userRepo),
		},
	}

	mux := http.NewServeMux()
	ports.NewHttpServer(application, logger, false).RegisterRoutes(mux)
	server := httptest.NewServer(mux)
	defer server.Close()

	ctx := context.Background()

	seedUser := func() {
		u := user.UnmarshalUserFromDatabase(userID, "Alice", "Alice", nil)
		if err := userRepo.SaveUser(ctx, u); err != nil {
			t.Fatalf("seed user: %v", err)
		}
	}

	stateHandlers := models.StateHandlers{
		"the auth service is available": func(setup bool, _ models.ProviderState) (models.ProviderStateResponse, error) {
			return nil, nil
		},
		"a registration session exists": func(setup bool, _ models.ProviderState) (models.ProviderStateResponse, error) {
			if !setup {
				return nil, nil
			}
			seedUser()
			err := sessionRepo.SaveSession(ctx, regSessionID, webauthn.SessionData{
				Challenge:  params.Challenge,
				UserID:     userID,
				Expires:    time.Now().Add(5 * time.Minute),
				CredParams: []protocol.CredentialParameter{{Type: "public-key", Algorithm: -7}, {Type: "public-key", Algorithm: -257}},
			})
			return nil, err
		},
		"no registration session exists": func(setup bool, _ models.ProviderState) (models.ProviderStateResponse, error) {
			if !setup {
				return nil, nil
			}
			return nil, sessionRepo.DeleteSession(ctx, regSessionID)
		},
		"a login session and a user with a passkey exist": func(setup bool, _ models.ProviderState) (models.ProviderStateResponse, error) {
			if !setup {
				return nil, nil
			}
			u := user.UnmarshalUserFromDatabase(userID, "Alice", "Alice", []webauthn.Credential{{
				ID:              credentialID,
				PublicKey:       coseKey,
				AttestationType: "none",
				Authenticator:   webauthn.Authenticator{AAGUID: []byte{}},
			}})
			if err := userRepo.SaveUser(ctx, u); err != nil {
				return nil, err
			}
			// Discoverable login: the session must not carry a user id.
			err := sessionRepo.SaveSession(ctx, loginSessionID, webauthn.SessionData{
				Challenge: params.Challenge,
				Expires:   time.Now().Add(5 * time.Minute),
			})
			return nil, err
		},
		"no login session exists": func(setup bool, _ models.ProviderState) (models.ProviderStateResponse, error) {
			if !setup {
				return nil, nil
			}
			return nil, sessionRepo.DeleteSession(ctx, loginSessionID)
		},
	}

	request := provider.VerifyRequest{
		ProviderBaseURL: server.URL,
		Provider:        "auth",
		ProviderVersion: providerVersion(),
		StateHandlers:   stateHandlers,
		BeforeEach: func() error {
			_ = sessionRepo.DeleteSession(ctx, regSessionID)
			_ = sessionRepo.DeleteSession(ctx, loginSessionID)
			return nil
		},
	}

	if brokerURL := os.Getenv("PACT_BROKER_URL"); brokerURL != "" {
		request.BrokerURL = brokerURL
		request.BrokerToken = os.Getenv("PACT_BROKER_TOKEN")
		request.BrokerUsername = os.Getenv("PACT_BROKER_USERNAME")
		request.BrokerPassword = os.Getenv("PACT_BROKER_PASSWORD")
		request.ConsumerVersionSelectors = []provider.Selector{
			&provider.ConsumerVersionSelector{Consumer: "frontend", Latest: true},
		}
		request.EnablePending = true
		request.PublishVerificationResults = true
		request.FailIfNoPactsFound = true
		if tag := os.Getenv("PACT_PROVIDER_TAG"); tag != "" {
			request.ProviderTags = []string{tag}
		}
		if branch := os.Getenv("PACT_PROVIDER_BRANCH"); branch != "" {
			request.ProviderBranch = branch
		}
	} else {
		request.PactDirs = []string{"../../frontend/pacts"}
	}

	verifier := provider.NewVerifier()
	if err := verifier.VerifyProvider(t, request); err != nil {
		t.Fatalf("pact verification failed: %v", err)
	}
}
