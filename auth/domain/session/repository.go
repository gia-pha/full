package session

import (
	"context"

	"github.com/go-webauthn/webauthn/webauthn"
)

type Repository interface {
	GenerateID(ctx context.Context) (string, error)
	GetSession(ctx context.Context, token string) (webauthn.SessionData, bool)
	SaveSession(ctx context.Context, token string, data webauthn.SessionData) error
	DeleteSession(ctx context.Context, token string) error
}
