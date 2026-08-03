package adapters

import (
	"context"
	"crypto/rand"
	"encoding/base64"

	"auth-passkey/common/logger"

	"github.com/go-webauthn/webauthn/webauthn"
)

type MemorySessionRepository struct {
	sessions map[string]webauthn.SessionData
	log      logger.Logger
}

func NewMemorySessionRepository(log logger.Logger) *MemorySessionRepository {
	return &MemorySessionRepository{
		sessions: make(map[string]webauthn.SessionData),
		log:      log,
	}
}

func (r *MemorySessionRepository) GenerateID(ctx context.Context) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func (r *MemorySessionRepository) GetSession(ctx context.Context, token string) (webauthn.SessionData, bool) {
	r.log.Printf("[DEBUG] GetSession: %v", token)
	val, ok := r.sessions[token]
	return val, ok
}

func (r *MemorySessionRepository) SaveSession(ctx context.Context, token string, data webauthn.SessionData) error {
	r.log.Printf("[DEBUG] SaveSession: %s", token)
	r.sessions[token] = data
	return nil
}

func (r *MemorySessionRepository) DeleteSession(ctx context.Context, token string) error {
	r.log.Printf("[DEBUG] DeleteSession: %v", token)
	delete(r.sessions, token)
	return nil
}
