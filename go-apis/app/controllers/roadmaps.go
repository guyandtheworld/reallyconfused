package controllers

import (
	"encoding/json"
	"io/ioutil"
	"fmt"
	"net/http"
	"strconv"
	"time"
	"strings"
	"regexp"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"

    "github.com/guyandtheworld/reallyconfused-apis/app/database"
    "github.com/guyandtheworld/reallyconfused-apis/app/models"
)


const (
    // See http://golang.org/pkg/time/#Parse
    timeFormat = "2006-01-02 15:04:05"
)


func SetErrorHeader(w http.ResponseWriter, message string) {
	// Set Error Headers
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Response-Code", "06")
	w.Header().Set("Response-Desc", "Data Not Found")
	w.WriteHeader(404)
	w.Write([]byte(message))
}


func SetSuccessHeader(w http.ResponseWriter) {
	// Set Success Headers
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Response-Code", "00")
	w.Header().Set("Response-Desc", "Success")
}


func CreateUniqueLink(title string) string {
	// unique link for the roadmap
	str := strings.ToLower(title)

	str = strings.TrimSpace(str)

	// remove special characters
	reg, _ := regexp.Compile("[^a-zA-Z0-9 ]+")
	str = reg.ReplaceAllString(str, "")

	str = strings.ReplaceAll(str, " ", "-")

	// check if unique_link exists in db
	// if it does, get count and increment it
	count := 0
	database.Conn.Model(&models.Roadmap{}).Where("unique_link LIKE ?", str + "%").Count(&count)
	if count != 0 {
		str = str + "-" + strconv.Itoa(int(count))
	}

	return str
}

/*


***************** Roadmap ********************


*/


func FetchRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Fetch a Single Roadmap Information
	*/

	var roadmap models.Roadmap
	var filter string
	var roadmapID int

	param := mux.Vars(r)

	if _, err := strconv.Atoi(param["id"]); err == nil {
		filter = "id = ?"
	} else {
		filter = "unique_link = ?"
	}


	e := database.Conn.Where(filter, param["id"]).First(&roadmap).Error
	roadmapID = int(roadmap.ID)

	if e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		query := `select json_build_object(
							'id', rm.id,
							'owner', owner,
							'creator', creator,
							'social_media', social_media,
							'created_public', created_public,
							'creator_name', creator_name,
							'start', start,
							'end', rm.end,
							'step_count', step_count,
							'time_taken', time_taken,
							'username', rm.username,
							'userlink', rm.userlink,
							'name', us.name,
							'cost', cost,
							'private', private,
							'forked', forked,
							'is_cohort', is_cohort,
							'incomplete', incomplete,
							'simplified', simplified,
							'title', title,
							'stars', stars,
							'draft', draft,
							'steps', steps,
							'tags', tags
					) as roadmap from
					(
						select * from roadmaps
						where id = ?
					) rm,
					(   -- generates the steps with progress
						-- details for a particular roadmap
						select array_agg(
									json_build_object(
										'id', rs.id,
										'step_id', step_id,
										'step_type', name,
										'title', s.title,
										'date', completed_date,
										'completed', completed,
										'position', position,
										'is_start', is_start,
										'is_end', is_end,
										'title', title,
										'link', link,
										'description_1', description1,
										'description_2', description2,
										'cost', cost
									))
							as steps
						from (
								select id, step_id, roadmap_id, position, is_start, is_end,
								completed, completed_date, description1, description2
								from roadmap_steps rs
								where roadmap_id = ?
							) rs
						inner join
						( -- adds step_type.name to steps
							select sp.id, spt."name", title, link, "cost"
							from steps sp
							inner join
							step_types spt
							on sp.step_type_id = spt.id
						) s
						on rs.step_id = s.id
					) st,
					(	-- adds all the tags for a roadmap
						select array_agg(
									json_build_object(
										'id', tag_id,
										'tag', tag
									))
							as tags
						from (
								select * from tag_lists
								where roadmap_id = ?) tl
								inner join
								roadmap_tags rt
								on tl.tag_id = rt.id
					) tg,
					(
						select * from users where id =
						(select creator from roadmaps where id = ?)
					) us`

		var jsonData *json.RawMessage
		err := database.Conn.Raw(query, roadmapID, roadmapID, roadmapID, roadmapID).Row().Scan(&jsonData)

		if err != nil {
			SetErrorHeader(w, `{"message":"data not found"}`)
		} else {
			SetSuccessHeader(w)
			jData, _ := json.Marshal(jsonData)
			w.Write(jData)
		}
	}
}


