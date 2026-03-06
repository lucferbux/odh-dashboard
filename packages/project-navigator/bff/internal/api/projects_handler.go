package api

import (
	"fmt"
	"net/http"

	"github.com/opendatahub-io/mod-arch-library/bff/internal/constants"
	"github.com/opendatahub-io/mod-arch-library/bff/internal/integrations/kubernetes"
	"github.com/opendatahub-io/mod-arch-library/bff/internal/models"

	"github.com/julienschmidt/httprouter"
)

type ProjectsEnvelope Envelope[models.ProjectList, None]

func (app *App) GetProjectsHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	ctx := r.Context()
	identity, ok := ctx.Value(constants.RequestIdentityKey).(*kubernetes.RequestIdentity)
	if !ok || identity == nil {
		app.badRequestResponse(w, r, fmt.Errorf("missing RequestIdentity in context"))
		return
	}

	client, err := app.kubernetesClientFactory.GetClient(ctx)
	if err != nil {
		app.serverErrorResponse(w, r, fmt.Errorf("failed to get Kubernetes client: %w", err))
		return
	}

	projects, err := app.repositories.Project.GetProjects(client, ctx, identity)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	projectsEnvelope := ProjectsEnvelope{
		Data: projects,
	}

	err = app.WriteJSON(w, http.StatusOK, projectsEnvelope, nil)

	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
