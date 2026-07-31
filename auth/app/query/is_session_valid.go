package query

import (
	"context"

	"auth-passkey/domain/session"
)

type IsSessionValid struct {
	SessionID string
}

type IsSessionValidHandler interface {
	Handle(ctx context.Context, query IsSessionValid) (bool, error)
}

type isSessionValidHandler struct {
	sessionRepo session.Repository
}

func NewIsSessionValidHandler(sessionRepo session.Repository) IsSessionValidHandler {
	if sessionRepo == nil {
		panic("nil sessionRepo")
	}

	return isSessionValidHandler{sessionRepo: sessionRepo}
}

func (h isSessionValidHandler) Handle(ctx context.Context, q IsSessionValid) (bool, error) {
	data, ok := h.sessionRepo.GetSession(ctx, q.SessionID)
	if !ok {
		return false, nil
	}

	if session.IsExpired(data) {
		return false, nil
	}

	return true, nil
}
