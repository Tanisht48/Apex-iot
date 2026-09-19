package services

import (
	"net/http"
	"time"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

func findUserByPhone(phone string) *models.User {
	users := repository.Users.Filter(func(u models.User) bool { return u.Phone == phone })
	if len(users) == 0 {
		return nil
	}
	return &users[0]
}

func CreateUser(usr models.User) error {
	if findUserByPhone(usr.Phone) != nil {
		return &cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: "Please use different number",
		}
	}
	repository.Users.Put(usr.ID, usr)
	return nil
}

func GetAllTheUser() ([]models.User, error) {
	return repository.Users.All(), nil
}

func GetUserById(id string) (*models.User, error) {
	usr, ok := repository.Users.Get(id)
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no user found with the ID " + id,
		}
	}
	return &usr, nil
}

func UpdateUser(id string, usrReq models.User) (*models.User, error) {
	now := time.Now()
	ok := repository.Users.Update(id, func(u *models.User) {
		u.Name = usrReq.Name
		u.Phone = usrReq.Phone
		u.Email = usrReq.Email
		u.AccessRole = usrReq.AccessRole
		u.UpdatedAt = &now
	})
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no user found with the ID " + id,
		}
	}
	return GetUserById(id)
}

func DeleteUser(id string) bool {
	return repository.Users.Delete(id)
}

func GetAllUsersForOrganization(orgId string) ([]models.User, error) {
	return repository.Users.Filter(func(u models.User) bool { return u.OrgID == orgId }), nil
}

func GetUserCountForOrganization(orgId string) int64 {
	return repository.Users.Count(func(u models.User) bool { return u.OrgID == orgId })
}
