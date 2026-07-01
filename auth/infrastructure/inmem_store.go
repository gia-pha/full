package infrastructure

import (
	domain "auth-passkey/domain/entities"
	"crypto/rand"
	"encoding/base64"

	"github.com/go-webauthn/webauthn/webauthn"
)

type Logger interface {
	Printf(format string, v ...interface{})
}

type InMemUserRepository struct {
	users map[string]*domain.User
	log   Logger
}

func NewInMemUserRepository(log Logger) *InMemUserRepository {
	return &InMemUserRepository{
		users: make(map[string]*domain.User),
		log:   log,
	}
}

func (r *InMemUserRepository) GetOrCreate(userName string) *domain.User {
	r.log.Printf("[DEBUG] GetOrCreate user: %v", userName)
	if _, ok := r.users[userName]; !ok {
		r.log.Printf("[DEBUG] Creating new user: %v", userName)
		r.users[userName] = &domain.User{
			ID:          []byte(userName),
			DisplayName: userName,
			Name:        userName,
		}
	}
	return r.users[userName]
}

func (r *InMemUserRepository) Save(user *domain.User) {
	r.log.Printf("[DEBUG] SaveUser: %v", user.WebAuthnName())
	r.users[user.WebAuthnName()] = user
}

type InMemSessionRepository struct {
	sessions map[string]webauthn.SessionData
	log      Logger
}

func NewInMemSessionRepository(log Logger) *InMemSessionRepository {
	return &InMemSessionRepository{
		sessions: make(map[string]webauthn.SessionData),
		log:      log,
	}
}

func (r *InMemSessionRepository) GenerateID() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

func (r *InMemSessionRepository) Get(token string) (webauthn.SessionData, bool) {
	r.log.Printf("[DEBUG] GetSession: %v", token)
	val, ok := r.sessions[token]
	return val, ok
}

func (r *InMemSessionRepository) Save(token string, data webauthn.SessionData) {
	r.log.Printf("[DEBUG] SaveSession: %s", token)
	r.sessions[token] = data
}

func (r *InMemSessionRepository) Delete(token string) {
	r.log.Printf("[DEBUG] DeleteSession: %v", token)
	delete(r.sessions, token)
}
