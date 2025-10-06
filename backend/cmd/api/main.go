package main

import (
	"log"
	"os"
	"time"

	"yoga-studio-app/internal/api"
	"yoga-studio-app/internal/auth"
	"yoga-studio-app/internal/database"
	"yoga-studio-app/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize OAuth providers
	auth.InitOAuth()

	// Initialize database with retry logic
	var db *gorm.DB
	var err error
	maxRetries := 3
	for i := 0; i < maxRetries; i++ {
		db, err = database.Connect()
		if err == nil {
			break
		}
		log.Printf("Failed to connect to database (attempt %d/%d): %v", i+1, maxRetries, err)
		if i < maxRetries-1 {
			time.Sleep(time.Second * 2)
		}
	}
	if err != nil {
		log.Fatal("Failed to connect to database after retries:", err)
	}

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Printf("Migration error (non-fatal): %v", err)
	}

	// Initialize Gin router
	router := gin.New() // Use gin.New() instead of gin.Default()

	// Add custom recovery middleware
	router.Use(middleware.RecoveryMiddleware())
	
	// Add logger middleware
	router.Use(gin.Logger())

	// CORS configuration
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{getEnv("FRONTEND_URL", "http://localhost:5173")},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Serve static files (uploaded avatars)
	router.Static("/uploads", "./uploads")

	// Initialize API routes
	api.RegisterRoutes(router, db)

	// Start server
	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	log.Printf("Frontend URL: %s", getEnv("FRONTEND_URL", "http://localhost:5173"))
	log.Printf("Environment: %s", getEnv("ENV", "development"))
	
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
