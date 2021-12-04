package controllers

import (
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/guyandtheworld/reallyconfused-apis/app/database"
	"github.com/guyandtheworld/reallyconfused-apis/app/models"
)


func CreateReminder(w http.ResponseWriter, r *http.Request) {
	/*
	Create Reminder for Roadmap
	*/

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID

	reqBody, _ := ioutil.ReadAll(r.Body)
    var reminder models.ReminderTime
	json.Unmarshal(reqBody, &reminder)

	if int(userID) == reminder.UserID {
		database.Conn.Create(&reminder)
		json.NewEncoder(w).Encode(reminder)
	} else {
		SetErrorHeader(w, `{"message":"not authorized to create"}`)
	}
}


func ListReminder(w http.ResponseWriter, r *http.Request) {
	/*
	List reminders for a person
	*/

	filters := struct {
        UserID  	int   `json:"user"`
        RoadmapID  	int   `json:"roadmap"`
	}{}

	reqBody, _ := ioutil.ReadAll(r.Body)
	json.Unmarshal(reqBody, &filters)
	reminders := []models.ReminderTime{}

	if filters.UserID != 0 && filters.RoadmapID != 0 {
		database.Conn.Where("user_id = ?", filters.UserID).Where("roadmap_id = ?", filters.RoadmapID).Find(&reminders)
		SetSuccessHeader(w)
		json.NewEncoder(w).Encode(reminders)
	} else {
		SetErrorHeader(w, `{"message":"no user ID passed"}`)
	}

}


func DeleteReminder(w http.ResponseWriter, r *http.Request) {
	/*
	Create Reminder for Roadmap
	*/

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID

	param := mux.Vars(r)

	var reminder models.ReminderTime
	database.Conn.Where("id = ?", param["id"]).First(&reminder)

	if int(userID) == reminder.UserID {
		database.Conn.Model(&reminder).Delete(&reminder)
		json.NewEncoder(w).Encode(reminder)
	} else {
		SetErrorHeader(w, `{"message":"not authorized to delete"}`)
	}
}