func LearningJourneys(w http.ResponseWriter, r *http.Request) {
	/*
	Fetch all roadmaps that are being pursued.
	*/

	param := mux.Vars(r)

	roadmaps := []models.Roadmap{}
	database.Conn.Where("parent = ?", param["id"]).Find(&roadmaps)

    var rawJSONSlice []json.RawMessage

	for _, roadmap := range roadmaps {
		query := `select json_build_object(
						'id', rm.id,
						'owner', owner,
						'creator', creator,
						'creator_name', creator_name,
						'name', us.name,
						'incomplete', incomplete,
						'unique_link', unique_link ,
						'stars', stars,
						'steps', steps
				) as roadmap from (
					select * from roadmaps
					where id = ?
				) rm,
				(   -- generates the steps with progress
					-- details for a particular roadmap
					select array_agg(
								json_build_object(
									'title', s.title,
									'date', completed_date,
									'position', position,
									'title', title,
									'completed', completed,
									'description_1', description1
								))
						as steps
					from (
							select id, step_id, roadmap_id, position,
							completed, completed_date, description1, description2
							from roadmap_steps rs
							where roadmap_id = ?
						) rs
						inner join
						( -- adds step_type.name to steps
							select id, title
							from steps
						) s
						on rs.step_id = s.id
				) st,
				(
					select * from users where id =
					(select creator from roadmaps where id = ?)
				) us`

		var jsonData json.RawMessage
		database.Conn.Raw(query, roadmap.ID, roadmap.ID, roadmap.ID).Row().Scan(&jsonData)

		rawJSONSlice = append(rawJSONSlice, jsonData)
	}

	SetSuccessHeader(w)
	jData, _ := json.Marshal(rawJSONSlice)
	w.Write(jData)
}


func FetchAllRoadmaps(w http.ResponseWriter, r *http.Request) {
	/*
	Return all roadmaps that are public and completed
	*/

	startFilter := ""
	endFilter := ""

	// check if start step is passed
	if r.URL.Query().Get("start") != ""  {
		start := r.URL.Query().Get("start")
		startFilter = fmt.Sprintf(`id in (
			select distinct roadmap_id from roadmap_steps
			where step_id = %s)`, start)
	}

	// check if end step is passed
	if r.URL.Query().Get("end") != ""  {
		end := r.URL.Query().Get("end")
		endFilter = fmt.Sprintf(`id in (
			select distinct roadmap_id from roadmap_steps
			where step_id in (
					select distinct step_id
					from career_maps
					where career_id = %s)
					)`, end)
	}

	query := `select json_build_object('roadmaps', array_agg(roadmaps)) from
				(select json_build_object(
									'id', rm.id,
									'unique_link', rm.unique_link,
									'creator_id', us.id,
									'creator_name', us.name,
									'start', start,
									'end', rm.end,
									'incomplete', rm.incomplete,
									'draft', rm.draft,
									'step_count', step_count,
									'time_taken', time_taken,
									'start', start_title,
									'end', end_title,
									'stars', stars,
									'username', username,
									'userlink', userlink
							) as roadmaps from
				(	-- add owner, start, end to roadmap for listing
					(
						select * from roadmaps
						%s
					) rm
					inner join
					(
						select id, name from users
					)
					as us
					on rm.creator = us.id
					inner join
					(
						select id, title as "start_title" from
						steps
					)
					as step_start
					on rm."start" = step_start.id
					inner join
					(
						select id, title as "end_title" from
						steps
					)
					as step_end
					on rm."end" = step_end.id
				)
				where rm.private = false
			) maps`


	var subStepQuery string

	if startFilter != "" {
		subStepQuery = fmt.Sprintf("where" + " " + startFilter)
	}

	if endFilter != "" {
		if subStepQuery != "" {
			subStepQuery = fmt.Sprintf(subStepQuery + " and " + endFilter)
		} else {
			subStepQuery = fmt.Sprintf("where" + " " + endFilter)
		}
	}

	// add filters to the query
	finalQuery := fmt.Sprintf(query, subStepQuery)

	var jsonData *json.RawMessage
	err := database.Conn.Raw(finalQuery).Row().Scan(&jsonData)

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		SetSuccessHeader(w)
		jData, _ := json.Marshal(jsonData)
		w.Write(jData)
	}
}


