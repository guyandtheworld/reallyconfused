package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"

    "github.com/guyandtheworld/reallyconfused-apis/app/database"
    "github.com/guyandtheworld/reallyconfused-apis/app/models"
)


func FetchOrganizations(w http.ResponseWriter, r *http.Request) {
	/*
	Return all organizations that are public and completed
	*/
	organizations := []models.Organization{}
	database.Conn.Find(&organizations)
	json.NewEncoder(w).Encode(organizations)
}


func CreateOrganization(w http.ResponseWriter, r *http.Request) {
	/*
	Create an organization if you're an admin
	*/

	var organization models.Organization
	var user models.User

	err := json.NewDecoder(r.Body).Decode(&organization)

	tokenUser := r.Context().Value("user")
	userID := tokenUser.(*models.Token).UserID

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Get user object
	if database.Conn.First(&user, userID).Error != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if user.Type == "manager" {
			organization.Creator = int(userID)
			// Return Success if object exists
			if database.Conn.Create(&organization).Error == nil {

				// set organization ID for the user
				// user.OrganizationID = int(organization.ID)
				// database.Conn.Model(&user).Updates(&user)

				SetSuccessHeader(w)
				json.NewEncoder(w).Encode(organization)
			}
		} else {
			SetErrorHeader(w, `{"message":"user is not authenticated"}`)
		}
	}
}


func FetchCohorts(w http.ResponseWriter, r *http.Request) {
	/*
	Create an organization if you're an admin
	*/
	param := mux.Vars(r)
	cohorts := []models.Cohort{}
	database.Conn.Where("organization_id = ?", param["id"]).Where("active = ?", true).Find(&cohorts)
	json.NewEncoder(w).Encode(cohorts)
}


func CreateCohort(w http.ResponseWriter, r *http.Request) {
	/*
	Create an organization if you're an admin
	*/

	var cohort models.Cohort
	var user models.User

	err := json.NewDecoder(r.Body).Decode(&cohort)

	tokenUser := r.Context().Value("user")
	userID := tokenUser.(*models.Token).UserID

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Get user object
	if database.Conn.First(&user, userID).Error != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if user.Type == "manager" {
			// Return Success if object exists
			if database.Conn.Create(&cohort).Error == nil {
				SetSuccessHeader(w)
				json.NewEncoder(w).Encode(cohort)
			}
		} else {
			SetErrorHeader(w, `{"message":"user is not authenticated"}`)
		}
	}
}


func CreateCohortRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Create an cohort roadmap mapping
	*/
	var mapping models.CohortRoadmapMap

	err := json.NewDecoder(r.Body).Decode(&mapping)

	tokenUser := r.Context().Value("user")
	userID := tokenUser.(*models.Token).UserID

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// check if a session exists, shouldn't create mapping.
	err = database.Conn.Where("roadmap_id = ?", mapping.RoadmapID).Where("cohort_id = ?", mapping.CohortID).First(&models.CohortRoadmapMap{}).Error

	if err == gorm.ErrRecordNotFound {
		mapping.UserID = int(userID)

		var cohort models.Cohort
		database.Conn.First(&cohort, mapping.CohortID)

		mapping.End = cohort.StepsToRecord

		if database.Conn.Create(&mapping).Error == nil {

			// user := &models.User{}
			// database.Conn.Where("id = ?", int(userID)).First(&user)

			// set CohortID & RoadmapID in the User so that it shows up user/profile
			// user.CohortID = mapping.CohortID
			// user.CohortRoadmap = mapping.RoadmapID
			// database.Conn.Save(&user)

			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(mapping)
		}
	} else {
		SetErrorHeader(w, `{"message":"record already exists"}`)
	}
}


