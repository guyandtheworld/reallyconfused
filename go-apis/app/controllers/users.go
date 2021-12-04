package controllers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"

	jwt "github.com/dgrijalva/jwt-go"
    "github.com/guyandtheworld/reallyconfused-apis/app/database"
    "github.com/guyandtheworld/reallyconfused-apis/app/models"
    "github.com/guyandtheworld/reallyconfused-apis/app/utils"
)


type ErrorResponse struct {
	Err string
}


type error interface {
	Error() string
}


func CreateUser(w http.ResponseWriter, r *http.Request) {
	/*
	Create a user
	*/

	user := &models.User{}
	json.NewDecoder(r.Body).Decode(user)

	pass, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println(err)
		err := ErrorResponse{
			Err: "Password Encryption  failed",
		}
		json.NewEncoder(w).Encode(err)
	}

	user.Password = string(pass)

	createdUser := database.Conn.Create(user)
	var errMessage = createdUser.Error

	if createdUser.Error != nil {
		fmt.Println(errMessage)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Response-Code", "06")
		w.Header().Set("Response-Desc", "Data Not Found")
		w.WriteHeader(404)
		json.NewEncoder(w).Encode(createdUser.Error)
	} else {
		SetSuccessHeader(w)
		w.Write([]byte(`{"message":"user creation successful"}`))
	}
}


func Login(w http.ResponseWriter, r *http.Request) {
	/*
	Check if user exists, login if it's present
	*/

	var user struct {
        Email 		string   `json:"email"`
		Password 	string   `json:"password"`
		Redirect	string   `json:"redirect"`
    }

	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		var resp = map[string]interface{}{"status": false, "message": "Invalid request"}
		json.NewEncoder(w).Encode(resp)
		return
	}
	resp := FindOne(user.Email, user.Password)

	// return redirect url to /oauth with token and redirect url

	if user.Redirect != "" {
		url := "https://reallyconfused.co/oauth?token=" + resp["token"].(string) + "&redirect=" + user.Redirect
		http.Redirect(w, r, url, http.StatusMovedPermanently)
	} else {
		json.NewEncoder(w).Encode(resp)
	}
}


func FindOne(email, password string) map[string]interface{} {
	user := &models.User{}

	if err := database.Conn.Where("Email = ?", email).First(user).Error; err != nil {
		var resp = map[string]interface{}{"status": false, "message": "Email address not found"}
		return resp
	}

	expiresAt := time.Now().Add(time.Minute * 100000).Unix()

	errf := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if errf != nil && errf == bcrypt.ErrMismatchedHashAndPassword { //Password does not match!
		var resp = map[string]interface{}{"status": false, "message": "Invalid login credentials. Please try again"}
		return resp
	}

	tk := &models.Token{
		UserID: user.ID,
		Name:   user.Name,
		Email:  user.Email,
		StandardClaims: &jwt.StandardClaims{
			ExpiresAt: expiresAt,
		},
	}

	token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"), tk)

	tokenString, error := token.SignedString([]byte(database.Secret))
	if error != nil {
		fmt.Println(error)
	}

	var resp = map[string]interface{}{"status": false, "message": "logged in"}
	resp["token"] = tokenString //Store the token in the response
	// resp["user"] = user
	return resp
}


func UserProfile(w http.ResponseWriter, r *http.Request) {
	/*
		Returns the Email and Name of the user & Cohort Details
	*/
	user := r.Context().Value("user");

    var email struct {
		Email 			string   		`json:"email"`
		Name 			string 	 		`json:"name"`
		UserID 			uint 	 		`json:"user_id"`
		Premium   		bool 			`json:"premium"`
		PremiumDate     time.Time       `json:"premium_date"`
		// Cohort Details, Type here for loading the user/profile
    }

	email.Email = user.(*models.Token).Email
	email.Name = user.(*models.Token).Name
	email.UserID = user.(*models.Token).UserID

	var dbUser models.User

	database.Conn.First(&dbUser, email.UserID)

	// Add premium date to the email
	email.Premium = dbUser.Premium
	email.PremiumDate = dbUser.PremiumDate

	SetSuccessHeader(w)
	json.NewEncoder(w).Encode(email)
}


func ResetPassword(w http.ResponseWriter, r *http.Request) {
	/*
		Sends reset password link
	*/

	reqBody, _ := ioutil.ReadAll(r.Body)
    var email struct {
        Email 	string   `json:"email"`
    }

	json.Unmarshal(reqBody, &email)
	utils.SendEmail(email.Email)
	SetSuccessHeader(w)
	w.Write([]byte(`{"message":"email has been sent to the account"}`))
}