func FetchUserRoadmaps(w http.ResponseWriter, r *http.Request) {
	/*
	Return all roadmaps that are public and completed
	*/

	param := mux.Vars(r)

	tokenUser := r.Context().Value("user")
	userID := tokenUser.(*models.Token).UserID

	// Return personal roadmaps only if user requesting is the owner
	if i, _ := strconv.Atoi(param["id"]); i == int(userID) {
		query := `select json_build_object('roadmaps', array_agg(roadmaps)) from
					(select json_build_object(
										'id', rm.id,
										'unique_link', rm.unique_link,
										'creator_id', us.id,
										'creator_name', us.name,
										'start', start,
										'end', rm.end,
										'incomplete', rm.incomplete,
										'draft', rm.draft,
										'step_count', step_count,
										'time_taken', time_taken,
										'start', start_title,
										'end', end_title,
										'username', username,
										'userlink', userlink
								) as roadmaps from
					(	-- add owner, start, end to roadmap for listing
						(
							select * from roadmaps
						) rm
						inner join
						(
							select id, name from users
							where id = ?
						)
						as us
						on rm.creator = us.id
						inner join
						(
							select id, title as "start_title" from
							steps
						)
						as step_start
						on rm."start" = step_start.id
						inner join
						(
							select id, title as "end_title" from
							steps
						)
						as step_end
						on rm."end" = step_end.id
					)
				) maps`

		var jsonData *json.RawMessage

		database.Conn.Raw(query, param["id"]).Row().Scan(&jsonData)
		SetSuccessHeader(w)
		jData, _ := json.Marshal(jsonData)
		w.Write(jData)
	} else {
		SetErrorHeader(w, `{"message":"not authorized"}`)
	}
}


func CreateRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Create a roadmap
	*/

	var roadmap models.Roadmap

	err := json.NewDecoder(r.Body).Decode(&roadmap)

	*roadmap.Private = true

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Return Success if object exists
	if database.Conn.Create(&roadmap).Error == nil {

		roadmap.UniqueLink = CreateUniqueLink(roadmap.Title)
		database.Conn.Save(&roadmap)

		SetSuccessHeader(w)
		json.NewEncoder(w).Encode(roadmap)
	}
}


func CreatePublicRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Create a public roadmap
	*/

	var roadmap models.Roadmap

	err := json.NewDecoder(r.Body).Decode(&roadmap)

	// Set creator and owner as Really Confused
	roadmap.Owner = 1
	roadmap.Creator = 1
	roadmap.CreatedPublic = true
	*roadmap.Private = true

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Return Success if object exists
	if database.Conn.Create(&roadmap).Error == nil {
		SetSuccessHeader(w)
		json.NewEncoder(w).Encode(roadmap)
	}
}


func UpdateRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Update Roadmap Details
	*/
	var roadmap models.Roadmap

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID
	_ = json.NewDecoder(r.Body).Decode(&roadmap)

	var exists models.Roadmap

	if e := database.Conn.Where("id = ?", roadmap.ID).First(&exists).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if exists.Creator == int(userID) {
			database.Conn.Model(&roadmap).Updates(&roadmap)
			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(&roadmap)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to edit"}`)
		}
	}
}


func DeleteRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Set Roadmap as Private
	*/
	var roadmap models.Roadmap

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID
	_ = json.NewDecoder(r.Body).Decode(&roadmap)

	var exists models.Roadmap

	if e := database.Conn.Where("id = ?", roadmap.ID).First(&exists).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if exists.Creator == int(userID) {
			database.Conn.Model(&roadmap).Delete(&roadmap)
			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(&roadmap)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to delete"}`)
		}
	}
}


func PursueRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Makes an incomplete copy of a roadmap for a user to follow.
	*/

	reqBody, _ := ioutil.ReadAll(r.Body)

	var prm struct {
        Roadmap  	int   `json:"id"`
    }

	json.Unmarshal(reqBody, &prm)
	var roadmap models.Roadmap
	var roadmapPursue models.RoadmapPursue

	// Check if object exists
	if database.Conn.First(&roadmap, prm.Roadmap).Error != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if *roadmap.Incomplete {
			SetErrorHeader(w, `{"message":"can't follow an incomplete roadmap"}`)
		} else {

			// Get current user ID
			user := r.Context().Value("user")
			userID := user.(*models.Token).UserID

			// get owner and roadmap ID here and save it to database
			// for storing pursued information
			roadmapPursue.CreatorUserID = roadmap.Creator
			roadmapPursue.CreatorRoadmapID = int(roadmap.ID)

			// Reset Roadmap Details
			roadmap.Parent = int(roadmap.ID)
			roadmap.ID = 0
			*roadmap.Incomplete = true
			*roadmap.Private = true
			roadmap.Mentored = nil
			roadmap.Creator = int(userID)
			roadmap.Stars = 0
			roadmap.UniqueLink = CreateUniqueLink(roadmap.Title)

			// fetch all roadmap steps and create new instances
			rSteps := []models.RoadmapStep{}
			database.Conn.Where("roadmap_id = ?", prm.Roadmap).Find(&rSteps)

			// make a copy of the roadmap
			if database.Conn.Create(&roadmap).Error == nil && roadmap.ID != 0 {

				var startStep models.RoadmapStep

				// Get the first step of the roadmap
				for _, rStep := range rSteps {
					if rStep.IsStart {
						startStep = rStep
						break
					}
				}

				// get new user ID & roadmap ID here
				roadmapPursue.PursuedUserID = roadmap.Creator
				roadmapPursue.PursuedRoadmapID = int(roadmap.ID)
				database.Conn.Create(&roadmapPursue)

				// calculate elapsed time since step 1
				duration := time.Since(startStep.CompletedDate)

				for _, rStep := range rSteps {

					// fetch and clone corresponding step
					var pStep models.Step
					database.Conn.First(&pStep, rStep.StepID)
					pStep.ID = 0
					pStep.UserID = int(userID)
					database.Conn.Create(&pStep)

					rStep.ID = 0
					rStep.RoadmapID = int(roadmap.ID)

					// assign the newly created step to the roadmapstep
					rStep.StepID = int(pStep.ID)

					// rStep.Description1 = ""
					rStep.UserID = int(userID)
					*rStep.Completed = false

					// add difference to completed date
					rStep.CompletedDate = rStep.CompletedDate.Add(duration)

					// replicate the roadmap step
					database.Conn.Create(&rStep)

				}

				SetSuccessHeader(w)
				json.NewEncoder(w).Encode(roadmap)
			} else {
				SetErrorHeader(w, `{"message":"no is_start on the roadmap"}`)
			}
		}
	}
}


/*


***************** STEP ********************


*/


func FetchAllStep(w http.ResponseWriter, r *http.Request) {
	/*
	Return all roadmaps that are public and completed
	*/
	var stepType string
	step := []models.Step{}

	if r.URL.Query().Get("type") != ""  {
		stepType = r.URL.Query().Get("type")
		database.Conn.Where("step_type_id = ?", stepType).Find(&step)
	} else {
		database.Conn.Find(&step)
	}

	SetSuccessHeader(w)
	json.NewEncoder(w).Encode(step)
}


func FetchStepsWithCount(w http.ResponseWriter, r *http.Request) {
	/*
	Return steps - careers and language with roadmap counts
	*/


	var step_type string
	var query string

	if r.URL.Query().Get("step_type") != ""  {
		step_type = r.URL.Query().Get("step_type")

		if step_type == "1" {
			query = `select json_build_object('steps', array_agg(steps)) from
					(
						select json_build_object(
								'id', career_id,
								'title', name,
								'roadmap_count', sum(count)
								) as steps from
						(select steps.ID, steps.title, count(*) from roadmap_steps rs
						inner join roadmaps rm
						on rs.roadmap_id = rm.id
						inner join steps
						on rs.step_id = steps.id
						where step_type_id = ?
						and rm.private = false
						and rs.is_end = true
						group by steps.ID, steps.title) steps
						inner join career_maps
						on career_maps.step_id = steps.id
						inner join careers
						on careers.id = career_maps.career_id
						group by career_id, name
					) s
					`
		} else {
			query = `select json_build_object('steps', array_agg(steps)) from
					(
						select json_build_object(
								'id', s.ID,
								'title', s.title,
								'roadmap_count', count(*)
								) as steps from
						roadmap_steps rs
						inner join roadmaps rm
						on rs.roadmap_id = rm.id
						inner join steps s
						on rs.step_id = s.id
						where step_type_id = ?
						and rm.private = false
						group by s.ID, s.title
					) s
					`
		}

		var jsonData *json.RawMessage
		err := database.Conn.Raw(query, step_type).Row().Scan(&jsonData)

		if err != nil {
			SetErrorHeader(w, `{"message":"data not found"}`)
		} else {
			SetSuccessHeader(w)
			jData, _ := json.Marshal(jsonData)
			w.Write(jData)
		}
	} else {
		SetErrorHeader(w, `{"message":"no filters passed."}`)
	}
}


