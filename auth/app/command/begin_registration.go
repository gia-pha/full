package command

import (
	"context"

	"auth-passkey/domain/session"
	"auth-passkey/domain/user"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

type BeginRegistration struct {
	Username string
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
	u, err := h.userRepo.GetOrCreateUser(ctx, cmd.Username)
	if err != nil {
		return nil, err
	}

	options, sessionData, err := h.webAuthn.BeginRegistration(u)
	if err != nil {
		return nil, err
	}

	sessionID, err := h.sessionRepo.GenerateID(ctx)
	if err != nil {
		return nil, err
	}

	if err := h.sessionRepo.SaveSession(ctx, sessionID, *sessionData); err != nil {
		return nil, err
	}

	return &BeginRegistrationResult{
		Options:   options,
		SessionID: sessionID,
	}, nil
}
