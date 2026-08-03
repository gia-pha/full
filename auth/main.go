package main

import (
	"auth-passkey/ports"
	"auth-passkey/service"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-webauthn/webauthn/webauthn"
)

func main() {
	logger := log.Default()

	proto := getEnv("PROTO", "http")
	host := getEnv("HOST", "localhost")
	port := getEnv("PORT", ":8080")
	origin := fmt.Sprintf("%s://%s%s", proto, host, port)
	webauthnName := getEnv("WEBAUTHN_NAME", "Go Webauthn")
	webauthnId := getEnv("WEBAUTHN_ID", host)
	webauthnOrigins := strings.Split(getEnv("WEBAUTHN_ORIGINS", origin), ",")

	logger.Printf("[INFO] make webauthn config")
	wconfig := &webauthn.Config{
		RPDisplayName: webauthnName,
		RPID:          webauthnId,
		RPOrigins:     webauthnOrigins,
	}
	webAuthn, err := webauthn.New(wconfig)
	if err != nil {
		fmt.Printf("[FATA] %s", err.Error())
		os.Exit(1)
	}

	logger.Printf("[INFO] build application")
	application := service.NewApplication(webAuthn, logger)

	logger.Printf("[INFO] create http server")
	httpServer := ports.NewHttpServer(application, logger)

	logger.Printf("[INFO] register routes")
	mux := http.NewServeMux()
	httpServer.RegisterRoutes(mux)

	logger.Printf("[INFO] start server at %s", origin)
	if err := http.ListenAndServe(port, mux); err != nil {
		fmt.Println(err)
	}
}

func getEnv(key, def string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return def
}