func FetchMentorRoadmaps(w http.ResponseWriter, r *http.Request) {
	/*
	Return steps - careers and language with roadmap counts
	*/


	var query string

	query = `
			select json_build_object('steps', array_agg(steps)) from
				(
					select json_build_object(
							'id', id,
							'unique_link', unique_link,
							'title', title,
							'roadmap_count', 1
							) as steps from roadmaps
					where mentored = true
				) s
			`

	var jsonData *json.RawMessage
	err := database.Conn.Raw(query).Row().Scan(&jsonData)

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		SetSuccessHeader(w)
		jData, _ := json.Marshal(jsonData)
		w.Write(jData)
	}
}


func CreateStep(w http.ResponseWriter, r *http.Request) {
	/*
	Create a Step for Roadmap
	*/

	var step models.Step

	err := json.NewDecoder(r.Body).Decode(&step)

	if err != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	}

	// Check if object exists
	if database.Conn.First(&models.StepType{}, step.StepTypeID).Error != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		// Return Success if object exists
		if database.Conn.Create(&step).Error == nil {
			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(step)
		}
	}
}


func UpdateStep(w http.ResponseWriter, r *http.Request) {
	/*
	Update a Step
	*/
	var step models.Step

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID
	_ = json.NewDecoder(r.Body).Decode(&step)

	var exists models.Step

	if e := database.Conn.Where("id = ?", step.ID).First(&exists).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		if exists.UserID == int(userID) {
			database.Conn.Model(&step).Updates(&step)
			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(&step)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to edit"}`)
		}
	}
}


func SearchStep(w http.ResponseWriter, r *http.Request) {
	/*
	Create a Step for Roadmap
	*/

	search := struct {
		Title 	string    `json:"title"`
	}{}

	decoder := json.NewDecoder(r.Body)

	err := decoder.Decode(&search)
    if err != nil {
        panic(err)
    }

	// Only search if more than two characters are present
	if (len(search.Title) > 2) {
		steps := []models.Step{}
		title := fmt.Sprintf("%%%s%%", search.Title)
		database.Conn.Limit(10).Where("title ILIKE ?", title).Find(&steps)
		json.NewEncoder(w).Encode(steps)
		SetSuccessHeader(w)
	} else {
		w.Write([]byte(`{"message":"need three characters"}`))
	}
}


/*


***************** ROADMAP STEP ********************


*/


func SetCohortRoadmap(roadmap models.Roadmap, crmap models.CohortRoadmapMap) {
	/*
	update to cohort_roadmap_map.
	current
	latest_entry
	filter by roadmap_id and get the roadmap-step using the second last step based on position (use SQL)

	get the count to update the cohort_roadmap_map progress
	*/
	var count int
	row := database.Conn.Raw("select count(*) from roadmap_steps where roadmap_id = ?", roadmap.ID).Row()
	row.Scan(&count)

	if count != crmap.Current {
		crmap.Current = count
	}

	// get the roadmapstep ID of the latest_entry
	var latestEntry int
	row = database.Conn.Raw(`select id from roadmap_steps where roadmap_id = ?
							 order by position desc
							 limit 1 offset 1`, roadmap.ID).Row()
	row.Scan(&latestEntry)

	if latestEntry != crmap.LatestEntry {
		crmap.LatestEntry = latestEntry
	}

	database.Conn.Model(&crmap).Updates(&crmap)
}


