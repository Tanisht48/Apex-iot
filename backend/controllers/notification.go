package controllers

import (
	"net/http"

	cerr "apex-iot-backend/Errors"
	"apex-iot-backend/services"

	"github.com/gin-gonic/gin"
)

func GetAllDeviceNotifications(c *gin.Context) {
	notifications, err := services.GetAllNotifications()
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, notifications)
}

func GetNotificationsForDevice(c *gin.Context) {
	deviceID := c.Param("deviceId")
	limit := ParseQueryParam(c, "limit", 0).(int)
	selectedOptions := services.DeviceNotificationOptions{
		Limit:       &limit,
		IsRead:      ParseQueryParam(c, "isRead", (*bool)(nil)).(*bool),
		StartingKey: ParseQueryParam(c, "startKey", (*string)(nil)).(*string),
	}
	notifications, err := services.GetNotificationsForDevice(deviceID, selectedOptions)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, notifications)
}

func UpdateNotificationStatus(c *gin.Context) {
	id := c.Param("id")
	isRead := ParseQueryParam(c, "isRead", (*bool)(nil)).(*bool)
	if isRead == nil {
		c.Error(&cerr.CustomError{Code: http.StatusBadRequest, Message: "query parameter isRead (true/false) is required"})
		c.Abort()
		return
	}
	if err := services.UpdateNotificationStatus(id, *isRead); err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated successfully"})
}

func DeleteNotification(c *gin.Context) {
	id := c.Param("id")
	if err := services.DeleteNotification(id); err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted successfully"})
}
