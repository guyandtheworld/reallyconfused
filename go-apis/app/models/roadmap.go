package models

import (
    "time"
    "github.com/jinzhu/gorm"
)


/* Stores the Roadmap related structs */


type Roadmap struct {
    gorm.Model
    Title           string          `json:"title"`
    Description     string          `json:"description"`
    Username        string          `json:"username"`
    UniqueLink      string          `json:"unique_link"`
    Userlink        string          `json:"userlink"`
    CreatedPublic   bool            `json:"created_public"`
    SocialMedia     string          `json:"social_media"`
    CreatorName     string          `json:"creator_name"`
    Owner           int             `gorm:"TYPE:integer REFERENCES users" json:"owner"`
    Creator         int             `gorm:"TYPE:integer REFERENCES users" json:"creator"`
    Steps           []RoadmapStep   `json:"steps"`
    Start           int             `gorm:"TYPE:integer REFERENCES steps" json:"start"`
    End             int             `gorm:"TYPE:integer REFERENCES steps" json:"end"`
    Parent          int             `json:"parent"`
    StepCount       int             `json:"step_count"`
    TimeTaken       int             `json:"time_taken"`
    Cost            int             `json:"cost"`
    Stars           int             `json:"stars"`
    Simplified      *bool           `json:"simplified" sql:"DEFAULT:false"`
    IsCohort        *bool           `json:"is_cohort"`
    Mentored        *bool           `json:"mentored"`
    Featured        *bool           `gorm:"not null; default:false;" json:"featured"`
    Private         *bool           `json:"private"`
    Incomplete      *bool           `json:"incomplete"`
    Draft           *bool           `json:"draft"`
    Tags            []TagList       `json:"tags"`
    Forked          *bool           `json:"forked"`
}


type RoadmapStep struct {
    /*
        Helps in creation of Roadmap and following a roadmap with a date
    */
    gorm.Model
    StepID           int            `gorm:"TYPE:integer REFERENCES steps" json:"step"`
    RoadmapID        int            `json:"roadmap"`
    UserID           int            `gorm:"TYPE:integer REFERENCES users" json:"user"`
    Position         float32        `gorm:"not null;" json:"position"`
    IsStart          bool           `gorm:"not null;" json:"is_start"`
    IsEnd            bool           `gorm:"not null;" json:"is_end"`
    InProgress       bool           `gorm:"not null;" json:"in_progress"`
    Completed        *bool          `gorm:"not null; default:false;" json:"completed"`
    Description1     string         `json:"description_1"` // Why did you decide to do this
    DueDate          time.Time      `gorm:"NOT NULL;" json:"due_date"`
    CompletedDate    time.Time      `gorm:"NOT NULL;" json:"completed_date"`
}


type TagList struct {
    /*
        Tells you what type of roadmap it is
    */
    gorm.Model
    TagID            int            `gorm:"TYPE:integer REFERENCES roadmap_tags" json:"tag"`
    RoadmapID        int            `json:"roadmap_id"`
}


type RoadmapTag struct {
    gorm.Model
    Tag             string          `gorm:"type:varchar(20); not null; unique;" json:"tag"`
    Description     string          `json:"description"`
}


type Step struct {
    gorm.Model
    // what happens on stepType delete?
    StepTypeID      int             `gorm:"TYPE:integer REFERENCES step_types" json:"step_type"`
    Title           string          `gorm:"not null;" json:"title"`
    Link            string          `gorm:"not null;" json:"link"`
    Cost            int             `gorm:"not null;" json:"cost"`
    UserID          int             `json:"user_id"`
}


type StepType struct {
    gorm.Model
    Name            string          `gorm:"type:varchar(20); not null; unique;" json:"name"`
    Description     string          `json:"description"`
}


type Star struct {
    gorm.Model
    UserID           int             `gorm:"TYPE:integer REFERENCES users" json:"user"`
    RoadmapID        int             `gorm:"TYPE:integer REFERENCES roadmaps" json:"roadmap"`
}


type Career struct {
    gorm.Model
    Name            string          `gorm:"type:varchar(30); not null; unique;" json:"name"`
}


type CareerMap struct {
    gorm.Model
    CareerID        int             `gorm:"TYPE:integer REFERENCES careers" json:"career"`
    StepID          int             `gorm:"TYPE:integer REFERENCES steps" json:"step"`
}


type RoadmapPursue struct {
    gorm.Model
    CreatorUserID             int             `gorm:"TYPE:integer REFERENCES users" json:"creator_user"`
    PursuedUserID             int             `gorm:"TYPE:integer REFERENCES users" json:"pursued_user"`
    CreatorRoadmapID          int             `gorm:"TYPE:integer REFERENCES roadmaps" json:"creator_roadmap"`
    PursuedRoadmapID          int             `gorm:"TYPE:integer REFERENCES roadmaps" json:"pursued_roadmap"`
}
