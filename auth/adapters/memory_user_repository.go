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

func (r *MemoryUserRepository) GetUser(ctx context.Context, id string) (*user.User, error) {
	r.log.Debug("GetUser: ", "id", id)

	if _, ok := r.users[id]; !ok {
		return nil, ErrUserNotFound
	}

	return r.users[id], nil
}

func (r *MemoryUserRepository) SaveUser(ctx context.Context, u *user.User) error {
	r.log.Debug("SaveUser: ", "id", string(u.WebAuthnID()))
	r.users[string(u.WebAuthnID())] = u
	return nil
}
