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
	isProd = false      // Set to true in production
)

// InitOAuth initializes OAuth providers (Google, Facebook)
func InitOAuth() {
	store := sessions.NewCookieStore([]byte(os.Getenv("JWT_SECRET")))
	store.MaxAge(maxAge)
	store.Options.Path = "/"
	store.Options.HttpOnly = true
	store.Options.Secure = isProd

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

