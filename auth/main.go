package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
)

var (
	webAuthn *webauthn.WebAuthn
	err      error

	datastore PasskeyStore
	//sessions  SessionStore
	l        Logger
	isSecure bool
)

type Logger interface {
	Printf(format string, v ...interface{})
}

type PasskeyUser interface {
	webauthn.User
	AddCredential(*webauthn.Credential)
	UpdateCredential(*webauthn.Credential)
}

type PasskeyStore interface {
	GetOrCreateUser(userName string) PasskeyUser
	SaveUser(PasskeyUser)
	GenSessionID() (string, error)
	GetSession(token string) (webauthn.SessionData, bool)
	SaveSession(token string, data webauthn.SessionData)
	DeleteSession(token string)
}

func main() {
	l = log.Default()

	isSecure = getEnv("SECURE", "false") == "true"
	host := getEnv("HOST", "localhost")
	port := getEnv("PORT", ":8080")
	origin := fmt.Sprintf("%s://%s%s", map[bool]string{true: "https", false: "http"}[isSecure], host, port)
	extraOrigins := getEnv("EXTRA_ORIGINS", "")

	// Additional origins allowed for WebAuthn (e.g. auth-ui on port 8081)
	var origins []string
	origins = append(origins, origin)
	if extraOrigins != "" {
		for _, o := range strings.Split(extraOrigins, ",") {
			origins = append(origins, strings.TrimSpace(o))
		}
	}

	l.Printf("[INFO] make webauthn config, origins: %v", origins)
	wconfig := &webauthn.Config{
		RPDisplayName: "Go Webauthn", // Display Name for your site
		RPID:          host,          // Generally the FQDN for your site
		RPOrigins:     origins,       // The origin URLs allowed for WebAuthn
	}

	l.Printf("[INFO] create webauthn")
	if webAuthn, err = webauthn.New(wconfig); err != nil {
		fmt.Printf("[FATA] %s", err.Error())
		os.Exit(1)
	}

	l.Printf("[INFO] create datastore")
	datastore = NewInMem(l)

	l.Printf("[INFO] register routes")
	// Serve the web files
	http.Handle("/", http.FileServer(http.Dir("./web")))

	// Add auth the routes
	http.HandleFunc("/api/passkey/registerStart", CORSHandler(BeginRegistration))
	http.HandleFunc("/api/passkey/registerFinish", CORSHandler(FinishRegistration))
	http.HandleFunc("/api/passkey/loginStart", CORSHandler(BeginLogin))
	http.HandleFunc("/api/passkey/loginFinish", CORSHandler(FinishLogin))

	http.Handle("/private", LoggedInMiddleware(http.HandlerFunc(PrivatePage)))

	// Start the server
	l.Printf("[INFO] start server at %s", origin)
	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Println(err)
	}
}

func BeginRegistration(w http.ResponseWriter, r *http.Request) {
	l.Printf("[INFO] begin registration ----------------------\\")

	// Generate a new user handle (random 64 bytes)
	userName := make([]byte, 64)
	rand.Read(userName)

	user := User{
		ID:          []byte(userName),
		DisplayName: "Test User", // not known yet
		Name:        "test-user", // not known yet
	}

	opts := []webauthn.RegistrationOption{
		webauthn.WithResidentKeyRequirement(protocol.ResidentKeyRequirementRequired),
		webauthn.WithExclusions(webauthn.Credentials(user.WebAuthnCredentials()).CredentialDescriptors()),
		webauthn.WithExtensions(map[string]any{"credProps": true}),
	}

	options, session, err := webAuthn.BeginRegistration(&user, opts...)
	if err != nil {
		msg := fmt.Sprintf("can't begin registration: %s", err.Error())
		l.Printf("[ERRO] %s", msg)
		JSONResponse(w, msg, http.StatusBadRequest)

		return
	}

	// Make a session key and store the sessionData values
	t, err := datastore.GenSessionID()
	if err != nil {
		l.Printf("[ERRO] can't generate session id: %s", err.Error())

		panic(err) // FIXME: handle error
	}

	datastore.SaveSession(t, *session)

	http.SetCookie(w, cookieOptions(t, 3600))

	JSONResponse(w, options, http.StatusOK) // return the options generated with the session key
	// options.publicKey contain our registration options
}

