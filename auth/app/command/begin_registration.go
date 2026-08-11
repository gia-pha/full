package command

import (
	"context"
	"fmt"

	"auth-passkey/domain/session"
	"auth-passkey/domain/user"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

type BeginRegistration struct {
	Name string
}

type BeginRegistrationResult struct {
	Options   *protocol.CredentialCreation
	SessionID string
}

type BeginRegistrationHandler interface {
	Handle(ctx context.Context, cmd BeginRegistration) (*BeginRegistrationResult, error)
}

type beginRegistrationHandler struct {
	webAuthn    *webauthn.WebAuthn
	userRepo    user.Repository
	sessionRepo session.Repository
}

func NewBeginRegistrationHandler(
	webAuthn *webauthn.WebAuthn,
	userRepo user.Repository,
	sessionRepo session.Repository,
) BeginRegistrationHandler {
	if webAuthn == nil {
		panic("nil webAuthn")
	}
	if userRepo == nil {
		panic("nil userRepo")
	}
	if sessionRepo == nil {
		panic("nil sessionRepo")
	}

	return beginRegistrationHandler{
		webAuthn:    webAuthn,
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

func (h beginRegistrationHandler) Handle(ctx context.Context, cmd BeginRegistration) (*BeginRegistrationResult, error) {
	user := user.NewUser(cmd.Name)

	opts := []webauthn.RegistrationOption{
		webauthn.WithResidentKeyRequirement(protocol.ResidentKeyRequirementRequired),
		webauthn.WithExclusions(webauthn.Credentials(user.WebAuthnCredentials()).CredentialDescriptors()),
		webauthn.WithExtensions(map[string]any{"credProps": true}),
	}

	options, sessionData, err := h.webAuthn.BeginRegistration(user, opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to begin registration: %w", err)
	}

	sessionID, err := h.sessionRepo.GenerateID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate id: %w", err)
	}

	if err := h.userRepo.SaveUser(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	if err := h.sessionRepo.SaveSession(ctx, sessionID, *sessionData); err != nil {
		return nil, fmt.Errorf("failed to save session: %w", err)
	}

	return &BeginRegistrationResult{
		Options:   options,
		SessionID: sessionID,
	}, nil
}
