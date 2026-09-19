package controllers

import (
	// models "apex-iot-backend/Models" // Adjust the import path to where your User model is located
	services "apex-iot-backend/services"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func ParseQueryParam(c *gin.Context, key string, defaultValue interface{}) interface{} {
	queryValue := c.Query(key)
	if queryValue == "" {
		return defaultValue
	}
	switch defaultValue.(type) {
	case int:
		value, err := strconv.Atoi(queryValue)
		if err == nil {
			return value
		}
	case *int:
		value, err := strconv.Atoi(queryValue)
		if err == nil {
			return &value
		}
	case *bool:
		value, err := strconv.ParseBool(queryValue)
		if err == nil {
			return &value
		}
	case *time.Time:
		value, err := time.Parse(time.RFC3339, queryValue)
		if err == nil {
			return &value
		}
	case *string:
		return &queryValue
	}

	return defaultValue
}

func GetDeviceRecords(c *gin.Context) {
	log.Println("GetDeviceRecords called....................")
	deviceID := c.Param("deviceId")

	selectedOption := services.DeviceRecordOptions{
		Limit:                        ParseQueryParam(c, "limit", 0).(int),
		StartingKey:                  ParseQueryParam(c, "startKey", (*string)(nil)).(*string),
		IsDocked:                     ParseQueryParam(c, "isDocked", (*bool)(nil)).(*bool),
		AlertPriorityStartRange:      ParseQueryParam(c, "alertPriorityStartRange", (*int)(nil)).(*int),
		AlertPriorityEndRange:        ParseQueryParam(c, "alertPriorityEndRange", (*int)(nil)).(*int),
		VibrationIntensityStartRange: ParseQueryParam(c, "vibrationIntensityStartRange", (*int)(nil)).(*int),
		VibrationIntensityEndRange:   ParseQueryParam(c, "vibrationIntensityEndRange", (*int)(nil)).(*int),
		CreatedAtStart:               ParseQueryParam(c, "createdAtStart", (*time.Time)(nil)).(*time.Time),
		CreatedAtEnd:                 ParseQueryParam(c, "createdAtEnd", (*time.Time)(nil)).(*time.Time),
	}

	records, err := services.GetAllDeiveRecords(deviceID, selectedOption)

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, records)

}
