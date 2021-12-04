FROM golang:1.14
WORKDIR /build
COPY . /build
RUN go mod download && CGO_ENABLED=0 GOOS=linux go build -x -installsuffix cgo -o rc-apis .

FROM alpine:latest
WORKDIR /app
COPY --from=0 /build/rc-apis .
EXPOSE 8080
ENTRYPOINT ["./rc-apis"]
