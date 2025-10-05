package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleClient UserRole = "CLIENT"
	RoleAdmin  UserRole = "ADMIN"
)

type User struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email          string    `gorm:"unique;not null" json:"email"`
	Name           string    `gorm:"not null" json:"name"`
	AvatarURL      string    `json:"avatar_url"`
	Role           UserRole  `gorm:"type:varchar(20);default:'CLIENT'" json:"role"`
	AuthProvider   string    `gorm:"not null" json:"auth_provider"` // google, facebook
	AuthProviderID string    `gorm:"not null" json:"auth_provider_id"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	
	// Relationships
	Enrollments []Enrollment `json:"enrollments,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}

