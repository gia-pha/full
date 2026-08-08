package query

import "errors"

var ErrSessionNotFound = errors.New("session not found")

var ErrSessionExpired = errors.New("session expired")
