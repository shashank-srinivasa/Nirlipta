package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentStatus string

const (
	PaymentPending   PaymentStatus = "pending"
	PaymentCompleted PaymentStatus = "completed"
	PaymentFailed    PaymentStatus = "failed"
)

type Enrollment struct {
	ID             uuid.UUID     `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID     `gorm:"type:uuid;not null" json:"user_id"`
	ScheduleID     uuid.UUID     `gorm:"type:uuid;not null" json:"schedule_id"`
	EnrollmentDate time.Time     `gorm:"not null" json:"enrollment_date"`
	PaymentStatus  PaymentStatus `gorm:"type:varchar(20);default:'completed'" json:"payment_status"`
	PaymentID      string        `json:"payment_id"`
	CreatedAt      time.Time     `json:"created_at"`
	
	// Relationships
	User     User     `json:"user,omitempty"`
	Schedule Schedule `json:"schedule,omitempty"`
}

func (e *Enrollment) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	if e.EnrollmentDate.IsZero() {
		e.EnrollmentDate = time.Now().UTC()
	}
	return nil
}