func FinishRegistration(w http.ResponseWriter, r *http.Request) {
	// Get the session key from cookie
	sid, err := r.Cookie("sid")
	if err != nil {
		l.Printf("[ERRO] can't get session id: %s", err.Error())

		panic(err) // FIXME: handle error
	}

	l.Printf("[DEBUG] FinishRegistration cookie sid: %q", sid.Value)

	// Get the session data stored from the function above
	session, ok := datastore.GetSession(sid.Value)
	if !ok {
		l.Printf("[ERRO] session not found for key: %q", sid.Value)
		JSONResponse(w, "Session not found", http.StatusNotFound)
		return
	}

	// In out example username == userID, but in real world it should be different
	user := datastore.GetOrCreateUser(string(session.UserID)) // Get the user

	credential, err := webAuthn.FinishRegistration(user, session, r)
	if err != nil {
		msg := fmt.Sprintf("can't finish registration: %s", err.Error())
		l.Printf("[ERRO] %s", msg)
		http.SetCookie(w, cookieOptions("", -1))
		JSONResponse(w, msg, http.StatusBadRequest)

		return
	}

	// If creation was successful, store the credential object
	user.AddCredential(credential)
	datastore.SaveUser(user)
	// Delete the session data
	datastore.DeleteSession(sid.Value)
	http.SetCookie(w, cookieOptions("", -1))

	l.Printf("[INFO] finish registration ----------------------/")
	JSONResponse(w, "Registration Success", http.StatusOK) // Handle next steps
}

func BeginLogin(w http.ResponseWriter, r *http.Request) {
	l.Printf("[INFO] begin login ----------------------\\")

	options, session, err := webAuthn.BeginDiscoverableLogin()
	if err != nil {
		msg := fmt.Sprintf("can't begin login: %s", err.Error())
		l.Printf("[ERRO] %s", msg)
		JSONResponse(w, msg, http.StatusBadRequest)

		return
	}

	// Make a session key and store the sessionData values
	t, err := datastore.GenSessionID()
	if err != nil {
		l.Printf("[ERRO] can't generate session id: %s", err.Error())

		panic(err) // TODO: handle error
	}
	datastore.SaveSession(t, *session)

	http.SetCookie(w, cookieOptions(t, 3600))

	JSONResponse(w, options, http.StatusOK) // return the options generated with the session key
	// options.publicKey contain our registration options
}

func FinishLogin(w http.ResponseWriter, r *http.Request) {
	// Get the session key from cookie
	sid, err := r.Cookie("sid")
	if err != nil {
		l.Printf("[ERRO] can't get session id: %s", err.Error())

		panic(err) // FIXME: handle error
	}
	// Get the session data stored from the function above
	session, _ := datastore.GetSession(sid.Value) // FIXME: cover invalid session

	// Your handler: given credential rawID and userHandle, look up the user
	loadUser := func(rawID, userHandle []byte) (webauthn.User, error) {
		return datastore.GetOrCreateUser(string(userHandle)), nil
	}

	// In out example username == userID, but in real world it should be different
	user := datastore.GetOrCreateUser(string(session.UserID)) // Get the user

	credential, err := webAuthn.FinishDiscoverableLogin(loadUser, session, r)
	if err != nil {
		l.Printf("[ERRO] can't finish login: %s", err.Error())
		panic(err)
	}

	// Handle credential.Authenticator.CloneWarning
	if credential.Authenticator.CloneWarning {
		l.Printf("[WARN] can't finish login: %s", "CloneWarning")
	}

	// If login was successful, update the credential object
	user.UpdateCredential(credential)
	datastore.SaveUser(user)

	// Delete the login session data
	datastore.DeleteSession(sid.Value)
	http.SetCookie(w, cookieOptions("", -1))
	t, err := datastore.GenSessionID()
	if err != nil {
		l.Printf("[ERRO] can't generate session id: %s", err.Error())

		panic(err) // TODO: handle error
	}

	datastore.SaveSession(t, webauthn.SessionData{
		Expires: time.Now().Add(time.Hour),
	})
	http.SetCookie(w, cookieOptions(t, 3600))

	l.Printf("[INFO] finish login ----------------------/")
	JSONResponse(w, "Login Success", http.StatusOK)
}

func PrivatePage(w http.ResponseWriter, r *http.Request) {
	// just show "Hello, World!" for now
	_, _ = w.Write([]byte("Hello, World!"))
}

// JSONResponse is a helper function to send json response
func JSONResponse(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

// getEnv is a helper function to get the environment variable
func getEnv(key, def string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}

	return def
}

// cookieSecure returns true when running over HTTPS
func cookieSecure() bool {
	return isSecure
}

// cookieOptions returns the common cookie configuration based on environment
func cookieOptions(value string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     "sid",
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		Secure:   cookieSecure(),
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
	}
}

func LoggedInMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: url to redirect to should be passed as a parameter

		sid, err := r.Cookie("sid")
		if err != nil {
			http.Redirect(w, r, "/", http.StatusSeeOther)

			return
		}

		session, ok := datastore.GetSession(sid.Value)
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

func CORSHandler(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}
