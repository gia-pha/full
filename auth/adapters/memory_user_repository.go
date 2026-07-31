package adapters

import (
	"context"

	"auth-passkey/common/logger"
	"auth-passkey/domain/user"
)

type MemoryUserRepository struct {
	users map[string]*user.User
	log   logger.Logger
}

func NewMemoryUserRepository(log logger.Logger) *MemoryUserRepository {
	return &MemoryUserRepository{
		users: make(map[string]*user.User),
		log:   log,
	}
}

func (r *MemoryUserRepository) GetOrCreateUser(ctx context.Context, userName string) (*user.User, error) {
	r.log.Printf("[DEBUG] GetOrCreate user: %v", userName)

	if _, ok := r.users[userName]; !ok {
		r.log.Printf("[DEBUG] Creating new user: %v", userName)
		r.users[userName] = user.NewUser(userName)
	}

	return r.users[userName], nil
}

func (r *MemoryUserRepository) SaveUser(ctx context.Context, u *user.User) error {
	r.log.Printf("[DEBUG] SaveUser: %v", u.WebAuthnName())
	r.users[u.WebAuthnName()] = u
	return nil
}
