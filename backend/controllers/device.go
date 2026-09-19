package controllers

import (
	models "apex-iot-backend/Models" // Adjust the import path to where your User model is located
	services "apex-iot-backend/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type DeviceInpu struct {
	DeviceId      string `json:"device_id"`
	OrgID         string `json:"org_id"`
	ShopOpenTime  string `json:"shop_open_time"`
	ShopCloseTime string `json:"shop_close_time"`
}

type DeviceWithLatestRecord struct {
	Device       models.Device
	LatestRecord models.DeviceRecord
}

func CreateDevice(c *gin.Context) {
	var deviceInp DeviceInpu
	if err := c.ShouldBindJSON(&deviceInp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	device := models.Device{
		ID:            deviceInp.DeviceId,
		OrgID:         deviceInp.OrgID,
		ShopOpenTime:  deviceInp.ShopOpenTime,
		ShopCloseTime: deviceInp.ShopCloseTime,
		CreatedAt:     time.Now(),
	}
	err := services.CreateDevice(device)
	if err != nil {
		c.Error(err)
		//	c.Abort()
		return
	}
	c.JSON(http.StatusCreated, device)
}

func UpdateDevice(c *gin.Context) {
	var deviceInp DeviceInpu

	if err := c.ShouldBindJSON(&deviceInp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	updatedTime := time.Now()

	currentDevice, err := services.GetDeviceById(deviceInp.DeviceId)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	device := models.Device{
		ID:            deviceInp.DeviceId,
		OrgID:         deviceInp.OrgID,
		ShopOpenTime:  deviceInp.ShopOpenTime,
		ShopCloseTime: deviceInp.ShopCloseTime,
		CreatedAt:     currentDevice.CreatedAt,
		UpdatedAt:     &updatedTime,
	}

	err = services.CreateDevice(device)

	if err != nil {
		c.Error(err)
		//	c.Abort()
		return
	}

	c.JSON(http.StatusOK, device)
}

func GetAllDevices(c *gin.Context) {
	devices, err := services.GetAllDevices()

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	devicesWithRecord := devicesToDeviceWithLatestRecords(devices)

	c.JSON(http.StatusOK, devicesWithRecord)
}

func GetAllDevicesForOrganizatio(c *gin.Context) {
	orgId := c.Param("orgId")
	devices, err := services.GetAllDevicesForOrganizatio(orgId)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	devicesWithRecord := devicesToDeviceWithLatestRecords(devices)

	c.JSON(http.StatusOK, devicesWithRecord)
}

func GetDeviceById(c *gin.Context) {
	id := c.Param("id")
	device, err := services.GetDeviceById(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	deviceRecords, err := services.GetAllDeiveRecords(device.ID, services.DeviceRecordOptions{
		Limit: 1})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"device":  device,
		"records": deviceRecords,
	})
}

func DeleteDevice(c *gin.Context) {
	id := c.Param("id")
	err := services.DeleteDevice(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"Message": "Deleted Device sicessfully with id: " + id,
	})
}

func devicesToDeviceWithLatestRecords(devices []models.Device) []DeviceWithLatestRecord {
	var deviceWithLatestRecords []DeviceWithLatestRecord
	for _, device := range devices {
		latestRecord, err := services.GetAllDeiveRecords(device.ID, services.DeviceRecordOptions{
			Limit: 1})

		if err != nil {
			continue
		}
		deviceWithLatestRecord := DeviceWithLatestRecord{
			Device: device,
		}
		if len(latestRecord) > 0 {
			deviceWithLatestRecord.LatestRecord = latestRecord[0]
		}

		deviceWithLatestRecords = append(deviceWithLatestRecords, deviceWithLatestRecord)
	}
	return deviceWithLatestRecords

}