func CreateRoadmapStep(w http.ResponseWriter, r *http.Request) {
	/*
	Create an roadmap step
	*/
	var roadmapStep models.RoadmapStep

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID
	_ = json.NewDecoder(r.Body).Decode(&roadmapStep)

	if e := database.Conn.Where("id = ?", roadmapStep.RoadmapID).First(&models.Roadmap{}).Error; e != nil {
		SetErrorHeader(w, `{"message":"roadmap not found"}`)
	} else {
		var creator uint
		// get the creator of the roadmap
		row := database.Conn.Raw("select creator from roadmaps where id = ?", roadmapStep.RoadmapID).Row()
		row.Scan(&creator)

		if creator == userID {

			// Return Success if object exists
			if database.Conn.Create(&roadmapStep).Error == nil {

				// fetch the roadmap & set cohort details
				var roadmap models.Roadmap
				database.Conn.Where("id = ?", roadmapStep.RoadmapID).First(&roadmap)

				if roadmap.IsCohort != nil && *roadmap.IsCohort == true {
					// check if cohort exists
					var crmap models.CohortRoadmapMap
					err := database.Conn.Where("roadmap_id = ?", roadmapStep.RoadmapID).First(&crmap).Error

					if err != gorm.ErrRecordNotFound {
						SetCohortRoadmap(roadmap, crmap)
					} else {
						SetErrorHeader(w, `{"message":"cohort not created"}`)
					}
				}

				SetSuccessHeader(w)
				json.NewEncoder(w).Encode(roadmapStep)
			}

		} else {
			SetErrorHeader(w, `{"message":"not authorized to add"}`)
		}
	}
}


func UpdateRoadmapStep(w http.ResponseWriter, r *http.Request) {
	/*
	Update a Step in Roadmap
	*/
	var roadmapStep models.RoadmapStep

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID
	_ = json.NewDecoder(r.Body).Decode(&roadmapStep)

	if e := database.Conn.Where("id = ?", roadmapStep.ID).First(&models.RoadmapStep{}).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		var creator uint
		// get the creator of the roadmap
		row := database.Conn.Raw("select creator from roadmaps where id = (select roadmap_id from roadmap_steps where id = ?)", roadmapStep.ID).Row()
		row.Scan(&creator)

		if creator == userID {
			database.Conn.Model(&roadmapStep).Updates(&roadmapStep)

			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(&roadmapStep)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to edit"}`)
		}
	}
}


func DeleteRoadmapStep(w http.ResponseWriter, r *http.Request) {
	/*
	Delete a Step in Roadmap
	*/

	var roadmapStep models.RoadmapStep

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID
	_ = json.NewDecoder(r.Body).Decode(&roadmapStep)

	if e := database.Conn.Where("id = ?", roadmapStep.ID).First(&models.RoadmapStep{}).Error; e != nil {
		SetErrorHeader(w, `{"message":"data not found"}`)
	} else {
		var creator uint
		// get the creator of the roadmap
		row := database.Conn.Raw("select creator from roadmaps where id = (select roadmap_id from roadmap_steps where id = ?)", roadmapStep.ID).Row()
		row.Scan(&creator)

		// delete if creator is same as the user
		if creator == userID {
			database.Conn.Unscoped().Model(&roadmapStep).Delete(&roadmapStep)
			SetSuccessHeader(w)
			json.NewEncoder(w).Encode(&roadmapStep)
		} else {
			SetErrorHeader(w, `{"message":"not authorized to delete"}`)
		}
	}
}


/*


***************** STEP TYPE ********************


*/


func CreateStepType(w http.ResponseWriter, r *http.Request) {
	/*
	Create a roadmap
	*/
    reqBody, _ := ioutil.ReadAll(r.Body)
    var stepType models.StepType
	json.Unmarshal(reqBody, &stepType)

    database.Conn.Create(&stepType)
    json.NewEncoder(w).Encode(stepType)
}


func FetchAllStepTypes(w http.ResponseWriter, r *http.Request) {
	/*
	Return all roadmaps that are public and completed
	*/
	stepTypes := []models.StepType{}
	database.Conn.Find(&stepTypes)
	json.NewEncoder(w).Encode(stepTypes)
}



func SearchStepType(w http.ResponseWriter, r *http.Request){
	/*
	Return all roadmaps that are public and completed
	*/

	search := struct {
		Name 	string    `json:"name"`
	}{}

	decoder := json.NewDecoder(r.Body)

	err := decoder.Decode(&search)
    if err != nil {
        panic(err)
    }

	// Only search if more than two characters are present
	if (len(search.Name) > 2) {
		stepTypes := []models.StepType{}
		name := fmt.Sprintf("%%%s%%", search.Name)
		database.Conn.Where("name ILIKE ?", name).Find(&stepTypes)
		json.NewEncoder(w).Encode(stepTypes)
	} else {
		w.Write([]byte(`{"message":"need three characters"}`))
	}
}


/*


***************** ROADMAP TAG ********************


*/


