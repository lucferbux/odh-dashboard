package repositories

import (
	"context"
	"fmt"

	corev1 "k8s.io/api/core/v1"

	k8s "github.com/opendatahub-io/mod-arch-library/bff/internal/integrations/kubernetes"
	"github.com/opendatahub-io/mod-arch-library/bff/internal/models"
)

const (
	annotationDisplayName = "openshift.io/display-name"
	annotationDescription = "openshift.io/description"
	annotationRequester   = "openshift.io/requester"
)

type ProjectRepository struct{}

func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{}
}

func (r *ProjectRepository) GetProjects(client k8s.KubernetesClientInterface, ctx context.Context, identity *k8s.RequestIdentity) (models.ProjectList, error) {
	// Fetch namespaces from the cluster (OpenShift Projects are Namespaces with annotations)
	namespaces, err := client.GetNamespaces(ctx, identity)
	if err != nil {
		return models.ProjectList{}, fmt.Errorf("error fetching projects: %w", err)
	}

	// Convert namespaces to projects
	projects := make([]models.Project, 0, len(namespaces))
	for _, ns := range namespaces {
		projects = append(projects, namespaceToProject(ns))
	}

	return models.ProjectList{
		Items:     projects,
		TotalSize: len(projects),
	}, nil
}

func namespaceToProject(ns corev1.Namespace) models.Project {
	status := models.ProjectStatusActive
	if ns.Status.Phase == corev1.NamespaceTerminating {
		status = models.ProjectStatusTerminating
	}

	return models.Project{
		Name:        ns.Name,
		DisplayName: getAnnotation(ns.Annotations, annotationDisplayName),
		Description: getAnnotation(ns.Annotations, annotationDescription),
		Owner:       getAnnotation(ns.Annotations, annotationRequester),
		Status:      status,
		CreatedAt:   ns.CreationTimestamp.Time,
		Labels:      ns.Labels,
		Annotations: ns.Annotations,
	}
}

func getAnnotation(annotations map[string]string, key string) string {
	if annotations == nil {
		return ""
	}
	return annotations[key]
}
