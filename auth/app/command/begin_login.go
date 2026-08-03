package command

import (
	"context"

	"auth-passkey/domain/session"
	"auth-passkey/domain/user"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

type BeginLogin struct {
	Username string
}

type BeginLoginResult struct {
	Options   *protocol.CredentialAssertion
	SessionID string
}

type BeginLoginHandler interface {
	Handle(ctx context.Context, cmd BeginLogin) (*BeginLoginResult, error)
}

type beginLoginHandler struct {
	webAuthn    *webauthn.WebAuthn
	userRepo    user.Repository
	sessionRepo session.Repository
}

func NewBeginLoginHandler(
	webAuthn *webauthn.WebAuthn,
	userRepo user.Repository,
	sessionRepo session.Repository,
) BeginLoginHandler {
	if webAuthn == nil {
		panic("nil webAuthn")
	}
	if userRepo == nil {
		panic("nil userRepo")
	}
	if sessionRepo == nil {
		panic("nil sessionRepo")
	}

	return beginLoginHandler{
		webAuthn:    webAuthn,
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

func (h beginLoginHandler) Handle(ctx context.Context, cmd BeginLogin) (*BeginLoginResult, error) {
	u, err := h.userRepo.GetOrCreateUser(ctx, cmd.Username)
	if err != nil {
		return nil, err
	}

	options, sessionData, err := h.webAuthn.BeginLogin(u)
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

	return &BeginLoginResult{
		Options:   options,
		SessionID: sessionID,
	}, nil
}
