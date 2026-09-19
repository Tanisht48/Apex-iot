package controllers

import (
	"apex-iot-backend/Dtos"
	cerr "apex-iot-backend/Errors"

	models "apex-iot-backend/Models"
	"apex-iot-backend/services"

	"github.com/go-playground/validator/v10"

	//"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetAllOrganizations(c *gin.Context) {
	//	fmt.Println(c.Writer.Header(), "---------------------------------------------")
	organizations := services.GetAllTheOrganization()
	var organizationsOutput []Dtos.OrgOutputDto
	for _, org := range organizations {
		userCount := services.GetUserCountForOrganization(org.OrganisationID)
		deviceCount := services.GetDeviceCountForOrganization(org.OrganisationID)
		//deviceCount := GetDeviceCountForOrganization(org.ID)

		organizationsOutput = append(organizationsOutput, Dtos.OrgOutputDto{
			ID:             org.ID,
			OrganisationID: org.OrganisationID,
			OrgName:        org.OrgName,
			Type:           string(org.Type),
			UserCount:      userCount,
			DeviceCount:    deviceCount,
		})
	}
	c.JSON(200, organizationsOutput)
}

func GetOrganizationById(c *gin.Context) {
	id := c.Param("id")
	organization, err := services.GetOrganizationById(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(200, organization)
}

func orgTypeValidator(fl validator.FieldLevel) bool {
	orgType := fl.Field().String()
	return orgType == "Kirana" || orgType == "Enterprise"
}

func CreateOrganization(c *gin.Context) {
	var reqBody Dtos.OrganizationInput
	if err := c.BindJSON(&reqBody); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}
	validate := validator.New()
	validate.RegisterValidation("orgtype", orgTypeValidator)
	err := validate.Struct(reqBody)
	if err != nil {
		c.Error(&cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
		c.Abort()
		return
	}
	id := uuid.NewString()
	orgID := uuid.NewString()
	updatedTime := time.Now()
	org := models.Organisation{
		ID:             id,
		OrgName:        reqBody.Name,
		OrganisationID: orgID,
		Type:           models.OrgType(reqBody.Type),
		CreatedAt:      time.Now(),
		UpdatedAt:      &updatedTime, // UpdatedAt field will be nil by default
	}
	organizationId, err := services.CreateOrganization(org)

	if err != nil { // if error occur while saving send the response
		c.Error(err)
		c.Abort()
		return
	}
	org.OrganisationID = *organizationId

	c.JSON(200, gin.H{
		"message": "Organization created successfully",
		"data":    org,
	})
}

func UpdateOrganization(c *gin.Context) {
	id := c.Param("id")

	var reqBody Dtos.OrganizationInput

	if err := c.BindJSON(&reqBody); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	validate := validator.New()
	validate.RegisterValidation("orgtype", orgTypeValidator)
	err := validate.Struct(reqBody)
	if err != nil {
		c.Error(
			&cerr.CustomError{
				Code:    http.StatusBadRequest,
				Message: err.Error(),
			})
		c.Abort()
		return
	}
	updatedTime := time.Now()
	updatedOrg, err := services.UpdateOrganization(id, models.Organisation{
		OrgName:   reqBody.Name,
		Type:      models.OrgType(reqBody.Type),
		UpdatedAt: &updatedTime,
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

func DeleteOrganization(c *gin.Context) {
	id := c.Param("id")
	if services.DeleteOrganization(id) {
		c.JSON(200, gin.H{
			"message": "deleted Organization with id" + string(id),
		})

	} else {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "please ensure the organization with id " + string(id),
		})
	}

}
