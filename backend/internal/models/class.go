package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type DifficultyLevel string

const (
	Beginner     DifficultyLevel = "beginner"
	Intermediate DifficultyLevel = "intermediate"
	Advanced     DifficultyLevel = "advanced"
)

type Class struct {
	ID              uuid.UUID       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Title           string          `gorm:"not null" json:"title"`
	Description     string          `json:"description"`
	InstructorName  string          `gorm:"not null" json:"instructor_name"`
	Duration        int             `gorm:"not null" json:"duration"` // in minutes
	Capacity        int             `gorm:"not null" json:"capacity"`
	DifficultyLevel DifficultyLevel `gorm:"type:varchar(20)" json:"difficulty_level"`
	ImageURL        string          `json:"image_url"`
	IsActive        bool            `gorm:"default:true" json:"is_active"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	
	// Relationships
	Schedules []Schedule `json:"schedules,omitempty"`
}

func (c *Class) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

