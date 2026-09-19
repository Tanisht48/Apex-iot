package models

import "time"

// Device is an IoT shutter sensor installed at a shop.
type Device struct {
	ID            string
	OrgID         string
	ShopOpenTime  string
	ShopCloseTime string
	CreatedAt     time.Time
	UpdatedAt     *time.Time
}
