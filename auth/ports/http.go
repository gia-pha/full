package ports

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"

	"auth-passkey/app"
	"auth-passkey/app/command"
	"auth-passkey/app/query"
)

type HttpServer struct {
	app    app.Application
	log    *slog.Logger
	secure bool
}

func NewHttpServer(application app.Application, log *slog.Logger, secure bool) *HttpServer {
	return &HttpServer{
		app:    application,
		log:    log,
		secure: secure,
	}
}

func (h *HttpServer) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/passkey/registerStart", CORSHandler(h.log, h.BeginRegistration))
	mux.HandleFunc("/api/passkey/registerFinish", CORSHandler(h.log, h.FinishRegistration))
	mux.HandleFunc("/api/passkey/loginStart", CORSHandler(h.log, h.BeginLogin))
	mux.HandleFunc("/api/passkey/loginFinish", CORSHandler(h.log, h.FinishLogin))
	mux.HandleFunc("/api/user-info", CORSHandler(h.log, h.UserInfo))
	mux.HandleFunc("/api/logout", CORSHandler(h.log, h.Logout))
}

func (h *HttpServer) BeginRegistration(w http.ResponseWriter, r *http.Request) {
	h.log.Info("Begin registration ----------------------\\")

	name := getName(r)

	result, err := h.app.Commands.BeginRegistration.Handle(r.Context(), command.BeginRegistration{
		Name: name,
	})
	if err != nil {
		h.log.Error("Can't begin registration: ", "err", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, h.cookieOptions(result.SessionID, 3600))

	jsonResponse(w, result.Options, http.StatusOK)
}

func (h *HttpServer) FinishRegistration(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		jsonResponse(w, "session id not found", http.StatusBadRequest)
		return
	}

	result, err := h.app.Commands.FinishRegistration.Handle(r.Context(), command.FinishRegistration{
		SessionID: sid.Value,
		Request:   r,
	})
	if err != nil {
		h.log.Error("Can't finish registration: ", "err", err.Error())
		http.SetCookie(w, h.cookieOptions("", -1))
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, h.cookieOptions(result.NewSessionID, 3600))
	h.log.Info("Finish registration ----------------------/")
	jsonResponse(w, "Registration Success", http.StatusOK)
}

func (h *HttpServer) BeginLogin(w http.ResponseWriter, r *http.Request) {
	h.log.Info("Begin login ----------------------\\")

	result, err := h.app.Commands.BeginLogin.Handle(r.Context(), command.BeginLogin{})
	if err != nil {
		h.log.Error("Can't begin login: ", "err", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, h.cookieOptions(result.SessionID, 3600))

	jsonResponse(w, result.Options, http.StatusOK)
}

func (h *HttpServer) FinishLogin(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		jsonResponse(w, "session id not found", http.StatusBadRequest)
		return
	}

	result, err := h.app.Commands.FinishLogin.Handle(r.Context(), command.FinishLogin{
		SessionID: sid.Value,
		Request:   r,
	})
	if err != nil {
		h.log.Error("Can't finish login: ", "err", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, h.cookieOptions(result.NewSessionID, 3600))

	h.log.Info("Finish login ----------------------/")
	jsonResponse(w, "Login Success", http.StatusOK)
}

func (h *HttpServer) UserInfo(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		jsonResponse(w, "session id not found", http.StatusBadRequest)
		return
	}

	result, err := h.app.Queries.UserInfo.Handle(r.Context(), query.UserInfo{
		SessionID: sid.Value,
	})
	if err != nil {
		h.log.Error("Can't get user info: ", "err", err.Error())
		jsonResponse(w, nil, http.StatusInternalServerError)
		return
	}

	h.log.Info("[INFO] current user information ----------------------/")
	jsonResponse(w, map[string]any{
		"id":   result.WebAuthnID(),
		"name": result.WebAuthnName(),
	}, http.StatusOK)
}

func (h *HttpServer) Logout(w http.ResponseWriter, r *http.Request) {
	// Get the session key from cookie
	sid, err := r.Cookie("sid")
	if err != nil {
		jsonResponse(w, "session id not found", http.StatusBadRequest)
		return
	}
	err = h.app.Commands.Logout.Handle(r.Context(), command.Logout{
		SessionID: sid.Value,
	})
	if err != nil {
		h.log.Error("Can't logout: ", "err", err.Error())
		jsonResponse(w, nil, http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, h.cookieOptions("", -1))
	w.WriteHeader(http.StatusNoContent)
}

func (h *HttpServer) LoggedInMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		sid, err := r.Cookie("sid")
		if err != nil {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		valid, err := h.app.Queries.IsSessionValid.Handle(r.Context(), query.IsSessionValid{
			SessionID: sid.Value,
		})
		if err != nil || !valid {
			http.Redirect(w, r, "/", http.StatusSeeOther)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// cookieOptions returns the common cookie configuration based on environment
func (h *HttpServer) cookieOptions(value string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     "sid",
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		Secure:   h.secure,
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
}

func jsonResponse(w http.ResponseWriter, data any, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func getName(r *http.Request) string {
	type Name struct {
		Name string `json:"name"`
	}
	var u Name
	err := json.NewDecoder(r.Body).Decode(&u)
	if err == nil || u.Name != "" {
		return u.Name
	}
	return randomName()
}

func randomName() string {
	b := make([]byte, 3) // 3 bytes = 6 hex chars
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}

	return fmt.Sprintf("User %s", hex.EncodeToString(b))
}
