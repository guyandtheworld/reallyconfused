package logger

import (
	"net/http"
	"time"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"

	"github.com/guyandtheworld/reallyconfused-apis/app/models"
	"github.com/guyandtheworld/reallyconfused-apis/app/database"
)

type Logger struct{}


func (*Logger) ServeHTTP(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
	// Middleware to log the requests coming into the backend.
	// To-Do - Write queries to write the response into the backend

	// url
	var request models.Request

	request.URL = r.URL.String()

	if strings.Contains(request.URL, "?") {
		s := strings.Split(request.URL, "?")
		baseURL, urlParamters := s[0], s[1]
		request.BaseURL = baseURL
		request.URLParamters = urlParamters
	}

	request.Method = r.Method
	request.Referer = r.Referer()
	request.UserAgent = r.UserAgent()

	var header = r.Header.Get("x-access-token") //Grab the token from the header
	header = strings.TrimSpace(header)
	tk := &models.Token{}
	jwt.ParseWithClaims(header, tk, func(token *jwt.Token) (interface{}, error) {
		return []byte(database.Secret), nil
	})

	userID := tk.UserID

	request.UserID = int(userID)

	next.ServeHTTP(w, r)

	t := time.Now()

	// Prints the latency
	request.Latency = float32(time.Now().Sub(t))
	database.Conn.Create(&request)
}
