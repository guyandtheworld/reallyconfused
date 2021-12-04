package controllers

import (
	"net/http"
	"net/url"
	"fmt"
	"html/template"
	"time"
	"encoding/json"
	"strconv"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"

	"github.com/markbates/goth/gothic"
	"github.com/guyandtheworld/reallyconfused-apis/app/models"
	"github.com/guyandtheworld/reallyconfused-apis/app/database"
)


func OauthLogin(w http.ResponseWriter, r *http.Request) {
	/*
	Returns a redirect link to google sign-in
	*/

	if gothUser, err := gothic.CompleteUserAuth(w, r); err == nil {
		t, _ := template.New("foo").Parse(userTemplate)
		t.Execute(w, gothUser)
	} else {
		SetSuccessHeader(w)
		url, _ := gothic.GetAuthURL(w, r)
		http.Redirect(w, r, url, http.StatusMovedPermanently)
	}
}



func GumroadPing(w http.ResponseWriter, r *http.Request) {
	/*
	Returns a redirect link to google sign-in
	*/

	r.ParseForm()

	var email string
	if len(r.Form["email"]) > 0 {
		email = r.Form["email"][0]
	}

	purchaserID := r.Form["purchaser_id"][0]

	var userID int
	if len(r.Form["url_params[userid]"]) > 0 {
		id, err := strconv.Atoi(r.Form["url_params[userid]"][0]);

		if err == nil {
			userID = id
		}
	}

	saleTimestamp := r.Form["sale_timestamp"][0]
	saleID := r.Form["sale_id"][0]

	premium := &models.Premium{}
	premium.Email = email
	premium.PurchaserID = purchaserID
	premium.UserID = userID
	premium.SaleTimestamp = saleTimestamp
	premium.SaleID = saleID

	err:= database.Conn.Create(premium).Error

	user := &models.User{}

	if userID != 0 {
		err = database.Conn.Where("id = ?", userID).First(user).Error;
		if err != nil {
			err = database.Conn.Where("email = ?", email).First(user).Error;
		}
	} else if email != "" {
		// for github we're not storing the email
		err = database.Conn.Where("email = ?", email).First(user).Error;
	}

	user.Premium = true
	user.PremiumDate = time.Now()
	user.PurchaserID = purchaserID
	user.SaleTimestamp = saleTimestamp
	user.SaleID = saleID

	database.Conn.Save(&user)

	SetSuccessHeader(w)
}



func OauthCallback(w http.ResponseWriter, r *http.Request) {
	/*
	Handles the email and profile returned by Google callback.
	Redirected to Next.js which calls this URL.

	If email isn't in our database, create new user and return
	jwt token.

	If email is in our database, return a new jwt token
	*/

	state := r.URL.Query().Get("state")

	redirect := false

	redirectUrl, err := url.ParseRequestURI(state)
	if err == nil {
	   redirect = true
	}

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		fmt.Fprintln(w, err)
		return
	}

	param := mux.Vars(r)

	// fetch email from github
	if param["provider"] == "github" {
		req, err := http.NewRequest("GET", "https://api.github.com/user/emails", nil)
		req.Header.Add("Authorization", "Bearer " + user.AccessToken)
		response, err := http.DefaultClient.Do(req)
		if err != nil {
			if response != nil {
				response.Body.Close()
			}

			var mailList = []struct {
				Email    string `json:"email"`
				Primary  bool   `json:"primary"`
				Verified bool   `json:"verified"`
			}{}

			err = json.NewDecoder(response.Body).Decode(&mailList)

			for _, v := range mailList {
				if v.Primary && v.Verified {
					user.Email = v.Email
				}
			}
		}
	}

	userModel := &models.User{}
	if param["provider"] == "google" || user.Email != "" {
		err = database.Conn.Where("email = ?", user.Email).First(userModel).Error;
	} else {
		// for github we're not storing the email
		err = database.Conn.Where("nick_name = ?", user.NickName).First(userModel).Error;
	}

	// check if email is present in the database
	if err != nil {
		userModel.Name = user.Name

		if user.Email != "" {
			userModel.Email = user.Email
		} else {
			userModel.Email = user.NickName
		}

		userModel.EmailVerified = true
		userModel.LoginSource = param["provider"]
		userModel.NickName = user.NickName
		userModel.Type = "learner"
		userModel.JoinedDate = time.Now()

		err = database.Conn.Create(userModel).Error
		if err != nil {
			SetErrorHeader(w, `{"message": "Something went wrong."}`)
		}
	}

	// fetch user model

	// return front-end url with jwt
	expiresAt := time.Now().Add(time.Minute * 100000).Unix()

	tk := &models.Token{
		UserID: userModel.ID,
		Name:   userModel.Name,
		Email:  userModel.Email,
		StandardClaims: &jwt.StandardClaims{
			ExpiresAt: expiresAt,
		},
	}

	token := jwt.NewWithClaims(jwt.GetSigningMethod("HS256"), tk)

	tokenString, error := token.SignedString([]byte(database.Secret))
	if error != nil {
		fmt.Println(error)
	}

	url := "https://reallyconfused.co/oauth?token=" + tokenString

	if redirect {
		url = url + "&redirect=" + redirectUrl.String()
	}

	http.Redirect(w, r, url, http.StatusMovedPermanently)
}



