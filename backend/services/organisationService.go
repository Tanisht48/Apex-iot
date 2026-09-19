package services

import (
	"net/http"
	"strconv"
	"strings"
	"time"
	"unicode"

	cerr "apex-iot-backend/Errors"
	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

// CreateOrganization stores the organisation and returns its generated OrganisationID.
func CreateOrganization(org models.Organisation) (*string, error) {
	generatedId, err := GenerateOrganisationID(org.OrgName, string(org.Type))
	if err != nil {
		return nil, err
	}
	org.OrganisationID = generatedId
	repository.Organisations.Put(org.ID, org)
	return &org.OrganisationID, nil
}

func GetAllTheOrganization() []models.Organisation {
	return repository.Organisations.All()
}

func GetOrganizationById(id string) (*models.Organisation, error) {
	org, ok := repository.Organisations.Get(id)
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no organization found with the ID " + id,
		}
	}
	return &org, nil
}

func UpdateOrganization(id string, orgReq models.Organisation) (*models.Organisation, error) {
	now := time.Now()
	ok := repository.Organisations.Update(id, func(o *models.Organisation) {
		o.OrgName = orgReq.OrgName
		o.Type = orgReq.Type
		o.UpdatedAt = &now
	})
	if !ok {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no organization found with the ID " + id,
		}
	}
	return GetOrganizationById(id)
}

// DeleteOrganization removes an organisation with its users and devices.
func DeleteOrganization(id string) bool {
	org, err := GetOrganizationById(id)
	if err != nil {
		return false
	}
	repository.Users.DeleteWhere(func(u models.User) bool { return u.OrgID == org.OrganisationID })
	devices, _ := GetAllDevicesForOrganizatio(org.OrganisationID)
	for _, device := range devices {
		_ = DeleteDevice(device.ID)
	}
	return repository.Organisations.Delete(id)
}

func GetOrganizationByStartWithOrgId(orgIDPrefix string) ([]models.Organisation, error) {
	return repository.Organisations.Filter(func(o models.Organisation) bool {
		return strings.HasPrefix(o.OrganisationID, orgIDPrefix)
	}), nil
}

// GenerateOrganisationID builds a short code from the name and type
// (e.g. "Sunrise Mart" + "Kirana" -> "SuMaKir") and appends a numeric suffix if it is taken.
func GenerateOrganisationID(orgName string, orgType string) (string, error) {
	var orgIDParts []string
	for _, word := range strings.Fields(orgName) {
		if len(word) > 1 {
			orgIDParts = append(orgIDParts, word[:2])
		} else {
			orgIDParts = append(orgIDParts, word)
		}
	}

	orgID := strings.Join(orgIDParts, "")
	if len(orgType) > 3 {
		orgID += orgType[:3]
	} else {
		orgID += orgType
	}

	return getNextUniqueOrganisationID(sanitizeOrganisationID(orgID))
}

func sanitizeOrganisationID(input string) string {
	var result []rune
	for _, r := range input {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			result = append(result, r)
		}
	}
	return string(result)
}

func getNextUniqueOrganisationID(baseID string) (string, error) {
	organizations, err := GetOrganizationByStartWithOrgId(baseID)
	if err != nil {
		return "", err
	}
	if len(organizations) == 0 {
		return baseID, nil
	}
	highestSuffix := findHighestNumericSuffix(organizations, baseID)
	return baseID + strconv.Itoa(highestSuffix+1), nil
}

func findHighestNumericSuffix(organizations []models.Organisation, baseID string) int {
	highestSuffix := 0
	for _, org := range organizations {
		if suffix := getNumericSuffix(org.OrganisationID, baseID); suffix > highestSuffix {
			highestSuffix = suffix
		}
	}
	return highestSuffix
}

func getNumericSuffix(orgID, baseID string) int {
	suffix, err := strconv.Atoi(strings.TrimPrefix(orgID, baseID))
	if err != nil {
		return -1
	}
	return suffix
}
