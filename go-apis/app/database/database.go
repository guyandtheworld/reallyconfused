package database

import (
	"log"
	"fmt"
	"os"

	 _ "github.com/lib/pq"
	 _ "github.com/golang-migrate/migrate/source/file"
	 _ "github.com/jinzhu/gorm/dialects/postgres"

	"github.com/jinzhu/gorm"
	"github.com/joho/godotenv"
	"github.com/guyandtheworld/reallyconfused-apis/app/models"
	)


var (
	// Conn is the connection handle
	// for the database
	Conn *gorm.DB
	Secret string
	SupportEmail string
	SupportPassword string
)


//ConnectDB function: Make database connection
func ConnectDB() {

	var val = ""
	var present = false
	var err error;
	var databaseString = ""

	val, present = os.LookupEnv("prod")
	if present == false && val != "true" {
		//Load environmenatal variables for local testing
		err = godotenv.Load(".keys/.env")
		databaseString = "host=%s user=%s dbname=%s sslmode=disable password=%s port=%s"
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	} else {
		databaseString = "host=%s user=%s dbname=%s sslmode=require password=%s port=%s"
	}

	username := os.Getenv("databaseUser")
	password := os.Getenv("databasePassword")
	databaseName := os.Getenv("databaseName")
	databaseHost := os.Getenv("databaseHost")
	databasePort := os.Getenv("databasePort")

	// Secret for JWT Token
	Secret = os.Getenv("secretKey")

	// Sending Emails
	SupportEmail = os.Getenv("supportEmail")
	SupportPassword = os.Getenv("supportPassword")

	//Define DB connection string
	dbURI := fmt.Sprintf(databaseString, databaseHost, username, databaseName, password, databasePort)

	//connect to db URI
	Conn, err = gorm.Open("postgres", dbURI)

	if err != nil {
		fmt.Println("error", err)
		panic(err)
	}

	// close db when not in use
	// defer db.Close()

	// Migrate the schema
	Conn.AutoMigrate(
		&models.Organization{},
		&models.Cohort{},
		&models.User{},
		&models.Feedback{},
		&models.Token{},
		&models.PasswordResetToken{},
		&models.StepType{},
		&models.RoadmapTag{},
		&models.Step{},
		&models.RoadmapStep{},
		&models.TagList{},
		&models.Roadmap{},
		&models.Star{},
		&models.Career{},
		&models.CareerMap{},
		&models.ReminderTime{},
		&models.CohortRoadmapMap{},
		&models.Click{},
		&models.RoadmapPursue{},
		&models.Request{},
		&models.ScheduleCall{},
		&models.Premium{},
	)

	Conn.Model(&models.RoadmapStep{}).AddForeignKey("roadmap_id", "roadmaps(id)", "CASCADE", "CASCADE")
	Conn.Model(&models.Roadmap{}).AddIndex("index_roadmap_id_name", "id", "id")

	Conn.Model(&models.TagList{}).AddForeignKey("roadmap_id", "roadmaps(id)", "CASCADE", "CASCADE")
	Conn.Model(&models.Roadmap{}).AddIndex("index_roadmap_id_name", "id", "id")

	fmt.Println("Successfully connected!", Conn)
}
