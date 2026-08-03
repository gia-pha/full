package app

import (
	"auth-passkey/app/command"
	"auth-passkey/app/query"
)

type Application struct {
	Commands Commands
	Queries  Queries
}

type Commands struct {
	BeginRegistration  command.BeginRegistrationHandler
	FinishRegistration command.FinishRegistrationHandler

	BeginLogin  command.BeginLoginHandler
	FinishLogin command.FinishLoginHandler
}

type Queries struct {
	IsSessionValid query.IsSessionValidHandler
}
