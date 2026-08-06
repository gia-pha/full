package ports

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"auth-passkey/app"
	"auth-passkey/app/command"
	"auth-passkey/app/query"
)

type HttpServer struct {
	app app.Application
	log *slog.Logger
}

func NewHttpServer(application app.Application, log *slog.Logger) *HttpServer {
	return &HttpServer{
		app: application,
		log: log,
	}
}

func (h *HttpServer) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/passkey/registerStart", CORSHandler(h.log, h.BeginRegistration))
	mux.HandleFunc("/api/passkey/registerFinish", CORSHandler(h.log, h.FinishRegistration))
	mux.HandleFunc("/api/passkey/loginStart", CORSHandler(h.log, h.BeginLogin))
	mux.HandleFunc("/api/passkey/loginFinish", CORSHandler(h.log, h.FinishLogin))
}

func (h *HttpServer) BeginRegistration(w http.ResponseWriter, r *http.Request) {
	h.log.Info("Begin registration ----------------------\\")

	username, err := getUsername(r)
	if err != nil {
		h.log.Error("Can't get user name: ", "err", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.app.Commands.BeginRegistration.Handle(r.Context(), command.BeginRegistration{
		Username: username,
	})
	if err != nil {
		h.log.Error("Can't begin registration: ", "err", err.Error())
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

func (h *HttpServer) FinishRegistration(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		h.log.Error("Can't get session id: ", "err", err.Error())
		jsonResponse(w, "session not found", http.StatusBadRequest)
		return
	}

	err = h.app.Commands.FinishRegistration.Handle(r.Context(), command.FinishRegistration{
		SessionID: sid.Value,
		Request:   r,
	})
	if err != nil {
		h.log.Error("Can't finish registration: ", "err", err.Error())
		http.SetCookie(w, &http.Cookie{Name: "sid", Value: ""})
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{Name: "sid", Value: ""})
	h.log.Info("Finish registration ----------------------/")
	jsonResponse(w, "Registration Success", http.StatusOK)
}

func (h *HttpServer) BeginLogin(w http.ResponseWriter, r *http.Request) {
	h.log.Info("Begin login ----------------------\\")

	username, err := getUsername(r)
	if err != nil {
		h.log.Error("Can't get user name: ", "err", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.app.Commands.BeginLogin.Handle(r.Context(), command.BeginLogin{
		Username: username,
	})
	if err != nil {
		h.log.Error("Can't begin login: ", "err", err.Error())
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

func (h *HttpServer) FinishLogin(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		h.log.Error("Can't get session id: ", "err", err.Error())
		jsonResponse(w, "session not found", http.StatusBadRequest)
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

	h.log.Info("Finish login ----------------------/")
	jsonResponse(w, "Login Success", http.StatusOK)
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
