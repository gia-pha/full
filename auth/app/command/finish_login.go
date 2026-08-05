package command

import (
	"context"
	"log/slog"
	"net/http"

	"auth-passkey/domain/session"
	"auth-passkey/domain/user"

	"github.com/go-webauthn/webauthn/webauthn"
)

type FinishLogin struct {
	SessionID string
	Request   *http.Request
}

type FinishLoginResult struct {
	NewSessionID string
}

type FinishLoginHandler interface {
	Handle(ctx context.Context, cmd FinishLogin) (*FinishLoginResult, error)
}

type finishLoginHandler struct {
	webAuthn    *webauthn.WebAuthn
	userRepo    user.Repository
	sessionRepo session.Repository
	log         *slog.Logger
}

func NewFinishLoginHandler(
	webAuthn *webauthn.WebAuthn,
	userRepo user.Repository,
	sessionRepo session.Repository,
	log *slog.Logger,
) FinishLoginHandler {
	if webAuthn == nil {
		panic("nil webAuthn")
	}
	if userRepo == nil {
		panic("nil userRepo")
	}
	if sessionRepo == nil {
		panic("nil sessionRepo")
	}
	if log == nil {
		panic("nil log")
	}

	return finishLoginHandler{
		webAuthn:    webAuthn,
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		log:         log,
	}
}

func (h finishLoginHandler) Handle(ctx context.Context, cmd FinishLogin) (*FinishLoginResult, error) {
	sessionData, ok := h.sessionRepo.GetSession(ctx, cmd.SessionID)
	if !ok {
		return nil, ErrSessionNotFound
	}

	u, err := h.userRepo.GetOrCreateUser(ctx, string(sessionData.UserID))
	if err != nil {
		return nil, err
	}

	credential, err := h.webAuthn.FinishLogin(u, sessionData, cmd.Request)
	if err != nil {
		return nil, err
	}

	if credential.Authenticator.CloneWarning {
		h.log.Warn("Clone warning detected for user: ", "userName", u.WebAuthnName())
	}

	u.UpdateCredential(credential)

	if err := h.userRepo.SaveUser(ctx, u); err != nil {
		return nil, err
	}

	if err := h.sessionRepo.DeleteSession(ctx, cmd.SessionID); err != nil {
		return nil, err
	}

	newSessionID, err := h.sessionRepo.GenerateID(ctx)
	if err != nil {
		return nil, err
	}

	return &FinishLoginResult{
		NewSessionID: newSessionID,
	}, nil
}
