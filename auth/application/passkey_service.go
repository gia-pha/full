package application

import (
	domain "auth-passkey/domain/entities"
	"net/http"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

type PasskeyService struct {
	webAuthn    *webauthn.WebAuthn
	userRepo    domain.UserRepository
	sessionRepo domain.SessionRepository
}

func NewPasskeyService(
	webAuthn *webauthn.WebAuthn,
	userRepo domain.UserRepository,
	sessionRepo domain.SessionRepository,
) *PasskeyService {
	return &PasskeyService{
		webAuthn:    webAuthn,
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
	}
}

type BeginRegistrationResult struct {
	Options   *protocol.CredentialCreation
	SessionID string
}

func (s *PasskeyService) BeginRegistration(username string) (*BeginRegistrationResult, error) {
	user := s.userRepo.GetOrCreate(username)

	options, session, err := s.webAuthn.BeginRegistration(user)
	if err != nil {
		return nil, err
	}

	sessionID, err := s.sessionRepo.GenerateID()
	if err != nil {
		return nil, err
	}

	s.sessionRepo.Save(sessionID, *session)

	return &BeginRegistrationResult{
		Options:   options,
		SessionID: sessionID,
	}, nil
}

func (s *PasskeyService) FinishRegistration(sessionID string, r *http.Request) error {
	session, _ := s.sessionRepo.Get(sessionID)

	user := s.userRepo.GetOrCreate(string(session.UserID))

	credential, err := s.webAuthn.FinishRegistration(user, session, r)
	if err != nil {
		return err
	}

	user.AddCredential(credential)
	s.userRepo.Save(user)
	s.sessionRepo.Delete(sessionID)

	return nil
}

type BeginLoginResult struct {
	Options   *protocol.CredentialAssertion
	SessionID string
}

func (s *PasskeyService) BeginLogin(username string) (*BeginLoginResult, error) {
	user := s.userRepo.GetOrCreate(username)

	options, session, err := s.webAuthn.BeginLogin(user)
	if err != nil {
		return nil, err
	}

	sessionID, err := s.sessionRepo.GenerateID()
	if err != nil {
		return nil, err
	}

	s.sessionRepo.Save(sessionID, *session)

	return &BeginLoginResult{
		Options:   options,
		SessionID: sessionID,
	}, nil
}

type FinishLoginResult struct {
	NewSessionID string
}

func (s *PasskeyService) FinishLogin(sessionID string, r *http.Request) (*FinishLoginResult, error) {
	session, _ := s.sessionRepo.Get(sessionID)

	user := s.userRepo.GetOrCreate(string(session.UserID))

	credential, err := s.webAuthn.FinishLogin(user, session, r)
	if err != nil {
		return nil, err
	}

	if credential.Authenticator.CloneWarning {
		// Log warning
	}

	user.UpdateCredential(credential)
	s.userRepo.Save(user)
	s.sessionRepo.Delete(sessionID)

	newSessionID, err := s.sessionRepo.GenerateID()
	if err != nil {
		return nil, err
	}

	return &FinishLoginResult{
		NewSessionID: newSessionID,
	}, nil
}

func (s *PasskeyService) IsSessionValid(sessionID string) bool {
	_, ok := s.sessionRepo.Get(sessionID)
	return ok
}