func GetOrganizationDetails(w http.ResponseWriter, r *http.Request) {
	/*
	Get details on the organization details. Number of cohorts.
	And for each cohort, get
	{
		number_of_cohort: Count
		CohortID: [
			RoadmapID - RoadmapID with the title.
			UserID - Fetch the user name. If it doesn't exist, the first part of email
			VerifiedByCohort
			Start
			Current
			End
			LatestEntry - Preload the RoadmapID
		]
	}

	*/

	var organization models.Organization
	var user models.User

	param := mux.Vars(r)

	tokenUser := r.Context().Value("user")
	userID := tokenUser.(*models.Token).UserID

	if e := database.Conn.Where("id = ?", param["id"]).First(&organization).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		query := `
		select json_build_object(
			'organization', (array_agg(org))[1],
			'cohorts', array_agg(
				json_build_object(
					cohort_id, cohort_desc
				)
			)
		)
		from
		(
			select mixed.cohort_id, jsonb_agg(
				to_jsonb(mixed) - 'created_at'
				- 'deleted_at' - 'updated_at'
				- 'cohort_id' - 'id') as cohort_desc from
			(
				select * from
				cohort_roadmap_maps cr
				inner join
				(
					select id, name, email from users
				) us
				on cr.user_id = us.id
				inner join
				(
					select id, title from roadmaps
				) rm
				on cr.roadmap_id = rm.id
				where cohort_id in
				(
					select id from cohorts
					where organization_id = ?
				)
			) mixed
			group by cohort_id
		) cohort_table,
		(
			select json_build_object(
					'id', id,
					'name', name
				) as org
			from organizations
			where id = ?
		) org_table`

		// Get user object
		if database.Conn.First(&user, userID).Error != nil {
			SetErrorHeader(w, `{"message":"data not found"}`)
		} else {
			if user.Type == "manager" {
				var jsonData *json.RawMessage
				err := database.Conn.Raw(query, param["id"], param["id"]).Row().Scan(&jsonData)

				if err != nil {
					SetErrorHeader(w, `{"message":"data not found"}`)
				} else {
					SetSuccessHeader(w)
					jData, _ := json.Marshal(jsonData)
					w.Write(jData)
				}
			} else {
				SetErrorHeader(w, `{"message":"user is not authenticated"}`)
			}
		}
	}
}


func UpdateCohortRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Update CohortRoadmap to make it verified.
	*/

	var mapping models.CohortRoadmapMap
	var user models.User

	userToken := r.Context().Value("user")
	userID := int(userToken.(*models.Token).UserID)

	database.Conn.First(&user, userID)
	_ = json.NewDecoder(r.Body).Decode(&mapping)

	if e := database.Conn.Where("id = ?", mapping.ID).First(&models.CohortRoadmapMap{}).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if mapping.UserID == userID || user.Type == "manager" {
			database.Conn.Model(&mapping).Updates(&mapping)
			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(&mapping)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to edit"}`)
		}
	}
}


func DeleteCohortRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Delete the entry to the Cohort map
	Also edit the is_cohort is true from the roadmap
	*/

	var mapping models.CohortRoadmapMap
	var user models.User

	userToken := r.Context().Value("user")
	userID := int(userToken.(*models.Token).UserID)

	database.Conn.First(&user, userID)
	_ = json.NewDecoder(r.Body).Decode(&mapping)

	if e := database.Conn.Where("id = ?", mapping.ID).First(&models.CohortRoadmapMap{}).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if mapping.UserID == userID || user.Type == "manager" {

			roadmapID := mapping.RoadmapID
			database.Conn.Model(&mapping).Delete(&mapping)

			// Set roadmap IsCohort as false
			var roadmap models.Roadmap
			database.Conn.Where("id = ?", roadmapID).First(&roadmap)
			*roadmap.IsCohort = false
			database.Conn.Save(&roadmap)

			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(&mapping)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to edit"}`)
		}
	}
}


func FetchRoadmapStep(w http.ResponseWriter, r *http.Request) {
	/*
	Return the details of one RoadmapStep to display on hover
	to the cohort manager
	*/
	param := mux.Vars(r)
	var roadmapStep models.RoadmapStep
	var user models.User

	userToken := r.Context().Value("user")
	userID := int(userToken.(*models.Token).UserID)
	database.Conn.First(&user, userID)

	if database.Conn.First(&roadmapStep, param["id"]).Error != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if user.Type == "manager" {
			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(roadmapStep)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to edit"}`)
		}
	}
}
