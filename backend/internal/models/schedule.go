package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RecurrenceType string

const (
	Once    RecurrenceType = "once"
	Daily   RecurrenceType = "daily"
	Weekly  RecurrenceType = "weekly"
	Monthly RecurrenceType = "monthly"
)

type Schedule struct {
	ID                uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ClassID           uuid.UUID      `gorm:"type:uuid;not null" json:"class_id"`
	StartTime         time.Time      `gorm:"not null" json:"start_time"`
	EndTime           time.Time      `gorm:"not null" json:"end_time"`
	RecurrenceType    RecurrenceType `gorm:"type:varchar(20);default:'once'" json:"recurrence_type"`
	RecurrenceEndDate *time.Time     `json:"recurrence_end_date"`
	DayOfWeek         *int           `json:"day_of_week"`   // 0-6 (Sunday-Saturday) for weekly
	DayOfMonth        *int           `json:"day_of_month"`  // 1-31 for monthly
	CreatedBy         uuid.UUID      `gorm:"type:uuid;not null" json:"created_by"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	
	// Relationships
	Class       Class        `json:"class,omitempty"`
	Enrollments []Enrollment `json:"enrollments,omitempty"`
}

func (s *Schedule) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

