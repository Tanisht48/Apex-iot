package controllers

import (
	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/services"

	//"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type input struct {
	Name      string    `json:"name" validate:"required"`
	OrgID     string    `json:"org_id" validate:"required"` // Organization ID as a string to reference Organisation
	Devices   []string  `json:"devices"`                    // List of device IDs
	Users     []string  `json:"users"`                      // List of user IDs
	SubGroups []string  `json:"sub_groups"`                 // List of subgroup IDs
	CreatedAt time.Time `json:"created_at"`                 // Timestamp of when the group was created
}

// GetAllGroups retrieves all the groups from the services and sends them as a JSON response.
//
// Parameters:
// - c: A pointer to a gin.Context object representing the HTTP request and response.
//
// Return type: None.
func GetAllGroups(c *gin.Context) {
	// Log start of function
	log.Println("GetAllGroups function called")

	// Retrieve all the groups from the services
	groups, err := services.GetAllTheGroup()

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	// Log the number of groups retrieved
	log.Printf("Retrieved %d groups", len(groups))

	// Send the groups as a JSON response
	c.JSON(200, groups)

	// Log end of function
	log.Println("GetAllGroups function completed")
}

func GetGroupById(c *gin.Context) {
	id := c.Param("id")
	group, err := services.GetGroupById(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(200, group)
}

func CreateGroup(c *gin.Context) {
	var reqBody input
	if err := c.BindJSON(&reqBody); err != nil {
		c.Error(&cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: "please add all the valide param in request body",
		})
		c.Abort()
		return
	}
	validate := validator.New()
	err := validate.Struct(reqBody)
	if err != nil {
		c.Error(&cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	id := uuid.NewString()
	updatedTime := time.Now()
	group := models.Group{
		ID:        id,
		Name:      reqBody.Name,
		OrgID:     reqBody.OrgID,
		Devices:   reqBody.Devices,
		Users:     reqBody.Users,
		SubGroups: reqBody.SubGroups,
		CreatedAt: time.Now(),
		UpdatedAt: &updatedTime, // UpdatedAt field will be nil by default
	}
	err = services.CreateGroup(group)

	if err != nil { // if error occur while saving send the response
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Group created successfully",
		"data":    group,
	})
}

func UpdateGroup(c *gin.Context) {
	id := c.Param("id")

	var reqBody input

	if err := c.BindJSON(&reqBody); err != nil {
		c.Error(&cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: "please add all the valide param in request body",
		})
		c.Abort()
		return
	}

	validate := validator.New()
	err := validate.Struct(reqBody)
	if err != nil {
		c.Error(&cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}
	updatedTime := time.Now()
	updatedOrg, err := services.UpdateGroup(id, models.Group{
		ID:        id,
		Name:      reqBody.Name,
		OrgID:     reqBody.OrgID,
		Devices:   reqBody.Devices,
		Users:     reqBody.Users,
		SubGroups: reqBody.SubGroups,
		CreatedAt: time.Now(),
		UpdatedAt: &updatedTime, // UpdatedAt field will be nil by default
	})

	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(200, gin.H{
		"message": "Organization updated successfully",
		"data":    updatedOrg,
	})
}

func DeleteGroup(c *gin.Context) {
	id := c.Param("id")
	err := services.DeleteGroup(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(200, gin.H{
		"message": "deleted group with id" + string(id),
	})

}
