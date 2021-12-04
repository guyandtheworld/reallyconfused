package models


import (
    "time"
	"github.com/jinzhu/gorm"
	jwt "github.com/dgrijalva/jwt-go"
)


//User struct declaration
type User struct {
	gorm.Model
	Name     				string 			`json:"name"`
	Email    				string 			`gorm:"type:varchar(100);unique_index"`
	Password 				string 			`json:"password"`
	NickName 				string 			`json:"nick_name"`
	LoginSource				string			`json:"LoginSource"`
	Type        			string          `json:"type"`
	Github        			string          `json:"github"`
	Twitter        			string          `json:"twitter"`
	LinkedIn        		string          `json:"linkedin"`
	ContactLink        		string          `json:"contact_link"`
	EmailVerified   		bool 			`json:"email_verified"`
	Premium   				bool 			`json:"premium"`
    PremiumDate     		time.Time       `json:"premium_date"`
    JoinedDate      		time.Time       `json:"join_date"`
	SubscriptionID          string 			`json:"subscription_id"`
	PurchaserID          	string 			`json:"purchaser_id"`
	SaleTimestamp           string  		`json:"sales_timestamp"`
	SaleID          		string 			`json:"sale_id"`
}


type Premium struct {
	Email          			string 			`json:"email"`
	UserID          		int 			`json:"user_id"`
	SubscriptionID          string 			`json:"subscription_id"`
	PurchaserID          	string 			`json:"purchaser_id"`
	SaleTimestamp           string  		`json:"sales_timestamp"`
	SaleID          		string 			`json:"sale_id"`
}


type Token struct {
	UserID 				uint
	Name   				string
	Email  				string
	*jwt.StandardClaims
}


type Feedback struct {
	/*
		Collect feedback and Reachable_Email from the User
	*/
	gorm.Model
    UserID           int            `gorm:"TYPE:integer REFERENCES users" json:"user"`
	Feedback    	 string         `json:"feedback"`
	Email 			 string 		`json:"reachable_email"`
}


type ScheduleCall struct {
	/*
		Collect feedback and Reachable_Email from the User
	*/
	gorm.Model
    UserID           int            `gorm:"TYPE:integer REFERENCES users" json:"user"`
	Email 			 string 		`json:"reachable_email"`
	Interest    	 string         `json:"interest"`
	Ambition    	 string         `json:"ambition"`
}


type PasswordResetToken struct {
	/*
		Collect feedback and Reachable_Email from the User
	*/
	gorm.Model
	UUID 			 string 		`json:"uuid"`
	UserID           uint           `json:"user"`
	Used  		     bool 			`json:"used"`
}
