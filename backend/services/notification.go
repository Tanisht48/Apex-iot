package services

import (
	"net/http"
	"sort"
	"time"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

const defaultNotificationLimit = 100

type DeviceNotificationOptions struct {
	DeviceId    string
	Limit       *int
	StartingKey *string // ID of the last notification of the previous page
	IsRead      *bool
}

func newestFirst(notifications []models.DeviceNotification) {
	sort.SliceStable(notifications, func(i, j int) bool {
		return notifications[i].CreatedAt.After(notifications[j].CreatedAt)
	})
}

func GetAllNotifications() ([]models.DeviceNotification, error) {
	notifications := repository.Notifications.All()
	newestFirst(notifications)
	return notifications, nil
}

func GetNotificationsForDevice(deviceId string, opts DeviceNotificationOptions) ([]models.DeviceNotification, error) {
	notifications := repository.Notifications.Filter(func(n models.DeviceNotification) bool {
		return n.DeviceID == deviceId && (opts.IsRead == nil || n.IsRead == *opts.IsRead)
	})
	newestFirst(notifications)

	if opts.StartingKey != nil {
		for i, n := range notifications {
			if n.ID == *opts.StartingKey {
				notifications = notifications[i+1:]
				break
			}
		}
	}
	limit := defaultNotificationLimit
	if opts.Limit != nil && *opts.Limit > 0 {
		limit = *opts.Limit
	}
	if len(notifications) > limit {
		notifications = notifications[:limit]
	}
	return notifications, nil
}

func DeleteNotification(id string) error {
	if !repository.Notifications.Delete(id) {
		return &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no notification found with the ID " + id,
		}
	}
	return nil
}

func UpdateNotificationStatus(id string, isRead bool) error {
	now := time.Now()
	ok := repository.Notifications.Update(id, func(n *models.DeviceNotification) {
		n.IsRead = isRead
		n.UpdatedAt = &now
	})
	if !ok {
		return &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no notification found with the ID " + id,
		}
	}
	return nil
}
