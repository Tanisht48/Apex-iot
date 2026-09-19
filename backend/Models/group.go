package models

import "time"

// Group is a set of devices and users within an organisation.
type Group struct {
	ID        string
	Name      string
	OrgID     string
	Devices   []string // Device IDs
	Users     []string // User IDs
	SubGroups []string // Subgroup IDs
	CreatedAt time.Time
	UpdatedAt *time.Time
}
