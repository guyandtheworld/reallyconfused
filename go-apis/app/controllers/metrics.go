package controllers

import (
	"encoding/json"
	"net/http"

    "github.com/guyandtheworld/reallyconfused-apis/app/models"
    "github.com/guyandtheworld/reallyconfused-apis/app/database"
)


func CreateClick(w http.ResponseWriter, r *http.Request) {
	/*
	Create a roadmap click
	*/

	var click models.Click

	err := json.NewDecoder(r.Body).Decode(&click)

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Return Success if object exists
	if database.Conn.Create(&click).Error == nil {
		SetSuccessHeader(w)
	}
}