func CreateRoadmapTag(w http.ResponseWriter, r *http.Request){
	/*
	Create a roadmaptags
	*/
    reqBody, _ := ioutil.ReadAll(r.Body)
    var tag models.RoadmapTag
	json.Unmarshal(reqBody, &tag)

    database.Conn.Create(&tag)
    json.NewEncoder(w).Encode(tag)
}


func FetchAllRoadmapTag(w http.ResponseWriter, r *http.Request){
	/*
	Return all roadmaps tags
	*/
	tag := []models.RoadmapTag{}
	database.Conn.Find(&tag)
	json.NewEncoder(w).Encode(tag)
}


/*


***************** Starring ********************


*/


func StarRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Star a roadmap
	*/

	reqBody, _ := ioutil.ReadAll(r.Body)
    var star models.Star
	json.Unmarshal(reqBody, &star)

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID

	if star.UserID == int(userID) {
		estar := &models.Star{}
		database.Conn.Where("roadmap_id = ?", star.RoadmapID).Where("user_id = ?", star.UserID).First(&estar)

		if estar.ID == 0 {
			database.Conn.Create(&star)

			roadmap := &models.Roadmap{}
			database.Conn.Where("id = ?", star.RoadmapID).First(&roadmap)

			// increment stars
			roadmap.Stars = roadmap.Stars + 1
			database.Conn.Save(&roadmap)

			SetSuccessHeader(w)
		} else {
			SetErrorHeader(w, `{"message":"roadmap already starred"}`)
		}
	} else {
		SetErrorHeader(w, `{"message":"not authorized to star"}`)
	}
}


func IsStarred(w http.ResponseWriter, r *http.Request) {
	/*
	Check if a roadmap is starred
	*/
	reqBody, _ := ioutil.ReadAll(r.Body)
    var star models.Star
	json.Unmarshal(reqBody, &star)

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID

	if star.UserID == int(userID) {
		estar := &models.Star{}
		database.Conn.Where("roadmap_id = ?", star.RoadmapID).Where("user_id = ?", star.UserID).First(&estar)

		result := struct {
			Bool  	bool    `json:"result"`
			Stars  	int     `json:"stars"`
		}{}

		database.Conn.Raw("select count(*) as stars from stars where roadmap_id = ?", int(star.RoadmapID)).Row().Scan(&result.Stars)

		if estar.ID == 0 {
			result.Bool = false
			json.NewEncoder(w).Encode(result)
			SetSuccessHeader(w)
		} else {
			result.Bool = true
			json.NewEncoder(w).Encode(result)
			SetSuccessHeader(w)
		}
	} else {
		SetErrorHeader(w, `{"message":"not authorized to view"}`)
	}
}


func UnStarRoadmap(w http.ResponseWriter, r *http.Request) {
	/*
	Un-star a roadmap
	*/

	reqBody, _ := ioutil.ReadAll(r.Body)
    var star models.Star
	json.Unmarshal(reqBody, &star)

	user := r.Context().Value("user")
	userID := user.(*models.Token).UserID

	if star.UserID == int(userID) {
		estar := &models.Star{}
		database.Conn.Where("roadmap_id = ?", star.RoadmapID).Where("user_id = ?", star.UserID).First(&estar)
		database.Conn.Unscoped().Delete(&estar)

		roadmap := &models.Roadmap{}
		database.Conn.Where("id = ?", star.RoadmapID).First(&roadmap)

		// decrement stars
		if roadmap.Stars >= 1 {
			roadmap.Stars = roadmap.Stars - 1
			database.Conn.Save(&roadmap)
		}
	} else {
		SetErrorHeader(w, `{"message":"not authorized to unstar"}`)
	}
}


/*


***************** Career Umbrella ********************


*/


func CreateCareer(w http.ResponseWriter, r *http.Request) {
	/*
	Create a career
	*/
    reqBody, _ := ioutil.ReadAll(r.Body)
    var career models.Career
	json.Unmarshal(reqBody, &career)

    database.Conn.Create(&career)
    json.NewEncoder(w).Encode(career)
}


func CreateCareerMap(w http.ResponseWriter, r *http.Request) {
	/*
	Create a career map
	*/
    reqBody, _ := ioutil.ReadAll(r.Body)
    var careerMap models.CareerMap
	json.Unmarshal(reqBody, &careerMap)

    database.Conn.Create(&careerMap)
    json.NewEncoder(w).Encode(careerMap)
}
