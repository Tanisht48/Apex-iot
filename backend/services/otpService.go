package services

import (
	"crypto/subtle"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	cerr "apex-iot-backend/Errors"

	"github.com/google/uuid"
)

// This is a demo OTP flow: no SMS provider is involved. The code is fixed
// (DEMO_OTP, default "1234") and printed to the server log when it is "sent".

const (
	defaultDemoOTP = "1234"
	otpLifetime    = 5 * time.Minute
	maxOtpAttempts = 5
)

type otpSession struct {
	phone    string
	expires  time.Time
	attempts int
}

var (
	otpMu       sync.Mutex
	otpSessions = map[string]*otpSession{}
)

func demoOTP() string {
	if code := os.Getenv("DEMO_OTP"); code != "" {
		return code
	}
	return defaultDemoOTP
}

func normalisePhone(phone string) string {
	phone = strings.TrimSpace(phone)
	if !strings.HasPrefix(phone, "+") {
		phone = "+" + phone
	}
	return phone
}

// SendOtp starts a verification session for a registered phone number and
// returns its verification ID.
func SendOtp(to string) (*string, error) {
	phone := normalisePhone(to)
	if findUserByPhone(phone) == nil {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "No user found with number " + phone,
		}
	}

	id := uuid.NewString()
	otpMu.Lock()
	otpSessions[id] = &otpSession{phone: phone, expires: time.Now().Add(otpLifetime)}
	otpMu.Unlock()

	log.Printf("[demo] OTP for %s is %s (verification %s)", phone, demoOTP(), id)
	return &id, nil
}

// VerifyOtp checks the code for a verification session and returns a signed JWT.
func VerifyOtp(verification string, otp string, phone string) (*string, error) {
	phone = normalisePhone(phone)

	otpMu.Lock()
	session, ok := otpSessions[verification]
	if ok && (time.Now().After(session.expires) || session.attempts >= maxOtpAttempts) {
		delete(otpSessions, verification)
		ok = false
	}
	if ok {
		session.attempts++
	}
	otpMu.Unlock()

	if !ok || session.phone != phone {
		return nil, &cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: "verification expired or invalid, please request a new otp",
		}
	}
	if subtle.ConstantTimeCompare([]byte(otp), []byte(demoOTP())) != 1 {
		return nil, &cerr.CustomError{
			Code:    http.StatusBadRequest,
			Message: "please enter correct otp",
		}
	}

	otpMu.Lock()
	delete(otpSessions, verification)
	otpMu.Unlock()

	user := findUserByPhone(phone)
	if user == nil {
		return nil, &cerr.CustomError{
			Code:    http.StatusNotFound,
			Message: "no user found with number " + phone,
		}
	}
	token, err := CreateToken(user.ID, user.Name)
	if err != nil {
		return nil, &cerr.CustomError{
			Code:    http.StatusInternalServerError,
			Message: "error in creating the token",
		}
	}
	return &token, nil
}
