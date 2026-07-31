package command

import (
	"context"
	"net/http"

	"auth-passkey/domain/session"
	"auth-passkey/domain/user"

	"github.com/go-webauthn/webauthn/webauthn"
)

type FinishRegistration struct {
	SessionID string
	Request   *http.Request
}

type FinishRegistrationHandler interface {
	Handle(ctx context.Context, cmd FinishRegistration) error
}

type finishRegistrationHandler struct {
	webAuthn    *webauthn.WebAuthn
	userRepo    user.Repository
	sessionRepo session.Repository
}

func NewFinishRegistrationHandler(
	webAuthn *webauthn.WebAuthn,
	userRepo user.Repository,
	sessionRepo session.Repository,
) FinishRegistrationHandler {
	if webAuthn == nil {
		panic("nil webAuthn")
	}
	if userRepo == nil {
		panic("nil userRepo")
	}
	if sessionRepo == nil {
		panic("nil sessionRepo")
	}

	return finishRegistrationHandler{
		webAuthn:    webAuthn,
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

func (h finishRegistrationHandler) Handle(ctx context.Context, cmd FinishRegistration) error {
	sessionData, ok := h.sessionRepo.GetSession(ctx, cmd.SessionID)
	if !ok {
		return ErrSessionNotFound
	}

	u, err := h.userRepo.GetOrCreateUser(ctx, string(sessionData.UserID))
	if err != nil {
		return err
	}

	credential, err := h.webAuthn.FinishRegistration(u, sessionData, cmd.Request)
	if err != nil {
		return err
	}

	u.AddCredential(credential)

	if err := h.userRepo.SaveUser(ctx, u); err != nil {
		return err
	}

	return h.sessionRepo.DeleteSession(ctx, cmd.SessionID)
}
