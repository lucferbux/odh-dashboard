package models

import "time"

type ProjectStatus string

const (
	ProjectStatusActive      ProjectStatus = "Active"
	ProjectStatusTerminating ProjectStatus = "Terminating"
)

type Project struct {
	Name        string            `json:"name"`
	DisplayName string            `json:"displayName,omitempty"`
	Description string            `json:"description,omitempty"`
	Owner       string            `json:"owner,omitempty"`
	Status      ProjectStatus     `json:"status"`
	CreatedAt   time.Time         `json:"createdAt"`
	Labels      map[string]string `json:"labels,omitempty"`
	Annotations map[string]string `json:"annotations,omitempty"`
}

type ProjectList struct {
	Items         []Project `json:"items"`
	NextPageToken string    `json:"nextPageToken,omitempty"`
	TotalSize     int       `json:"totalSize,omitempty"`
}
