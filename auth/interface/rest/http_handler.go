package rest

import (
	"auth-passkey/application"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

type Logger interface {
	Printf(format string, v ...interface{})
}

type PasskeyHandler struct {
	service     *application.PasskeyService
	sessionRepo sessionGetter
	log         Logger
}

type sessionGetter interface {
	Get(token string) (webauthn.SessionData, bool)
}

func NewPasskeyHandler(
	service *application.PasskeyService,
	sessionRepo sessionGetter,
	log Logger,
) *PasskeyHandler {
	return &PasskeyHandler{
		service:     service,
		sessionRepo: sessionRepo,
		log:         log,
	}
}

func (h *PasskeyHandler) RegisterRoutes(mux *http.ServeMux) {
	// mux.Handle("/", http.FileServer(http.Dir("./web")))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "http://localhost:8081", http.StatusFound)
	})

	mux.HandleFunc("/api/passkey/registerStart", CORSHandler(h.BeginRegistration))
	mux.HandleFunc("/api/passkey/registerFinish", CORSHandler(h.FinishRegistration))
	mux.HandleFunc("/api/passkey/loginStart", CORSHandler(h.BeginLogin))
	mux.HandleFunc("/api/passkey/loginFinish", CORSHandler(h.FinishLogin))
	mux.Handle("/private", h.LoggedInMiddleware(http.HandlerFunc(h.PrivatePage)))
}

func (h *PasskeyHandler) BeginRegistration(w http.ResponseWriter, r *http.Request) {
	h.log.Printf("[INFO] begin registration ----------------------\\")

	username, err := getUsername(r)
	if err != nil {
		h.log.Printf("[ERRO] can't get user name: %s", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.service.BeginRegistration(username)
	if err != nil {
		h.log.Printf("[ERRO] can't begin registration: %s", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sid",
		Value:    result.SessionID,
		Path:     "api/passkey/registerStart",
		MaxAge:   3600,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	jsonResponse(w, result.Options, http.StatusOK)
}

func (h *PasskeyHandler) FinishRegistration(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		h.log.Printf("[ERRO] can't get session id: %s", err.Error())
		jsonResponse(w, "session not found", http.StatusBadRequest)
		return
	}

	if err := h.service.FinishRegistration(sid.Value, r); err != nil {
		h.log.Printf("[ERRO] can't finish registration: %s", err.Error())
		http.SetCookie(w, &http.Cookie{Name: "sid", Value: ""})
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{Name: "sid", Value: ""})
	h.log.Printf("[INFO] finish registration ----------------------/")
	jsonResponse(w, "Registration Success", http.StatusOK)
}

func (h *PasskeyHandler) BeginLogin(w http.ResponseWriter, r *http.Request) {
	h.log.Printf("[INFO] begin login ----------------------\\")

	username, err := getUsername(r)
	if err != nil {
		h.log.Printf("[ERRO] can't get user name: %s", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.service.BeginLogin(username)
	if err != nil {
		h.log.Printf("[ERRO] can't begin login: %s", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sid",
		Value:    result.SessionID,
		Path:     "api/passkey/loginStart",
		MaxAge:   3600,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	jsonResponse(w, result.Options, http.StatusOK)
}

func (h *PasskeyHandler) FinishLogin(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		h.log.Printf("[ERRO] can't get session id: %s", err.Error())
		jsonResponse(w, "session not found", http.StatusBadRequest)
		return
	}

	result, err := h.service.FinishLogin(sid.Value, r)
	if err != nil {
		h.log.Printf("[ERRO] can't finish login: %s", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{Name: "sid", Value: ""})

	http.SetCookie(w, &http.Cookie{
		Name:     "sid",
		Value:    result.NewSessionID,
		Path:     "/",
		MaxAge:   3600,
		Secure:   true,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	h.log.Printf("[INFO] finish login ----------------------/")
	jsonResponse(w, "Login Success", http.StatusOK)
}

func (h *PasskeyHandler) PrivatePage(w http.ResponseWriter, r *http.Request) {
	_, _ = w.Write([]byte("Hello, World!"))
}

func (h *PasskeyHandler) LoggedInMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sid, err := r.Cookie("sid")
		if err != nil {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		session, ok := h.sessionRepo.Get(sid.Value)
		if !ok {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		if session.Expires.Before(time.Now()) {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func jsonResponse(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func getUsername(r *http.Request) (string, error) {
	type Username struct {
		Username string `json:"username"`
	}
	var u Username
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		return "", err
	}
	return u.Username, nil
}

func CORSHandler(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		if origin == "http://localhost:8081" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}
