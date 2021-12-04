// main.go
package main

import (
    "log"
    "net/http"

    "github.com/guyandtheworld/reallyconfused-apis/app"
)


func main() {
    router, err := app.SetupRouter()
    if err != nil {
        log.Fatal("Couldn't setup Router")
    }

    log.Fatal(http.ListenAndServe(":8080", router))
}