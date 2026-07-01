package entities

import "github.com/go-webauthn/webauthn/webauthn"

type User struct {
	ID          []byte
	DisplayName string
	Name        string
	Credentials []webauthn.Credential
}

func (u *User) WebAuthnID() []byte {
	return u.ID
}

func (u *User) WebAuthnName() string {
	return u.Name
}

func (u *User) WebAuthnDisplayName() string {
	return u.DisplayName
}

func (u *User) WebAuthnIcon() string {
	return "https://pics.com/avatar.png"
}

func (u *User) WebAuthnCredentials() []webauthn.Credential {
	return u.Credentials
}

func (u *User) AddCredential(credential *webauthn.Credential) {
	u.Credentials = append(u.Credentials, *credential)
}

func (u *User) UpdateCredential(credential *webauthn.Credential) {
	for i, c := range u.Credentials {
		if string(c.ID) == string(credential.ID) {
			u.Credentials[i] = *credential
		}
	}
}

type UserRepository interface {
	GetOrCreate(userName string) *User
	Save(user *User)
}

type SessionRepository interface {
	GenerateID() (string, error)
	Get(token string) (webauthn.SessionData, bool)
	Save(token string, data webauthn.SessionData)
	Delete(token string)
}
