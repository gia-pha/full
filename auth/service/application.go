package service

import (
	"auth-passkey/adapters"
	"auth-passkey/app"
	"auth-passkey/app/command"
	"auth-passkey/app/query"
	"auth-passkey/common/logger"

	"github.com/go-webauthn/webauthn/webauthn"
)

func NewApplication(webAuthn *webauthn.WebAuthn, log logger.Logger) app.Application {
	userRepo := adapters.NewMemoryUserRepository(log)
	sessionRepo := adapters.NewMemorySessionRepository(log)

	return app.Application{
		Commands: app.Commands{
			BeginRegistration:  command.NewBeginRegistrationHandler(webAuthn, userRepo, sessionRepo),
			FinishRegistration: command.NewFinishRegistrationHandler(webAuthn, userRepo, sessionRepo),
			BeginLogin:         command.NewBeginLoginHandler(webAuthn, userRepo, sessionRepo),
			FinishLogin:        command.NewFinishLoginHandler(webAuthn, userRepo, sessionRepo, log),
		},
		Queries: app.Queries{
			IsSessionValid: query.NewIsSessionValidHandler(sessionRepo),
		},
	}
}
