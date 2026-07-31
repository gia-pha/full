package session

import (
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

func IsExpired(data webauthn.SessionData) bool {
	return data.Expires.Before(time.Now())
}
