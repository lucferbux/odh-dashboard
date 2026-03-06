package mocks

import (
	"time"

	"github.com/opendatahub-io/mod-arch-library/bff/internal/models"
)

func GetMockProjects() models.ProjectList {
	return models.ProjectList{
		Items: []models.Project{
			{
				Name:        "data-science-project",
				DisplayName: "Data Science Project",
				Description: "ML experiments and model training",
				Owner:       "alice@example.com",
				Status:      models.ProjectStatusActive,
				CreatedAt:   time.Now().Add(-30 * 24 * time.Hour),
			},
			{
				Name:        "fraud-detection",
				DisplayName: "Fraud Detection",
				Description: "Real-time fraud detection pipeline",
				Owner:       "bob@example.com",
				Status:      models.ProjectStatusActive,
				CreatedAt:   time.Now().Add(-15 * 24 * time.Hour),
			},
			{
				Name:        "llm-fine-tuning",
				DisplayName: "LLM Fine-Tuning",
				Description: "Fine-tuning foundation models",
				Owner:       "charlie@example.com",
				Status:      models.ProjectStatusActive,
				CreatedAt:   time.Now().Add(-7 * 24 * time.Hour),
			},
			{
				Name:        "deprecated-project",
				DisplayName: "Old Project",
				Description: "Being cleaned up",
				Owner:       "admin@example.com",
				Status:      models.ProjectStatusTerminating,
				CreatedAt:   time.Now().Add(-90 * 24 * time.Hour),
			},
		},
		TotalSize: 4,
	}
}
