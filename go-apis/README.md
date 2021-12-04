# reallyconfused-apis


## Development

### Setup Database

* `make start-postgres`


### Create User

`docker exec -it postgres12 createdb --username=root --owner=root golang`
`docker exec -it postgres12 psql -U root golang`

### Prod

## Connecting to local db

### Locally

Make .keys folder `mkdir .keys` inside `go-apis`

Then run `touch .env` inside the .keys folder. Populate it with

```
databaseName=postgres
databasePassword=secret
databaseUser=root
databaseType=postgres
databaseHost=localhost
databasePort=5432
secretKey=secret
supportEmail=example@gmail.com
supportPassword=password
```

Build Container
`docker build -t rcapis .`

Connect to local database
`docker run --env-file .keys/.env --net=host -p 8080:8080 rcapis:latest`

Connect to prod db
`docker run --env-file .keys/.prodenv -p 8080:8080 rcapis:latest`

### Push to Production

`gcloud builds submit --tag gcr.io/alrt-ai/confused-apis`

`gcloud run deploy --image gcr.io/alrt-ai/confused-apis --platform managed confused-apis`


## Resources
* https://auth0.com/blog/authentication-in-golang/#Authorization-with-Golang
* https://dev.to/omnisyle/simple-jwt-authentication-for-golang-part-1-3kfo
* https://dev.to/johanlejdung/a-mini-guide-build-a-rest-api-as-a-go-microservice-together-with-mysql-27m2
* https://dev.to/techschoolguru/how-to-write-run-database-migration-in-golang-5h6g
* https://medium.com/storyteltech/a-mini-guide-middleware-and-how-it-works-in-go-f6076a39d8f1
* https://medium.com/@baijum/api-end-points-with-authentication-using-negroni-gorilla-mux-and-jwt-middleware-63a6dd8275cf
* [Authentication](https://blog.usejournal.com/authentication-in-golang-c0677bcce1a8)
