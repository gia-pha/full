package main

import (
	"auth-passkey/ports"
	"auth-passkey/service"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/go-webauthn/webauthn/webauthn"
)

func main() {
	var lvl slog.Level
	switch getEnv("LOG_LEVEL", "DEBUG") {
	case "INFO":
		lvl = slog.LevelInfo
	case "WARN":
		lvl = slog.LevelWarn
	case "ERROR":
		lvl = slog.LevelError
	default:
		lvl = slog.LevelInfo
	}
	slog.SetLogLoggerLevel(lvl)
	logger := slog.Default()

	proto := getEnv("PROTO", "http")
	secure := proto == "https"
	host := getEnv("HOST", "localhost")
	port := getEnv("PORT", ":8080")
	origin := fmt.Sprintf("%s://%s%s", proto, host, port)
	webauthnName := getEnv("WEBAUTHN_NAME", "Go Webauthn")
	webauthnId := getEnv("WEBAUTHN_ID", host)
	allowedOrigins := strings.Split(getEnv("ALLOWED_ORIGINS", origin), ",")

	logger.Info("Make webauthn config")
	wconfig := &webauthn.Config{
		RPDisplayName: webauthnName,
		RPID:          webauthnId,
		RPOrigins:     allowedOrigins,
	}
	webAuthn, err := webauthn.New(wconfig)
	if err != nil {
		fmt.Printf("[FATA] %s", err.Error())
		os.Exit(1)
	}

	logger.Info("Build application")
	application := service.NewApplication(webAuthn, logger)

	logger.Info("Create http server")
	httpServer := ports.NewHttpServer(application, logger, secure)

	logger.Info("Register routes")
	mux := http.NewServeMux()
	httpServer.RegisterRoutes(mux)

	logger.Info("Start server", "origin", origin)
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
