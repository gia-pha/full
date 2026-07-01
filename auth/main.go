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

	// Đọc cấu hình từ biến môi trường
	proto := getEnv("PROTO", "http")
	host := getEnv("HOST", "localhost")
	port := getEnv("PORT", ":9090")
	origin := fmt.Sprintf("%s://%s%s", proto, host, port)

	// Khởi tạo WebAuthn
	logger.Printf("[INFO] make webauthn config")
	wconfig := &webauthn.Config{
		RPDisplayName: "Go Webauthn",
		RPID:          host,
		RPOrigins:     []string{"http://localhost:8081"}, //origin
	}
	webAuthn, err := webauthn.New(wconfig)
	if err != nil {
		fmt.Printf("[FATA] %s", err.Error())
		os.Exit(1)
	}

	// Khởi tạo Infrastructure layer
	logger.Printf("[INFO] create repositories")
	userRepo := infrastructure.NewInMemUserRepository(logger)
	sessionRepo := infrastructure.NewInMemSessionRepository(logger)

	// Khởi tạo Application layer
	logger.Printf("[INFO] create services")
	passkeyService := application.NewPasskeyService(webAuthn, userRepo, sessionRepo)

	// Khởi tạo Interface layer
	logger.Printf("[INFO] create handlers")
	handler := rest.NewPasskeyHandler(passkeyService, sessionRepo, logger)

	// Đăng ký routes
	logger.Printf("[INFO] register routes")
	mux := http.NewServeMux()
	handler.RegisterRoutes(mux)

	// Khởi động server
	logger.Printf("[INFO] start server at %s", origin)
	if err := http.ListenAndServe(port, mux); err != nil {
		fmt.Println(err)
	}
}

// getEnv đọc biến môi trường, trả về giá trị mặc định nếu không có
func getEnv(key, def string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return def
}
