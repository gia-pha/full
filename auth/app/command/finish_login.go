package command

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"time"

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

	var user *user.User

	loadUser := func(rawID, userHandle []byte) (webauthn.User, error) {
		if user != nil {
			return nil, ErrUserAlreadyFound
		}
		u, err := h.userRepo.GetUser(ctx, string(userHandle))
		if err == nil {
			user = u
		}
		return u, err
	}

	credential, err := h.webAuthn.FinishDiscoverableLogin(loadUser, sessionData, cmd.Request)
	if err != nil {
		return nil, fmt.Errorf("failed to finish discoverable login: %w", err)
	}

	if credential.Authenticator.CloneWarning {
		h.log.Warn("Clone warning detected for user: ", "id", user.WebAuthnID())
	}

	user.UpdateCredential(credential)

	if err := h.userRepo.SaveUser(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to save user: %w", err)
	}

	if err := h.sessionRepo.DeleteSession(ctx, cmd.SessionID); err != nil {
		return nil, fmt.Errorf("failed to delete session: %w", err)
	}

	newSessionID, err := h.sessionRepo.GenerateID(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate id: %w", err)
	}

	sessionData.Expires = time.Now().Add(time.Hour)
	sessionData.UserID = user.WebAuthnID()
	h.sessionRepo.SaveSession(ctx, newSessionID, sessionData)

	return &FinishLoginResult{
		NewSessionID: newSessionID,
	}, nil
}
