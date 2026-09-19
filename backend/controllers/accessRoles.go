package controllers

import (
	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/services"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetAllAccessRoles retrieves all the access roles from the database and returns them as JSON.
//
// Parameters:
// - c: The gin.Context object representing the current HTTP request and response.
//
// Returns:
// - None.
func GetAllAccessRoles(c *gin.Context) {
	// Logging the start of the function
	log.Println("Starting GetAllAccessRoles function")

	// Get all the Access Roles
	accessRoles, err := services.GetAllTheAccessRole()

	// Logging the error if any
	if err != nil {
		log.Println("Error occurred while getting all the Access Roles:", err)
		c.Error(err)
		c.Abort()
		return
	}

	// Logging the successful retrieval of all the Access Roles
	log.Println("Successfully retrieved all the Access Roles")

	// Return the Access Roles as JSON
	c.JSON(http.StatusOK, gin.H{
		"message": "all the Access Roles",
		"data":    accessRoles,
	})

	// Logging the end of the function
	log.Println("End of GetAllAccessRoles function")
}

// GetAccessRoleById retrieves an access role from the database based on the provided ID.
//
// Parameters:
// - c: The gin.Context object for handling the HTTP request and response.
//
// Returns: None.
func GetAccessRoleById(c *gin.Context) {
	// Logging the start of the function
	log.Println("Starting GetAccessRoleById function")

	// Get the access role ID from the URL parameter
	arID := c.Param("id")

	// Logging the access role ID
	log.Printf("Access role ID: %s", arID)

	// Retrieve the access role from the database
	accessRole, err := services.GetAccessRoleById(arID)

	// Logging the error if any
	if err != nil {
		log.Printf("Error occurred while getting access role with id %s: %v", arID, err)
		c.Error(err)
		c.Abort()
		return
	}

	// Logging the successful retrieval of the access role
	log.Printf("Successfully retrieved access role with id %s", arID)

	// Return the access role as JSON
	c.JSON(http.StatusOK, gin.H{
		"message": "Access role with id " + arID,
		"data":    accessRole,
	})

	// Logging the end of the function
	log.Println("End of GetAccessRoleById function")
}

type AccessRoleInput struct {
	Org           string   `json:"org,omitempty"`
	Name          string   `json:"name" binding:"required"`
	Groups        []string `json:"groups" binding:"required"`
	UserActions   []string `json:"user_actions" binding:"required"`
	DeviceActions []string `json:"device_actions" binding:"required"`
}

func convertToActionTypes(actions []string) []models.ActionType {
	var actionTypes []models.ActionType
	for _, action := range actions {
		actionTypes = append(actionTypes, models.ActionType(action))
	}
	return actionTypes
}

// CreateAccessRole creates an access role based on the provided input data.
//
// Parameters:
// - c: a pointer to a gin.Context object representing the HTTP request and response.
//
// Return type: None.
func CreateAccessRole(c *gin.Context) {
	// Logging the start of the function
	log.Println("Starting CreateAccessRole function")

	// Extract data from request body
	var input AccessRoleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		log.Printf("Error occurred while binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate UUID for the access role ID
	id := uuid.NewString()
	log.Printf("Generated UUID for access role ID: %s", id)

	// Create AccessRole model from input data
	accessRole := models.AccessRole{
		ID:            id,
		Org:           input.Org,
		Name:          models.RoleName(input.Name),
		Groups:        input.Groups,
		UserActions:   convertToActionTypes(input.UserActions),
		DeviceActions: convertToActionTypes(input.DeviceActions),
		CreatedAt:     time.Now(),
		UpdatedAt:     nil,
	}
	err := services.CreateAccessRole(accessRole)

	if err != nil { // if error occur while saving send the response
		log.Printf("Error occurred while creating access role: %v", err)
		c.Error(err)
		c.Abort()
		return
	}
	log.Println("Successfully created access role")

	c.JSON(http.StatusCreated, gin.H{
		"message": "Access role created successfully",
		"data":    accessRole,
	})

	// Logging the end of the function
	log.Println("End of CreateAccessRole function")
}

// UpdateAccessRole handles the HTTP PUT request to update an access role.
// It expects the access role ID in the request path and the updated access role data in the request body.
// On success, it returns a JSON response with the message "Organization updated successfully" and the updated access role data.
// On failure, it returns a JSON response with the error message.
//
// Parameters:
// - c: a pointer to a gin.Context object representing the HTTP request and response.
func UpdateAccessRole(c *gin.Context) {
	// Get the access role ID from the request path
	id := c.Param("id")

	// Log the received request to update the access role
	log.Printf("Received request to update access role with ID: %s", id)

	// Bind the request body to the AccessRoleInput struct
	var input AccessRoleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		// If there is an error while binding the JSON, return a JSON response with the error message
		log.Printf("Error occurred while binding JSON: %v", err)
		c.Error(&cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		return
	}

	// Prepare the updated data for the access role
	updatedTime := time.Now()
	log.Printf("Prepared update data for access role: %+v", models.AccessRole{
		ID:            id,
		Org:           input.Org,
		Name:          models.RoleName(input.Name),
		Groups:        input.Groups,
		UserActions:   convertToActionTypes(input.UserActions),
		DeviceActions: convertToActionTypes(input.DeviceActions),
		CreatedAt:     time.Now(),
		UpdatedAt:     &updatedTime,
	})

	// Call the services package to update the access role
	updatedAccessRole, err := services.UpdateAccessRole(id, models.AccessRole{
		ID:            id,
		Org:           input.Org,
		Name:          models.RoleName(input.Name),
		Groups:        input.Groups,
		UserActions:   convertToActionTypes(input.UserActions),
		DeviceActions: convertToActionTypes(input.DeviceActions),
		CreatedAt:     time.Now(),
		UpdatedAt:     &updatedTime,
	})

	if err != nil { // If there is an error while updating the access role, return a JSON response with the error message
		log.Printf("Error occurred while updating access role: %v", err)
		c.Error(err)
		c.Abort()
		return
	}

	// Log the successful update of the access role
	log.Printf("Successfully updated access role with ID: %s", id)

	// Return a JSON response with the message "Organization updated successfully" and the updated access role data
	c.JSON(http.StatusOK, gin.H{
		"message": "Organization updated successfully",
		"data":    updatedAccessRole,
	})
}

// DeleteAccessRole handles the HTTP DELETE request to delete an access role.
// It expects the access role ID in the request path.
// On success, it returns a JSON response with the message "deleted AccessRole with id<ID>".
// On failure, it returns a JSON response with the error message.
//
// Parameters:
// - c: a pointer to a gin.Context object representing the HTTP request and response.
func DeleteAccessRole(c *gin.Context) {
	// Get the access role ID from the request path
	id := c.Param("id")

	// Log the received request to delete the access role
	log.Printf("Received request to delete access role with ID: %s", id)

	// Call the services package to delete the access role
	err := services.DeleteAccessRole(id)
	if err != nil { // If there is an error while deleting the access role, return a JSON response with the error message
		log.Printf("Error occurred while deleting access role: %v", err)
		c.Error(err)
		c.Abort()
		return
	}

	// Log the successful deletion of the access role
	log.Printf("Successfully deleted access role with ID: %s", id)

	// Return a JSON response with the message "deleted AccessRole with id<ID>"
	c.JSON(http.StatusOK, gin.H{
		"message": "deleted AccessRole with id" + string(id),
	})

}
