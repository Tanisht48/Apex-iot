package models

import "time"

type DeviceNotification struct {
	ID        string       `json:"id"`
	DeviceID  string       `json:"device_id"`
	Data      DeviceRecord `json:"data"`
	IsRead    bool         `json:"isRead"`
	CreatedAt time.Time    `json:"createdAt"`
	UpdatedAt *time.Time   `json:"updatedAt"`
}
