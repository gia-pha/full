package command

import (
	"context"
	"fmt"
	"net/http"

	"auth-passkey/domain/session"
)

type Logout struct {
	SessionID string
	Request   *http.Request
}

type LogoutHandler interface {
	Handle(ctx context.Context, cmd Logout) error
}

type logoutHandler struct {
	sessionRepo session.Repository
}

func NewLogoutHandler(
	sessionRepo session.Repository,
) LogoutHandler {
	if sessionRepo == nil {
		panic("nil sessionRepo")
	}

	return logoutHandler{
		sessionRepo: sessionRepo,
	}
}

func (h logoutHandler) Handle(ctx context.Context, cmd Logout) error {
	err := h.sessionRepo.DeleteSession(ctx, cmd.SessionID)
	if err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}
