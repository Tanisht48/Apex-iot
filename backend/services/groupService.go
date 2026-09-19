package services

import (
	"net/http"
	"time"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

func CreateGroup(grp models.Group) error {
	repository.Groups.Put(grp.ID, grp)
	return nil
}

func GetAllTheGroup() ([]models.Group, error) {
	return repository.Groups.All(), nil
}

func GetGroupById(id string) (*models.Group, error) {
	grp, ok := repository.Groups.Get(id)
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no group found with the ID " + id,
		}
	}
	return &grp, nil
}

func UpdateGroup(id string, grpReq models.Group) (*models.Group, error) {
	now := time.Now()
	ok := repository.Groups.Update(id, func(g *models.Group) {
		g.Name = grpReq.Name
		g.OrgID = grpReq.OrgID
		g.Devices = grpReq.Devices
		g.Users = grpReq.Users
		g.SubGroups = grpReq.SubGroups
		g.UpdatedAt = &now
	})
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no group found with the ID " + id,
		}
	}
	return GetGroupById(id)
}

func DeleteGroup(id string) error {
	if !repository.Groups.Delete(id) {
		return &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no group found with the ID " + id,
		}
	}
	return nil
}
