package services

import (
	"net/http"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

// CreateDevice inserts a device, or replaces it when the ID already exists.
func CreateDevice(device models.Device) error {
	repository.Devices.Put(device.ID, device)
	return nil
}

func GetAllDevices() ([]models.Device, error) {
	return repository.Devices.All(), nil
}

func GetAllDevicesForOrganizatio(orgId string) ([]models.Device, error) {
	return repository.Devices.Filter(func(d models.Device) bool { return d.OrgID == orgId }), nil
}

func GetDeviceById(id string) (*models.Device, error) {
	device, ok := repository.Devices.Get(id)
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no device found with the ID " + id,
		}
	}
	return &device, nil
}

func GetDeviceCountForOrganization(orgId string) int64 {
	return repository.Devices.Count(func(d models.Device) bool { return d.OrgID == orgId })
}

// DeleteDevice removes a device together with its telemetry and notifications.
func DeleteDevice(id string) error {
	if !repository.Devices.Delete(id) {
		return &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no device found with the ID " + id,
		}
	}
	repository.Records.DeleteWhere(func(r models.DeviceRecord) bool { return r.DeviceID == id })
	repository.Notifications.DeleteWhere(func(n models.DeviceNotification) bool { return n.DeviceID == id })
	return nil
}
