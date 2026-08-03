package user

import (
	"context"
)

type Repository interface {
	GetOrCreateUser(ctx context.Context, userName string) (*User, error)
	SaveUser(ctx context.Context, user *User) error
}
