package Dtos

import (
	"time"
)

type TokenUser struct {
	Id   string
	Name string
}

type OrgOutputDto struct {
	ID             string
	OrganisationID string
	OrgName        string
	Type           string
	UserCount      int64
	DeviceCount    int64
}

type ErrorOutPut struct {
	Status    int
	Api_path  string
	Message   string
	Timestamp time.Time
}

type OrganizationInput struct {
	Name string `json:"name" validate:"required"`
	Type string `json:"type" validate:"required,orgtype"`
}
