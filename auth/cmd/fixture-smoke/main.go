package main

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"time"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

type params struct {
	RPId          string `json:"rpId"`
	Origin        string `json:"origin"`
	Challenge     string `json:"challenge"`
	UserID        string `json:"userId"`
	CredentialID  string `json:"credentialId"`
	CosePublicKey string `json:"cosePublicKey"`
}

type smokeUser struct {
	id          []byte
	name        string
	credentials []webauthn.Credential
}

func (u *smokeUser) WebAuthnID() []byte          { return u.id }
func (u *smokeUser) WebAuthnName() string        { return u.name }
func (u *smokeUser) WebAuthnDisplayName() string { return u.name }
func (u *smokeUser) WebAuthnIcon() string        { return "" }
func (u *smokeUser) WebAuthnCredentials() []webauthn.Credential {
	return u.credentials
}

func main() {
	raw, err := os.ReadFile("../contracts/fixtures/params.json")
	if err != nil {
		panic(err)
	}
	var p params
	if err := json.Unmarshal(raw, &p); err != nil {
		panic(err)
	}
	userId, err := base64.URLEncoding.DecodeString(padB64(p.UserID))
	if err != nil {
		panic(err)
	}
	coseKey, err := base64.URLEncoding.DecodeString(padB64(p.CosePublicKey))
	if err != nil {
		panic(err)
	}

	wa, err := webauthn.New(&webauthn.Config{
		RPDisplayName: "Gia Pha",
		RPID:          p.RPId,
		RPOrigins:     []string{p.Origin},
	})
	if err != nil {
		panic(err)
	}

	// --- registration ---
	body, err := os.ReadFile("../contracts/fixtures/attestation.json")
	if err != nil {
		panic(err)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/passkey/registerFinish", strings.NewReader(string(body)))
	req.Header.Set("Content-Type", "application/json")
	u := &smokeUser{id: userId, name: "Alice"}
	sess := webauthn.SessionData{
		Challenge:  p.Challenge,
		UserID:     userId,
		Expires:    time.Now().Add(5 * time.Minute),
		CredParams: []protocol.CredentialParameter{{Type: "public-key", Algorithm: -7}, {Type: "public-key", Algorithm: -257}},
	}
	cred, err := wa.FinishRegistration(u, sess, req)
	if err != nil {
		fmt.Println("REGISTRATION FAILED:", err)
		var pe *protocol.Error
		if errors.As(err, &pe) {
			fmt.Printf("  details: %s\n  class: %s\n  class: %s\n", pe.Details, pe.DevInfo, pe.Type)
		}
		os.Exit(1)
	}
	fmt.Printf("REGISTRATION OK credential id=%x\n", cred.ID)

	// --- login ---
	abody, err := os.ReadFile("../contracts/fixtures/assertion.json")
	if err != nil {
		panic(err)
	}
	areq := httptest.NewRequest(http.MethodPost, "/api/passkey/loginFinish", strings.NewReader(string(abody)))
	areq.Header.Set("Content-Type", "application/json")
	u.credentials = []webauthn.Credential{{ID: cred.ID, PublicKey: coseKey, Authenticator: webauthn.Authenticator{AAGUID: []byte{}}}}
	lsess := webauthn.SessionData{
		Challenge: p.Challenge,
		Expires:   time.Now().Add(5 * time.Minute),
	}
	lcred, err := wa.FinishDiscoverableLogin(func(rawID, userHandle []byte) (webauthn.User, error) {
		return u, nil
	}, lsess, areq)
	if err != nil {
		fmt.Println("LOGIN FAILED:", err)
		os.Exit(1)
	}
	fmt.Printf("LOGIN OK counter=%d\n", lcred.Authenticator.SignCount)
	slog.Debug("unused")
}

func padB64(s string) string {
	switch len(s) % 4 {
	case 2:
		return s + "=="
	case 3:
		return s + "="
	}
	return s
}
