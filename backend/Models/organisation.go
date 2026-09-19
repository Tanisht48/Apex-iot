package models

import "time"

// OrgType defines the type of organisation.
type OrgType string

const (
	OrgTypeKirana     OrgType = "Kirana"
	OrgTypeEnterprise OrgType = "Enterprise"
)

// Organisation is a tenant. Users and devices reference it through OrganisationID.
type Organisation struct {
	ID             string // Internal UUID
	OrganisationID string // Human-friendly unique code, e.g. "SuMaKir"
	OrgName        string
	Type           OrgType
	CreatedAt      time.Time
	UpdatedAt      *time.Time
}
