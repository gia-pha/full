package command

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"auth-passkey/domain/session"
	"auth-passkey/domain/user"

	"github.com/go-webauthn/webauthn/webauthn"
)

type FinishRegistration struct {
	SessionID string
	Request   *http.Request
}

type FinishRegistrationResult struct {
	NewSessionID string
}

type FinishRegistrationHandler interface {
	Handle(ctx context.Context, cmd FinishRegistration) (*FinishRegistrationResult, error)
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

func (h finishRegistrationHandler) Handle(ctx context.Context, cmd FinishRegistration) (*FinishRegistrationResult, error) {
	sessionData, ok := h.sessionRepo.GetSession(ctx, cmd.SessionID)
	if !ok {
		return nil, ErrSessionNotFound
	}

	u, err := h.userRepo.GetUser(ctx, string(sessionData.UserID))
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	credential, err := h.webAuthn.FinishRegistration(u, sessionData, cmd.Request)
	if err != nil {
		return nil, fmt.Errorf("failed to finish registration: %w", err)
	}

	u.AddCredential(credential)

	if err := h.userRepo.SaveUser(ctx, u); err != nil {
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
	sessionData.UserID = u.WebAuthnID()
	h.sessionRepo.SaveSession(ctx, newSessionID, sessionData)

	return &FinishRegistrationResult{
		NewSessionID: newSessionID,
	}, nil
}
