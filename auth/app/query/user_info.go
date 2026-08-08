package query

import (
	"context"
	"fmt"

	"auth-passkey/domain/session"
	"auth-passkey/domain/user"
)

type UserInfo struct {
	SessionID string
}

type UserInfoHandler interface {
	Handle(ctx context.Context, query UserInfo) (*user.User, error)
}

type userInfoHandler struct {
	sessionRepo session.Repository
	userRepo    user.Repository
}

func NewUserInfoHandler(sessionRepo session.Repository, userRepo user.Repository) UserInfoHandler {
	if sessionRepo == nil {
		panic("nil sessionRepo")
	}

	if userRepo == nil {
		panic("nil userRepo")
	}

	return userInfoHandler{sessionRepo, userRepo}
}

func (h userInfoHandler) Handle(ctx context.Context, q UserInfo) (*user.User, error) {
	sessionData, ok := h.sessionRepo.GetSession(ctx, q.SessionID)
	if !ok {
		return nil, ErrSessionNotFound
	}

	if session.IsExpired(sessionData) {
		return nil, ErrSessionExpired
	}

	userData, err := h.userRepo.GetUser(ctx, string(sessionData.UserID))
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return userData, nil
}
