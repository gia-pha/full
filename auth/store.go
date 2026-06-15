package main

import (
	"crypto/rand"
	"encoding/base64"
	"errors"

	"github.com/go-webauthn/webauthn/webauthn"
)

type InMem struct {
	// TODO: it would be nice to have a mutex here
	// TODO: use pointers to avoid copying
	users    map[string]PasskeyUser
	sessions map[string]webauthn.SessionData

	log Logger
}

func (i *InMem) GenSessionID() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}

	return base64.URLEncoding.EncodeToString(b), nil

}

func NewInMem(log Logger) *InMem {
	return &InMem{
		users:    make(map[string]PasskeyUser),
		sessions: make(map[string]webauthn.SessionData),
		log:      log,
	}
}

func (i *InMem) GetSession(token string) (webauthn.SessionData, bool) {
	i.log.Printf("[DEBUG] GetSession: %s", token)
	i.log.Printf("[DEBUG] GetSession: %+v", i.sessions[token])
	val, ok := i.sessions[token]

	return val, ok
}

func (i *InMem) SaveSession(token string, data webauthn.SessionData) {
	i.log.Printf("[DEBUG] SaveSession: %s", token)
	i.log.Printf("[DEBUG] SaveSession: %+v", data)
	i.sessions[token] = data
}

func (i *InMem) DeleteSession(token string) {
	i.log.Printf("[DEBUG] DeleteSession: %s", token)
	delete(i.sessions, token)
}

func (i *InMem) GetUser(userName string) (PasskeyUser, error) {
	i.log.Printf("[DEBUG] GetUser: %s", userName)
	if _, ok := i.users[userName]; !ok {
		return nil, UserNotFound
	}

	return i.users[userName], nil
}

func (i *InMem) SaveUser(user PasskeyUser) {
	i.log.Printf("[DEBUG] SaveUser: %s", string(user.WebAuthnID()))
	i.log.Printf("[DEBUG] SaveUser: %+v", user)
	i.users[string(user.WebAuthnID())] = user
}

var UserNotFound = errors.New("auth: user not found")