func ResetPasswordFromEmail(w http.ResponseWriter, r *http.Request) {
	/*
		Process user UUID for reset password and checks if
		the generated UUID is valid based on time, is not used
		and is in our database. If it is,
		* we return a new token associated with user (from UUID table) for reseting password.
		* set token as used
	*/

	reqBody, _ := ioutil.ReadAll(r.Body)

    var uuid struct {
        UUID 	string   `json:"uuid"`
    }

	json.Unmarshal(reqBody, &uuid)

	w.Write([]byte("Hello " + uuid.UUID))

	SetSuccessHeader(w)
	// w.Write([]byte(`{"message":"email has been sent to the account"}`))
}


func NewPassword(w http.ResponseWriter, r *http.Request) {
	/*
		Checks if the token sent is associated with the
		user and saves the new hash of the password
		for the user.

		Return new token.
	*/

	SetSuccessHeader(w)
	w.Write([]byte(`{"message":"password was successfully reset"}`))
}


func Feedback(w http.ResponseWriter, r *http.Request){
	/*
	Curate feedback from users.
	*/

	var feedback models.Feedback

	err := json.NewDecoder(r.Body).Decode(&feedback)

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Return Success if object exists
	if database.Conn.Create(&feedback).Error == nil {
		SetSuccessHeader(w)
		json.NewEncoder(w).Encode(feedback)
	}
}


func ScheduleCall(w http.ResponseWriter, r *http.Request){
	/*
	Curate feedback from users.
	*/

	var scheduleCall models.ScheduleCall

	err := json.NewDecoder(r.Body).Decode(&scheduleCall)

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Return Success if object exists
	if database.Conn.Create(&scheduleCall).Error == nil {
		SetSuccessHeader(w)
		json.NewEncoder(w).Encode(scheduleCall)
	}
}


func UpgradeToPremium(w http.ResponseWriter, r *http.Request){
	/*
	Upgrade to Premium
	*/
	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID

	reqBody, _ := ioutil.ReadAll(r.Body)

	var owner struct {
        UserID  	int   `json:"id"`
    }

	json.Unmarshal(reqBody, &owner)

	if owner.UserID == int(userID) {

		// upgrade user to premium
		var dbUser models.User

		database.Conn.First(&dbUser, userID)

		// Add premium date to the email
		dbUser.Premium = true
		dbUser.PremiumDate = time.Now()

		database.Conn.Save(&dbUser)

		SetSuccessHeader(w)
	} else {
		SetErrorHeader(w, `{"message":"not authorized to edit"}`)
	}
}


func GetUserProfileDetails(w http.ResponseWriter, r *http.Request) {
	/*
	* Get user details
	* Take in roadmap-id, and return user details
	*/

    var serveUser struct {
		Email 			string   		`json:"email"`
		Name 			string 	 		`json:"name"`
		UserID 			uint 	 		`json:"user_id"`
		Github 			string 			`json:"github"`
		Twitter 		string 			`json:"twitter"`
		LinkedIn 		string 			`json:"linkedin"`
		ContactLink		string 			`json:"contact_link"`
		EmailVerified	bool 			`json:"email_verified"`
    }


	if r.URL.Query().Get("roadmap") != ""  {
		var roadmap models.Roadmap
		var user models.User

		roadmapID := r.URL.Query().Get("roadmap")
		database.Conn.Where("id = ?", roadmapID).Find(&roadmap)
		database.Conn.Where("id = ?", roadmap.Owner).Find(&user)
		serveUser.Name = user.Name
		serveUser.UserID = user.ID
	} else {
		user := r.Context().Value("user");
		serveUser.Email = user.(*models.Token).Email
		serveUser.Name = user.(*models.Token).Name
		serveUser.UserID = user.(*models.Token).UserID
	}

	var dbUser models.User

	database.Conn.First(&dbUser, serveUser.UserID)

	// Add premium date to the email
	serveUser.Github = dbUser.Github
	serveUser.Twitter = dbUser.Twitter
	serveUser.LinkedIn = dbUser.LinkedIn
	serveUser.ContactLink = dbUser.ContactLink
	serveUser.EmailVerified = dbUser.EmailVerified

	SetSuccessHeader(w)
	json.NewEncoder(w).Encode(serveUser)
}


func UpdateUserProfileDetails(w http.ResponseWriter, r *http.Request) {
	/*
	We will use this to Update the profile settings
	*/

	var user models.User

	userToken := r.Context().Value("user")
	userID := userToken.(*models.Token).UserID

	_ = json.NewDecoder(r.Body).Decode(&user)

	if e := database.Conn.Where("id = ?", user.ID).First(&models.User{}).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if user.ID == userID {
			database.Conn.Model(&user).Updates(&user)
			SetSuccessHeader(w)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to edit"}`)
		}
	}
}