func RegisterOauthUser(w http.ResponseWriter, r *http.Request) {
	/*
	Handles the email and profile returned by Google callback.
	Redirected to Next.js which calls this URL.

	If email isn't in our database, create new user and return
	jwt token.

	If email is in our database, return a new jwt token
	*/


	payload := struct {
		Name    			string `json:"name"`
		Email    			string `json:"email"`
		Provider    		string `json:"provider"`
		GithubUsername    	string `json:"github_username"`
	}{}

	_ = json.NewDecoder(r.Body).Decode(&payload)

	user := &models.User{}
	var err error

	if payload.Provider == "google" || payload.Email != "" {
		err = database.Conn.Where("email = ?", payload.Email).First(user).Error;
	} else {
		// for github we're not storing the email
		err = database.Conn.Where("nick_name = ?", payload.GithubUsername).First(user).Error;
	}

	// check if email is present in the database
	if err != nil {
		user.Name = payload.Name

		if payload.Email != "" {
			user.Email = payload.Email
		} else {
			user.Email = payload.GithubUsername
		}

		user.EmailVerified = true
		user.LoginSource = payload.Provider
		user.NickName = payload.GithubUsername
		user.Type = "learner"
		user.JoinedDate = time.Now()

		err = database.Conn.Create(user).Error
		if err != nil {
			SetErrorHeader(w, `{"message": "Something went wrong."}`)
		}
	}

	// fetch user model
	// return front-end url with jwt
	expiresAt := time.Now().Add(time.Minute * 100000).Unix()

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

	response := struct {
		Token	string `json:"token"`
		Status	bool `json:"status"`
	}{}

	response.Token = tokenString
	response.Status = true

    json.NewEncoder(w).Encode(response)
}


// remove this?
var userTemplate = `
<p><a href="/logout/{{.Provider}}">logout</a></p>
<p>Name: {{.Name}} [{{.LastName}}, {{.FirstName}}]</p>
<p>Email: {{.Email}}</p>
<p>NickName: {{.NickName}}</p>
<p>Location: {{.Location}}</p>
<p>AvatarURL: {{.AvatarURL}} <img src="{{.AvatarURL}}"></p>
<p>Description: {{.Description}}</p>
<p>UserID: {{.UserID}}</p>
<p>AccessToken: {{.AccessToken}}</p>
<p>ExpiresAt: {{.ExpiresAt}}</p>
<p>RefreshToken: {{.RefreshToken}}</p>
`