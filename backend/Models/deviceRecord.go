package models

import "time"

// DeviceRecord is a single telemetry reading reported by a device.
type DeviceRecord struct {
	ID                 string    `json:"id"`
	DeviceID           string    `json:"device_id"`
	ShutterRange       string    `json:"shutterRange"`
	ShutterClosed      bool      `json:"shutterClosed"`
	AlertPriority      int       `json:"alertPriority"`
	VibrationIntensity int       `json:"vibrationIntensity"`
	BatteryLevel       int       `json:"batteryLevel"`
	IsDocked           bool      `json:"isDocked"`
	SignalStrength     int       `json:"signalStrength"`
	LastAlert          time.Time `json:"lastAlert"`
	CreatedAt          time.Time `json:"createdAt"`
}
