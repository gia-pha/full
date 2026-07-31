package ports

import (
	"encoding/json"
	"net/http"

	"auth-passkey/app"
	"auth-passkey/app/command"
	"auth-passkey/app/query"
	"auth-passkey/common/logger"
)

type HttpServer struct {
	app app.Application
	log logger.Logger
}

func NewHttpServer(application app.Application, log logger.Logger) *HttpServer {
	return &HttpServer{
		app: application,
		log: log,
	}
}

func (h *HttpServer) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "http://localhost:8081", http.StatusFound)
	})

	mux.HandleFunc("/api/passkey/registerStart", CORSHandler(h.BeginRegistration))
	mux.HandleFunc("/api/passkey/registerFinish", CORSHandler(h.FinishRegistration))
	mux.HandleFunc("/api/passkey/loginStart", CORSHandler(h.BeginLogin))
	mux.HandleFunc("/api/passkey/loginFinish", CORSHandler(h.FinishLogin))
	mux.Handle("/private", h.LoggedInMiddleware(http.HandlerFunc(h.PrivatePage)))
}

func (h *HttpServer) BeginRegistration(w http.ResponseWriter, r *http.Request) {
	h.log.Printf("[INFO] begin registration ----------------------\\")

	username, err := getUsername(r)
	if err != nil {
		h.log.Printf("[ERRO] can't get user name: %s", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.app.Commands.BeginRegistration.Handle(r.Context(), command.BeginRegistration{
		Username: username,
	})
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

func (h *HttpServer) FinishRegistration(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		h.log.Printf("[ERRO] can't get session id: %s", err.Error())
		jsonResponse(w, "session not found", http.StatusBadRequest)
		return
	}

	err = h.app.Commands.FinishRegistration.Handle(r.Context(), command.FinishRegistration{
		SessionID: sid.Value,
		Request:   r,
	})
	if err != nil {
		h.log.Printf("[ERRO] can't finish registration: %s", err.Error())
		http.SetCookie(w, &http.Cookie{Name: "sid", Value: ""})
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	http.SetCookie(w, &http.Cookie{Name: "sid", Value: ""})
	h.log.Printf("[INFO] finish registration ----------------------/")
	jsonResponse(w, "Registration Success", http.StatusOK)
}

func (h *HttpServer) BeginLogin(w http.ResponseWriter, r *http.Request) {
	h.log.Printf("[INFO] begin login ----------------------\\")

	username, err := getUsername(r)
	if err != nil {
		h.log.Printf("[ERRO] can't get user name: %s", err.Error())
		jsonResponse(w, err.Error(), http.StatusBadRequest)
		return
	}

	result, err := h.app.Commands.BeginLogin.Handle(r.Context(), command.BeginLogin{
		Username: username,
	})
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

func (h *HttpServer) FinishLogin(w http.ResponseWriter, r *http.Request) {
	sid, err := r.Cookie("sid")
	if err != nil {
		h.log.Printf("[ERRO] can't get session id: %s", err.Error())
		jsonResponse(w, "session not found", http.StatusBadRequest)
		return
	}

	result, err := h.app.Commands.FinishLogin.Handle(r.Context(), command.FinishLogin{
		SessionID: sid.Value,
		Request:   r,
	})
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

func (h *HttpServer) PrivatePage(w http.ResponseWriter, r *http.Request) {
	_, _ = w.Write([]byte("Hello, World!"))
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
