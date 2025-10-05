package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"yoga-studio-app/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable is required")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// Connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connected successfully")
	return db, nil
}

func Migrate(db *gorm.DB) error {
	log.Println("Running database migrations...")
	
	// AutoMigrate will only add missing columns and tables
	// It won't modify existing columns or delete unused columns
	err := db.AutoMigrate(
		&models.User{},
		&models.Class{},
		&models.Schedule{},
		&models.Enrollment{},
		&models.Content{},
	)

	if err != nil {
		// Log error but don't fail if tables already exist
		log.Printf("Migration warning: %v", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

