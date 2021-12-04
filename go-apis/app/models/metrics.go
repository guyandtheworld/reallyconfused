package models

import (
    "github.com/jinzhu/gorm"
)


/* Stores the payment and click  related information */
type Click struct {
    gorm.Model
    Type            string      `json:"type"`
    From            string      `json:"from"`
    Current         string      `json:"current"`
    RoadmapID       int         `json:"roadmap"`
    UserID          int         `json:"user"`
}


type Request struct {
	gorm.Model
    URL              string          `json:"url"`
    BaseURL          string          `json:"base_url"`
    URLParamters     string          `json:"url_parameters"`
    Method           string          `json:"method"`
    Referer          string          `json:"referer"`
    UserAgent        string          `json:"user_agent"`
    UserID           int             `json:"user"`
    Latency          float32         `json:"latency"`
}
