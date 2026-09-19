package models

import "time"

// User is a platform user. AccessRole holds an AccessRole ID.
type User struct {
	ID         string
	Name       string
	Phone      string
	OrgID      string
	Email      *string
	AccessRole string
	CreatedAt  time.Time
	UpdatedAt  *time.Time
}
