package services

import (
	"net/http"
	"sort"
	"time"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

type DeviceRecordOptions struct {
	Limit                        int
	StartingKey                  *string // ID of the last record of the previous page
	IsDocked                     *bool
	AlertPriorityStartRange      *int
	AlertPriorityEndRange        *int
	VibrationIntensityStartRange *int
	VibrationIntensityEndRange   *int
	CreatedAtStart               *time.Time
	CreatedAtEnd                 *time.Time
}

func inRange(value int, start, end *int) bool {
	return (start == nil || value >= *start) && (end == nil || value <= *end)
}

func (o DeviceRecordOptions) matches(r models.DeviceRecord) bool {
	if o.IsDocked != nil && r.IsDocked != *o.IsDocked {
		return false
	}
	if !inRange(r.AlertPriority, o.AlertPriorityStartRange, o.AlertPriorityEndRange) {
		return false
	}
	if !inRange(r.VibrationIntensity, o.VibrationIntensityStartRange, o.VibrationIntensityEndRange) {
		return false
	}
	if o.CreatedAtStart != nil && r.CreatedAt.Before(*o.CreatedAtStart) {
		return false
	}
	if o.CreatedAtEnd != nil && r.CreatedAt.After(*o.CreatedAtEnd) {
		return false
	}
	return true
}

// GetAllDeiveRecords returns a device's telemetry, newest first, filtered by the
// given options. A Limit of zero or less returns every matching record.
func GetAllDeiveRecords(deviceId string, selectedOptions DeviceRecordOptions) ([]models.DeviceRecord, error) {
	if deviceId == "" {
		return nil, &cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: "please provide valid device id",
		}
	}

	records := repository.Records.Filter(func(r models.DeviceRecord) bool {
		return r.DeviceID == deviceId && selectedOptions.matches(r)
	})
	sort.SliceStable(records, func(i, j int) bool {
		return records[i].CreatedAt.After(records[j].CreatedAt)
	})

	if selectedOptions.StartingKey != nil {
		for i, r := range records {
			if r.ID == *selectedOptions.StartingKey {
				records = records[i+1:]
				break
			}
		}
	}
	if selectedOptions.Limit > 0 && len(records) > selectedOptions.Limit {
		records = records[:selectedOptions.Limit]
	}
	return records, nil
}
