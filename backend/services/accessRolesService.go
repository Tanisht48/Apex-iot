package services

import (
	"net/http"
	"time"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

func CreateAccessRole(ar models.AccessRole) error {
	repository.AccessRoles.Put(ar.ID, ar)
	return nil
}

func GetAllTheAccessRole() ([]models.AccessRole, error) {
	return repository.AccessRoles.All(), nil
}

func GetAccessRoleById(id string) (*models.AccessRole, error) {
	ar, ok := repository.AccessRoles.Get(id)
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no access role found with the ID " + id,
		}
	}
	return &ar, nil
}

func UpdateAccessRole(id string, arReq models.AccessRole) (*models.AccessRole, error) {
	now := time.Now()
	ok := repository.AccessRoles.Update(id, func(ar *models.AccessRole) {
		ar.Name = arReq.Name
		ar.Org = arReq.Org
		ar.Groups = arReq.Groups
		ar.UserActions = arReq.UserActions
		ar.DeviceActions = arReq.DeviceActions
		ar.UpdatedAt = &now
	})
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no access role found with the ID " + id,
		}
	}
	return GetAccessRoleById(id)
}

func DeleteAccessRole(id string) error {
	if !repository.AccessRoles.Delete(id) {
		return &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no access role found with the ID " + id,
		}
	}
	return nil
}
