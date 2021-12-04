package app

import (
    "os"
    "net/http"

    "github.com/rs/cors"
	"github.com/urfave/negroni"
    "github.com/gorilla/mux"
	"github.com/markbates/goth"
	"github.com/markbates/goth/providers/google"
	"github.com/markbates/goth/providers/github"

    "github.com/guyandtheworld/reallyconfused-apis/app/auth"
    "github.com/guyandtheworld/reallyconfused-apis/app/database"
    "github.com/guyandtheworld/reallyconfused-apis/app/logger"
    "github.com/guyandtheworld/reallyconfused-apis/app/controllers"
)



func SetupRouter() (http.Handler, error) {
    
    // Initialize DB connection
    database.ConnectDB()

	r := mux.NewRouter().StrictSlash(true)

	r.HandleFunc("/register", controllers.CreateUser).Methods("POST")
	r.HandleFunc("/oauth-register", controllers.RegisterOauthUser).Methods("POST")
	r.HandleFunc("/login", controllers.Login).Methods("POST")
	r.HandleFunc("/reset_password", controllers.ResetPassword).Methods("POST")
	r.HandleFunc("/reset_password_from_email", controllers.ResetPasswordFromEmail).Methods("POST")
	r.HandleFunc("/public/roadmap", controllers.CreatePublicRoadmap).Methods("POST")
	r.HandleFunc("/gumroad-ping", controllers.GumroadPing).Methods("POST")

    // Oauth urls
	r.HandleFunc("/auth/{provider}", controllers.OauthLogin)
	r.HandleFunc("/auth/{provider}/callback", controllers.OauthCallback)

    // Public Views
    r.HandleFunc("/roadmap/stepwithcount", controllers.FetchStepsWithCount).Methods("GET")
    r.HandleFunc("/roadmap/mentorroadmaps", controllers.FetchMentorRoadmaps).Methods("GET")
    r.HandleFunc("/roadmap/all", controllers.FetchAllRoadmaps).Methods("GET")
    r.HandleFunc("/roadmap/step", controllers.FetchAllStep).Methods("GET")
    r.HandleFunc("/journeys/{id}", controllers.LearningJourneys).Methods("GET")
    r.HandleFunc("/roadmap/get/{id}", controllers.FetchRoadmap).Methods("GET")
    r.HandleFunc("/user/schedulecall", controllers.ScheduleCall).Methods("POST")


    // Auth route
	s := r.PathPrefix("/roadmap").Subrouter()
    s.Use(auth.JwtVerify)

    // roadmap
    s.HandleFunc("/user/{id}", controllers.FetchUserRoadmaps).Methods("GET")
    s.HandleFunc("/create", controllers.CreateRoadmap).Methods("POST")
    s.HandleFunc("/star", controllers.StarRoadmap).Methods("POST")
    s.HandleFunc("/isstarred", controllers.IsStarred).Methods("POST")
    s.HandleFunc("/unstar", controllers.UnStarRoadmap).Methods("POST")
    s.HandleFunc("/update", controllers.UpdateRoadmap).Methods("PUT")
    s.HandleFunc("/delete", controllers.DeleteRoadmap).Methods("DELETE")
    s.HandleFunc("/pursue", controllers.PursueRoadmap).Methods("POST")

    // career map
    s.HandleFunc("/career", controllers.CreateCareer).Methods("POST")
    s.HandleFunc("/careermap", controllers.CreateCareerMap).Methods("POST")

    // reminder
    s.HandleFunc("/listreminder", controllers.ListReminder).Methods("POST")
    s.HandleFunc("/reminder", controllers.CreateReminder).Methods("POST")
    s.HandleFunc("/reminder/{id}", controllers.DeleteReminder).Methods("DELETE")

    // roadmap step
    s.HandleFunc("/roadmapstep", controllers.CreateRoadmapStep).Methods("POST")
    s.HandleFunc("/roadmapstep", controllers.UpdateRoadmapStep).Methods("PUT")
    s.HandleFunc("/roadmapstep", controllers.DeleteRoadmapStep).Methods("DELETE")

    // just make it unlisted
    // s.HandleFunc("/delete", controllers.CreateRoadmap).Methods("GET")

    // step
    s.HandleFunc("/step", controllers.CreateStep).Methods("POST")
    s.HandleFunc("/step", controllers.UpdateStep).Methods("PUT")
    s.HandleFunc("/searchstep", controllers.SearchStep).Methods("POST")

    // step type
    s.HandleFunc("/steptype", controllers.FetchAllStepTypes).Methods("GET")
    s.HandleFunc("/steptype", controllers.CreateStepType).Methods("POST")
    s.HandleFunc("/searchsteptype", controllers.SearchStepType).Methods("POST")

    // roadmap tag
    s.HandleFunc("/tag", controllers.FetchAllRoadmapTag).Methods("GET")
    s.HandleFunc("/tag", controllers.CreateRoadmapTag).Methods("POST")

    // Auth route
	a := r.PathPrefix("/user").Subrouter()
    a.Use(auth.JwtVerify)

    // roadmap
    a.HandleFunc("/profile", controllers.UserProfile).Methods("GET")
    a.HandleFunc("/password_reset", controllers.NewPassword).Methods("POST")
    a.HandleFunc("/feedback", controllers.Feedback).Methods("POST")
    a.HandleFunc("/upgradepremium", controllers.UpgradeToPremium).Methods("POST")
    a.HandleFunc("/get", controllers.GetUserProfileDetails).Methods("GET")
    a.HandleFunc("/update", controllers.UpdateUserProfileDetails).Methods("PUT")

    // Auth route
	b := r.PathPrefix("/organization").Subrouter()
    b.Use(auth.JwtVerify)

    // organization
    b.HandleFunc("/all", controllers.FetchOrganizations).Methods("GET")
    b.HandleFunc("/create", controllers.CreateOrganization).Methods("POST")

    // Auth route
	d := r.PathPrefix("/cohort").Subrouter()
    d.Use(auth.JwtVerify)

    // cohort
    d.HandleFunc("/org/{id}", controllers.FetchCohorts).Methods("GET")
    d.HandleFunc("/create", controllers.CreateCohort).Methods("POST")
    d.HandleFunc("/roadmap", controllers.CreateCohortRoadmap).Methods("POST")
    d.HandleFunc("/details/{id}", controllers.GetOrganizationDetails).Methods("GET")

    // Auth route
	m := r.PathPrefix("/metrics").Subrouter()

    // organization
    m.HandleFunc("/createclick", controllers.CreateClick).Methods("POST")


    // Middleware for authentication
    n := negroni.New()

    // Settings for CORS
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"*"},
        AllowCredentials: true,
        AllowedHeaders: []string{"Authorization", "Content-Type", "Access-Control-Allow-Origin", "x-access-token"},
        AllowedMethods: []string{"GET", "UPDATE", "PUT", "POST", "DELETE"},
        // Enable Debugging for testing, consider disabling in production
        // Debug:          true,
    })

    // Middleware for logging
    n.Use(&logger.Logger{})
    n.Use(c)
	n.UseHandler(r)

	goth.UseProviders(
        google.New(os.Getenv("GOOGLE_KEY"), os.Getenv("GOOGLE_SECRET"), "https://api.reallyconfused.co/auth/google/callback"),
        github.New(os.Getenv("GITHUB_KEY"), os.Getenv("GITHUB_SECRET"), "https://api.reallyconfused.co/auth/github/callback"),
	)

    return n, nil
}
