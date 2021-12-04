package models


import (
	"time"
	"github.com/jinzhu/gorm"
)


//Organization to monitor student progress
type Organization struct {
	gorm.Model
	Name     					string 			`json:"name"`
	Description     			string 			`json:"description"`
	Creator         			int             `gorm:"TYPE:integer REFERENCES users" json:"creator"`
	Retired 					*bool			`json:"retired"`
}


type Cohort struct {
	gorm.Model
	OrganizationID           	int             `gorm:"TYPE:integer REFERENCES organizations" json:"organization"`
	Title     		 		 	string 			`json:"title"`
	Description     		 	string 			`json:"description"`
	Type     		 		 	string 			`json:"type"`
	Active					 	*bool			`json:"active"`
	Retired          			time.Time       `json:"retired"`
	Session					 	int			 	`json:"session"`
	CohortNumber     		 	int 			`json:"cohort_number"`
	StartGoal				 	[]Step			`json:"start_goal"`
	EndGoal				 	 	[]Step			`json:"end_goal"`
	StepsToRecord				int             `json:"steps_to_record"`
}


type CohortRoadmapMap struct {
	gorm.Model
    CohortID        			int             `gorm:"TYPE:integer REFERENCES cohorts" json:"cohort"`
    RoadmapID          			int             `gorm:"TYPE:integer REFERENCES roadmaps" json:"roadmap"`
	UserID						int             `gorm:"TYPE:integer REFERENCES users" json:"user"`
	VerifiedByCohort            *bool           `json:"verified_by_cohort"`
	Start  						int 			`json:"start"`
	Current						int 			`json:"current"`
	End 						int				`json:"end"`
	LatestEntry					int             `gorm:"TYPE:integer REFERENCES roadmap_steps" json:"latest_entry"`
}
