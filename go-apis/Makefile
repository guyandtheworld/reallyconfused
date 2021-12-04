postgres:
	docker run --name postgres12 -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:12-alpine

start-postgres:
	docker start postgres12

createdb:
	docker exec -it postgres12 createdb --username=root --owner=root golang

dropdb:
	docker exec -it postgres12 dropdb golang

migrateup:
	migrate -path app/database/migration -database "postgresql://root:secret@localhost:5432/golang?sslmode=disable" -verbose up

migratedown:
	migrate -path app/database/migration -database "postgresql://root:secret@localhost:5432/golang?sslmode=disable" -verbose down

.PHONY: postgres createdb dropdb migrateup migratedown sqlc test
