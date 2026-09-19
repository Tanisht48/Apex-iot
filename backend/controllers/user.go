package controllers

import (
	"net/http"
	"time"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	services "apex-iot-backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type VerifyOTPRequest struct {
	Verification string `json:"verification_code"`
	OTP          string `json:"otp"`
	Phone        string `json:"phone"`
}

func GetAllUsers(c *gin.Context) {
	users, err := services.GetAllTheUser()
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetAllUsersForOrganization(c *gin.Context) {
	orgId := c.Param("orgId")
	users, err := services.GetAllUsersForOrganization(orgId)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetUserById(c *gin.Context) {
	id := c.Param("id")
	user, err := services.GetUserById(id)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, user)
}

type UserInp struct {
	Name       string    `json:"name"`
	Phone      string    `json:"phone"`
	OrgID      string    `json:"org_id"`
	Email      string    `json:"email,omitempty"`
	AccessRole string    `json:"access_role"`
	CreatedAt  time.Time `json:"created_at"`
}

func CreateUser(c *gin.Context) {
	var input UserInp
	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(&cerr.CustomError{Code: http.StatusBadRequest, Message: err.Error()})
		c.Abort()
		return
	}

	user := models.User{
		ID:         uuid.NewString(),
		Name:       input.Name,
		Phone:      input.Phone,
		OrgID:      input.OrgID,
		Email:      &input.Email,
		AccessRole: input.AccessRole,
		CreatedAt:  time.Now(),
	}

	if err := services.CreateUser(user); err != nil {
		c.Error(err)
		c.Abort()
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User created successfully",
		"data":    user,
	})
}

func UpdateUser(c *gin.Context) {
	var input UserInp
	id := c.Param("id")

	if err := c.ShouldBindJSON(&input); err != nil {
		c.Error(&cerr.CustomError{Code: http.StatusBadRequest, Message: err.Error()})
		c.Abort()
		return
	}

	updatedUser, err := services.UpdateUser(id, models.User{
		Name:       input.Name,
		Phone:      input.Phone,
		Email:      &input.Email,
		AccessRole: input.AccessRole,
	})
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "User Updated successfully",
		"data":    updatedUser,
	})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if !services.DeleteUser(id) {
		c.Error(&cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no user found with the ID " + id,
		})
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "deleted User with id " + id,
	})
}

// SendOtp starts the demo OTP flow and returns a verification token.
func SendOtp(c *gin.Context) {
	token, err := services.SendOtp(c.Query("phone"))
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"verification token": token,
	})
}

// VerifyOtp checks the OTP and returns the JWT in the Authorization response header.
func VerifyOtp(c *gin.Context) {
	var reqBody VerifyOTPRequest
	if err := c.ShouldBindJSON(&reqBody); err != nil {
		c.Error(&cerr.CustomError{Code: http.StatusBadRequest, Message: "invalid request body"})
		c.Abort()
		return
	}

	token, err := services.VerifyOtp(reqBody.Verification, reqBody.OTP, reqBody.Phone)
	if err != nil {
		c.Error(err)
		c.Abort()
		return
	}
	c.Header("Authorization", *token)
	c.JSON(http.StatusOK, gin.H{"msg": "OTP verified successfully"})
}
