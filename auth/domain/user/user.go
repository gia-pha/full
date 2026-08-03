package user

import "github.com/go-webauthn/webauthn/webauthn"

type User struct {
	id          []byte
	name        string
	displayName string
	credentials []webauthn.Credential
}

func NewUser(name string) *User {
	return &User{
		id:          []byte(name),
		name:        name,
		displayName: name,
	}
}

func UnmarshalUserFromDatabase(id []byte, name, displayName string, credentials []webauthn.Credential) *User {
	return &User{
		id:          id,
		name:        name,
		displayName: displayName,
		credentials: credentials,
	}
}

func (u *User) WebAuthnID() []byte {
	return u.id
}

func (u *User) WebAuthnName() string {
	return u.name
}

func (u *User) WebAuthnDisplayName() string {
	return u.displayName
}

func (u *User) WebAuthnIcon() string {
	return "https://pics.com/avatar.png"
}

func (u *User) WebAuthnCredentials() []webauthn.Credential {
	return u.credentials
}

func (u *User) AddCredential(credential *webauthn.Credential) {
	u.credentials = append(u.credentials, *credential)
}

func (u *User) UpdateCredential(credential *webauthn.Credential) {
	for i, c := range u.credentials {
		if string(c.ID) == string(credential.ID) {
			u.credentials[i] = *credential
			return
		}
	}
}
