package utils

import (
	"log"
	"fmt"
	"net/smtp"
	"github.com/google/uuid"

	"github.com/guyandtheworld/reallyconfused-apis/app/database"
	"github.com/guyandtheworld/reallyconfused-apis/app/models"
)

func SendEmail(email string) {
	/*
		Creates new password reset token
		and send email to the user
	*/

	var user models.User

	if e := database.Conn.Where("email = ?", email).First(&user).Error; e != nil {
		return
	}

	from := database.SupportEmail
	pass := database.SupportPassword
	to := email

	varUUID := uuid.Must(uuid.NewRandom()).String()

	body := `
				---------------------------------------------------------------------
				ReallyConfused.co Password Reset
				---------------------------------------------------------------------

				Hi,

				To reset the password to your ReallyConfused account, click the link below:

				%s

				If the above link is not clickable, please copy the whole link and
				paste it in your browser.

				Should you have any questions or concerns, please contact us at 
				reallyconfused.co@gmail.com or just reply to this email.

				Sincerely,
				The ReallyConfused Team
				https://reallyconfused.co/

				---------------------------------------------------------------------
				`

	// create and store password reset Token in the database
	var token models.PasswordResetToken
	token.UserID = user.ID
	token.UUID = varUUID
	token.Used = false

	if database.Conn.Create(&token).Error != nil {
		return
	}

	body = fmt.Sprintf(body, varUUID)

	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: ReallyConfused Account Password Reset\n\n" +
		body

	err := smtp.SendMail("smtp.gmail.com:587",
		smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
		from, []string{to}, []byte(msg))

	if err != nil {
		log.Printf("smtp error: %s", err)
		return
	}
	
	log.Print("sent, visit your inbox")
}
