package main

import (
	"auth-passkey/application"
	"auth-passkey/infrastructure"
	"auth-passkey/interface/rest"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-webauthn/webauthn/webauthn"
)

func main() {
	logger := log.Default()

	proto := getEnv("PROTO", "http")
	host := getEnv("HOST", "localhost")
	port := getEnv("PORT", ":8080")
	origin := fmt.Sprintf("%s://%s%s", proto, host, port)

	logger.Printf("[INFO] make webauthn config")
	wconfig := &webauthn.Config{
		RPDisplayName: "Go Webauthn",                     // Display Name for your site
		RPID:          host,                              // Generally the FQDN for your site
		RPOrigins:     []string{"http://localhost:8081"}, // The origin URLs allowed for WebAuthn
	}
	webAuthn, err := webauthn.New(wconfig)
	if err != nil {
		fmt.Printf("[FATA] %s", err.Error())
		os.Exit(1)
	}

	logger.Printf("[INFO] create repositories")
	userRepo := infrastructure.NewInMemUserRepository(logger)
	sessionRepo := infrastructure.NewInMemSessionRepository(logger)

	logger.Printf("[INFO] create services")
	passkeyService := application.NewPasskeyService(webAuthn, userRepo, sessionRepo)

	logger.Printf("[INFO] create handlers")
	handler := rest.NewPasskeyHandler(passkeyService, sessionRepo, logger)

	logger.Printf("[INFO] register routes")
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	logger.Printf("[INFO] start server at %s", origin)
	if err := http.ListenAndServe(port, mux); err != nil {
		fmt.Println(err)
	}
}

// getEnv is a helper function to get the environment variable
func getEnv(key, def string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return def
}
