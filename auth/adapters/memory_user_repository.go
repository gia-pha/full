package adapters

import (
	"context"
	"log/slog"

	"auth-passkey/domain/user"
)

type MemoryUserRepository struct {
	users map[string]*user.User
	log   *slog.Logger
}

func NewMemoryUserRepository(log *slog.Logger) *MemoryUserRepository {
	return &MemoryUserRepository{
		users: make(map[string]*user.User),
		log:   log,
	}
}

func (r *MemoryUserRepository) GetOrCreateUser(ctx context.Context, userName string) (*user.User, error) {
	r.log.Debug("GetOrCreate user: ", "userName", userName)

	if _, ok := r.users[userName]; !ok {
		r.log.Debug("Creating new user: ", "userName", userName)
		r.users[userName] = user.NewUser(userName)
	}

	return r.users[userName], nil
}

func (r *MemoryUserRepository) SaveUser(ctx context.Context, u *user.User) error {
	r.log.Debug("SaveUser: ", "u.WebAuthnName()", u.WebAuthnName())
	r.users[u.WebAuthnName()] = u
	return nil
}
