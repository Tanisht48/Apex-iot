// Package seed fills the in-memory store with demo data so the dashboard has
// something to show on first run. It uses only fictional names and reserved
// 555-01xx phone numbers.
package seed

import (
	"fmt"
	"log"
	"math/rand"
	"time"

	models "apex-iot-backend/Models"
	"apex-iot-backend/repository"
)

const (
	orgSunrise = "SuMaKir"   // Kirana store chain
	orgMetro   = "MeReGrEnt" // Enterprise retail group

	roleGod   = "role-god"
	roleAdmin = "role-admin"
	roleUser  = "role-user"

	recordInterval = 30 * time.Minute
	recordHistory  = 7 * 24 * time.Hour
)

// Demo login numbers (OTP is the DEMO_OTP value, default 1234).
const (
	DemoSuperAdminPhone = "+15550100001"
)

// Load populates every table. It is safe to call once at start-up.
func Load() {
	now := time.Now()
	seedRoles(now)
	seedOrganisations(now)
	seedUsers(now)
	seedDevices(now)
	log.Printf("seeded demo data: %d organisations, %d users, %d devices, %d records, %d notifications",
		len(repository.Organisations.All()), len(repository.Users.All()), len(repository.Devices.All()),
		len(repository.Records.All()), len(repository.Notifications.All()))
	log.Printf("demo login: phone %s, OTP from DEMO_OTP (default 1234)", DemoSuperAdminPhone)
}

func seedRoles(now time.Time) {
	all := []models.ActionType{"CREATE", "READ", "UPDATE", "DELETE"}
	readOnly := []models.ActionType{"READ"}
	roles := []models.AccessRole{
		{ID: roleGod, Name: "god", Groups: []string{}, UserActions: all, DeviceActions: all},
		{ID: roleAdmin, Name: "Admin", Groups: []string{}, UserActions: all, DeviceActions: all},
		{ID: roleUser, Name: "User", Groups: []string{}, UserActions: readOnly, DeviceActions: readOnly},
	}
	for _, role := range roles {
		role.CreatedAt = now
		repository.AccessRoles.Put(role.ID, role)
	}
}

func seedOrganisations(now time.Time) {
	orgs := []models.Organisation{
		{ID: "org-sunrise", OrganisationID: orgSunrise, OrgName: "Sunrise Mart", Type: models.OrgTypeKirana},
		{ID: "org-metro", OrganisationID: orgMetro, OrgName: "Metro Retail Group", Type: models.OrgTypeEnterprise},
	}
	for _, org := range orgs {
		org.CreatedAt = now.AddDate(0, -3, 0)
		repository.Organisations.Put(org.ID, org)
	}
}

func seedUsers(now time.Time) {
	users := []struct {
		id, name, phone, email, org, role string
	}{
		{"user-demo", "Demo Admin", DemoSuperAdminPhone, "demo.admin@example.com", orgSunrise, roleGod},
		{"user-riya", "Riya Sharma", "+15550100002", "riya.sharma@example.com", orgSunrise, roleAdmin},
		{"user-arjun", "Arjun Mehta", "+15550100003", "arjun.mehta@example.com", orgSunrise, roleUser},
		{"user-neha", "Neha Kapoor", "+15550100004", "neha.kapoor@example.com", orgMetro, roleAdmin},
		{"user-sam", "Sam Carter", "+15550100005", "sam.carter@example.com", orgMetro, roleUser},
	}
	for _, u := range users {
		email := u.email
		repository.Users.Put(u.id, models.User{
			ID: u.id, Name: u.name, Phone: u.phone, Email: &email,
			OrgID: u.org, AccessRole: u.role, CreatedAt: now.AddDate(0, -2, 0),
		})
	}
}

// deviceProfile shapes a device's simulated telemetry.
type deviceProfile struct {
	id, org      string
	batteryStart int  // battery at the start of the history window
	batteryEnd   int  // battery now
	signalBase   int  // typical RSSI in dBm
	noisy        bool // more vibration and alerts
}

func seedDevices(now time.Time) {
	profiles := []deviceProfile{
		{"DEV-1001", orgSunrise, 96, 78, -52, false},
		{"DEV-1002", orgSunrise, 88, 41, -68, false},
		{"DEV-1003", orgSunrise, 70, 14, -84, true},
		{"DEV-2001", orgMetro, 99, 90, -45, false},
		{"DEV-2002", orgMetro, 92, 63, -61, true},
		{"DEV-2003", orgMetro, 85, 55, -75, false},
	}
	for i, p := range profiles {
		repository.Devices.Put(p.id, models.Device{
			ID: p.id, OrgID: p.org, ShopOpenTime: "09:00", ShopCloseTime: "21:00",
			CreatedAt: now.AddDate(0, -1, 0),
		})
		// A fixed seed per device keeps the demo data reproducible.
		seedTelemetry(p, now, rand.New(rand.NewSource(int64(1000+i))))
	}
}

func seedTelemetry(p deviceProfile, now time.Time, rng *rand.Rand) {
	steps := int(recordHistory / recordInterval)
	start := now.Add(-recordHistory)
	var lastAlert time.Time

	for step := 0; step <= steps; step++ {
		at := start.Add(time.Duration(step) * recordInterval)
		progress := float64(step) / float64(steps)

		hour := at.Hour()
		shopOpen := hour >= 9 && hour < 21

		vibration := rng.Intn(6)
		if p.noisy {
			vibration += rng.Intn(15)
		}
		alert := 1
		if rng.Intn(60) == 0 || (p.noisy && rng.Intn(25) == 0) {
			// Occasional spike, e.g. a forced shutter or a knock.
			vibration = 55 + rng.Intn(45)
			alert = 3 + rng.Intn(3)
			lastAlert = at
		} else if vibration > 12 {
			alert = 2
		}

		shutterRange := 0
		if shopOpen {
			shutterRange = 70 + rng.Intn(31)
		}

		battery := p.batteryStart + int(float64(p.batteryEnd-p.batteryStart)*progress)
		signal := p.signalBase + rng.Intn(9) - 4

		id := fmt.Sprintf("%s-%d", p.id, at.Unix())
		record := models.DeviceRecord{
			ID:                 id,
			DeviceID:           p.id,
			ShutterRange:       fmt.Sprintf("%d", shutterRange),
			ShutterClosed:      !shopOpen,
			AlertPriority:      alert,
			VibrationIntensity: vibration,
			BatteryLevel:       battery,
			IsDocked:           rng.Intn(20) != 0,
			SignalStrength:     signal,
			LastAlert:          lastAlert,
			CreatedAt:          at,
		}
		repository.Records.Put(record.ID, record)

		if alert >= 4 {
			repository.Notifications.Put("notif-"+id, models.DeviceNotification{
				ID:        "notif-" + id,
				DeviceID:  p.id,
				Data:      record,
				IsRead:    at.Before(now.Add(-48 * time.Hour)),
				CreatedAt: at,
			})
		}
	}
}
