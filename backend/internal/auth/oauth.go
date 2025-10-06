package auth

import (
	"fmt"
	"os"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/facebook"
	"github.com/markbates/goth/providers/google"
)

const (
	maxAge = 86400 * 30 // 30 days
)

// InitOAuth initializes OAuth providers (Google, Facebook)
func InitOAuth() {
	key := os.Getenv("JWT_SECRET")
	if key == "" {
		key = "default-secret-key-change-in-production"
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(maxAge)
	store.Options.Path = "/"
	store.Options.HttpOnly = true
	
	// Check if we're in production (HTTPS)
	env := os.Getenv("ENV")
	isProduction := env == "production"
	store.Options.Secure = isProduction
	
	if isProduction {
		store.Options.SameSite = 2 // Lax for production
	} else {
		store.Options.SameSite = 0 // None for localhost development
	}

	gothic.Store = store

	backendURL := os.Getenv("BACKEND_URL")
	if backendURL == "" {
		backendURL = "http://localhost:8080"
	}

	goth.UseProviders(
		google.New(
			os.Getenv("GOOGLE_CLIENT_ID"),
			os.Getenv("GOOGLE_CLIENT_SECRET"),
			fmt.Sprintf("%s/api/v1/auth/google/callback", backendURL),
			"email", "profile",
		),
		facebook.New(
			os.Getenv("FACEBOOK_CLIENT_ID"),
			os.Getenv("FACEBOOK_CLIENT_SECRET"),
			fmt.Sprintf("%s/api/v1/auth/facebook/callback", backendURL),
			"email",
		),
	)
}
