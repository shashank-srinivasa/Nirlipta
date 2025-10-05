package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Content struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PageName   string    `gorm:"not null" json:"page_name"` // landing, about
	SectionKey string    `gorm:"not null" json:"section_key"`
	Content    string    `gorm:"type:text" json:"content"`
	UpdatedBy  uuid.UUID `gorm:"type:uuid;not null" json:"updated_by"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (c *Content) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

