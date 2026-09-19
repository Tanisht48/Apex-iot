package models

import "time"

// RoleName is the display name of an access role.
type RoleName string

// ActionType is an operation a role may perform (CREATE, READ, UPDATE, DELETE).
type ActionType string

// AccessRole represents an access control role.
type AccessRole struct {
	ID            string
	Org           string // Empty for platform-wide roles
	Name          RoleName
	Groups        []string // List of group IDs
	UserActions   []ActionType
	DeviceActions []ActionType
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}
