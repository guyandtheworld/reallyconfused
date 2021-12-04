package models

import (
    "github.com/jinzhu/gorm"
)


type ReminderTime struct {
    gorm.Model
	UserID         int             `gorm:"TYPE:integer REFERENCES users" json:"user"`
	RoadmapID      int             `gorm:"TYPE:integer REFERENCES roadmaps" json:"roadmap"`
    Day      	   int             `json:"day"`
    Hour      	   int             `json:"hour"`
	Timezone       string          `json:"timezone"`
}


type ReminderEmail struct {
    gorm.Model
	Subject       string          `json:"subject"`
	Body       	  string          `json:"body"`
	StepID        int             `gorm:"TYPE:integer REFERENCES steps" json:"step"`
}
