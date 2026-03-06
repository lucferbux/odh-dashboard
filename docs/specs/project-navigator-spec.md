# Project Navigator - Implementation Spec

## Overview

| Field | Value |
|-------|-------|
| **Module Name** | `project-navigator` |
| **Package Location** | `packages/project-navigator` |
| **Description** | List OpenShift projects (namespaces) accessible to the current user |
| **Scope** | Read-only: List projects in a table with filtering, sorting, and pagination |

This spec follows the **mandatory development flow** from [mod-arch-starter AGENTS.md](https://github.com/opendatahub-io/mod-arch-library/blob/main/mod-arch-starter/AGENTS.md).

---

## Development Flow

**CRITICAL: Follow this exact sequence. PRs that skip stages will be rejected.**

| Stage | Description | Status |
|-------|-------------|--------|
| 1. Contract First | Update OpenAPI spec with Project schema | Pending |
| 2. BFF Stub Second | Add mock handler returning realistic project data | Pending |
| 3. Frontend Third | Build ProjectsTable UI consuming the endpoint | Pending |
| 4. Production BFF Last | Replace mocks with K8s ProjectRequest logic | Pending |

---

## Stage 1: API Contract

### File Location
`api/openapi/project-navigator.yaml`

### Endpoint to Add

Update the existing `/api/v1/namespaces` endpoint OR add a new `/api/v1/projects` endpoint:

```yaml
/api/v1/projects:
  summary: List OpenShift projects accessible to the current user
  get:
    tags:
      - K8SOperation
    operationId: listProjects
    summary: List Projects
    description: Returns all OpenShift projects the authenticated user can access.
    parameters:
      - $ref: "#/components/parameters/pageSize"
      - $ref: "#/components/parameters/nextPageToken"
      - $ref: "#/components/parameters/orderBy"
      - $ref: "#/components/parameters/sortOrder"
    responses:
      "200":
        description: List of projects
        content:
          application/json:
            schema:
              $ref: "#/components/responses/ProjectListResponse"
      "401":
        $ref: "#/components/responses/Unauthorized"
      "500":
        $ref: "#/components/responses/InternalServerError"
```

### Schema to Add

```yaml
components:
  schemas:
    ProjectStatus:
      type: string
      enum:
        - Active
        - Terminating
      example: Active

    Project:
      type: object
      required:
        - name
        - status
        - createdAt
      properties:
        name:
          type: string
          description: K8s resource name (metadata.name)
          example: my-project
        displayName:
          type: string
          description: Human-readable name (openshift.io/display-name annotation)
          example: My Project
        description:
          type: string
          description: Project description (openshift.io/description annotation)
          example: A sample data science project
        status:
          $ref: "#/components/schemas/ProjectStatus"
        createdAt:
          type: string
          format: date-time
          description: Creation timestamp
          example: "2024-01-15T10:30:00Z"
        labels:
          type: object
          additionalProperties:
            type: string
          description: K8s labels
        annotations:
          type: object
          additionalProperties:
            type: string
          description: K8s annotations

    ProjectList:
      type: object
      required:
        - items
      properties:
        items:
          type: array
          items:
            $ref: "#/components/schemas/Project"
        nextPageToken:
          type: string
          description: Token for pagination
        totalSize:
          type: integer
          description: Total number of projects

  responses:
    ProjectListResponse:
      description: List of projects
      content:
        application/json:
          schema:
            type: object
            properties:
              metadata:
                type: object
              data:
                $ref: "#/components/schemas/ProjectList"
```

---

## Stage 2: BFF Stub Implementation

### Files to Create/Modify

| File | Purpose |
|------|---------|
| `bff/internal/models/project.go` | Project DTO struct |
| `bff/internal/mocks/projects_mock.go` | Mock project data |
| `bff/internal/api/projects_handler.go` | HTTP handler |
| `bff/internal/api/app.go` | Wire the new route |

### 2.1 Model (`bff/internal/models/project.go`)

```go
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
```

### 2.2 Mock Data (`bff/internal/mocks/projects_mock.go`)

```go
package mocks

import (
    "time"
    "project-navigator/bff/internal/models"
)

func GetMockProjects() models.ProjectList {
    return models.ProjectList{
        Items: []models.Project{
            {
                Name:        "data-science-project",
                DisplayName: "Data Science Project",
                Description: "ML experiments and model training",
                Status:      models.ProjectStatusActive,
                CreatedAt:   time.Now().Add(-30 * 24 * time.Hour),
            },
            {
                Name:        "fraud-detection",
                DisplayName: "Fraud Detection",
                Description: "Real-time fraud detection pipeline",
                Status:      models.ProjectStatusActive,
                CreatedAt:   time.Now().Add(-15 * 24 * time.Hour),
            },
            {
                Name:        "llm-fine-tuning",
                DisplayName: "LLM Fine-Tuning",
                Description: "Fine-tuning foundation models",
                Status:      models.ProjectStatusActive,
                CreatedAt:   time.Now().Add(-7 * 24 * time.Hour),
            },
            {
                Name:        "deprecated-project",
                DisplayName: "Old Project",
                Description: "Being cleaned up",
                Status:      models.ProjectStatusTerminating,
                CreatedAt:   time.Now().Add(-90 * 24 * time.Hour),
            },
        },
        TotalSize: 4,
    }
}
```

### 2.3 Handler (`bff/internal/api/projects_handler.go`)

```go
package api

import (
    "encoding/json"
    "net/http"

    "github.com/julienschmidt/httprouter"
    "project-navigator/bff/internal/mocks"
)

func (a *App) ProjectsHandler(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
    // TODO: Replace with production K8s logic
    projects := mocks.GetMockProjects()

    response := map[string]interface{}{
        "metadata": map[string]interface{}{},
        "data":     projects,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}
```

### 2.4 Route Registration (`bff/internal/api/app.go`)

Add to the route setup:

```go
router.GET("/api/v1/projects", a.ProjectsHandler)
```

---

## Stage 3: Frontend Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `frontend/src/app/types/project.ts` | TypeScript types |
| `frontend/src/app/api/projects.ts` | API client |
| `frontend/src/app/hooks/useProjects.ts` | Data fetching hook |
| `frontend/src/app/pages/projects/ProjectsPage.tsx` | Main page component |
| `frontend/src/app/pages/projects/ProjectsTable.tsx` | Table component |
| `frontend/src/app/pages/projects/ProjectsTableRow.tsx` | Table row component |
| `frontend/src/app/pages/projects/columns.ts` | Column definitions |
| `frontend/src/app/pages/projects/useProjectsFilter.ts` | Filter hook |

### 3.1 Types (`frontend/src/app/types/project.ts`)

```typescript
export type ProjectStatus = 'Active' | 'Terminating';

export type Project = {
  name: string;
  displayName?: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};

export type ProjectList = {
  items: Project[];
  nextPageToken?: string;
  totalSize?: number;
};
```

### 3.2 API Client (`frontend/src/app/api/projects.ts`)

```typescript
import { restGET } from '~/app/api/k8s';
import { ProjectList } from '~/app/types/project';
import { BFF_API_VERSION, URL_PREFIX } from '~/app/utilities/const';

export const listProjects = (): Promise<ProjectList> =>
  restGET(`${URL_PREFIX}/api/${BFF_API_VERSION}/projects`).then(
    (response) => response.data as ProjectList
  );
```

### 3.3 Hook (`frontend/src/app/hooks/useProjects.ts`)

```typescript
import * as React from 'react';
import { listProjects } from '~/app/api/projects';
import { ProjectList } from '~/app/types/project';

type UseProjectsState = {
  projects: ProjectList | null;
  loaded: boolean;
  error: Error | null;
  refresh: () => void;
};

export const useProjects = (): UseProjectsState => {
  const [projects, setProjects] = React.useState<ProjectList | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchProjects = React.useCallback(() => {
    setLoaded(false);
    setError(null);
    listProjects()
      .then(setProjects)
      .catch(setError)
      .finally(() => setLoaded(true));
  }, []);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return { projects, loaded, error, refresh: fetchProjects };
};
```

### 3.4 Column Definitions (`frontend/src/app/pages/projects/columns.ts`)

```typescript
import { SortableData } from '@odh-dashboard/internal/components/table/types';
import { Project } from '~/app/types/project';

export const projectColumns: SortableData<Project>[] = [
  {
    field: 'displayName',
    label: 'Name',
    width: 25,
    sortable: (a, b) =>
      (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name),
  },
  {
    field: 'name',
    label: 'Resource Name',
    width: 20,
    sortable: (a, b) => a.name.localeCompare(b.name),
  },
  {
    field: 'status',
    label: 'Status',
    width: 15,
    sortable: (a, b) => a.status.localeCompare(b.status),
  },
  {
    field: 'createdAt',
    label: 'Created',
    width: 25,
    sortable: (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
];
```

### 3.5 ProjectsTable (`frontend/src/app/pages/projects/ProjectsTable.tsx`)

```typescript
import * as React from 'react';
import { SearchInput, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core';
import Table from '@odh-dashboard/internal/components/table/Table';
import DashboardEmptyTableView from '@odh-dashboard/internal/concepts/dashboard/DashboardEmptyTableView';
import { Project } from '~/app/types/project';
import { projectColumns } from './columns';
import ProjectsTableRow from './ProjectsTableRow';

type ProjectsTableProps = {
  projects: Project[];
};

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects }) => {
  const [filterValue, setFilterValue] = React.useState('');

  const filteredProjects = React.useMemo(
    () =>
      projects.filter((p) => {
        const searchText = filterValue.toLowerCase();
        return (
          p.name.toLowerCase().includes(searchText) ||
          (p.displayName?.toLowerCase().includes(searchText) ?? false)
        );
      }),
    [projects, filterValue]
  );

  return (
    <Table
      data-testid="projects-table"
      id="projects-table"
      enablePagination
      data={filteredProjects}
      columns={projectColumns}
      defaultSortColumn={0}
      onClearFilters={() => setFilterValue('')}
      emptyTableView={
        <DashboardEmptyTableView onClearFilters={() => setFilterValue('')} />
      }
      toolbarContent={
        <Toolbar>
          <ToolbarContent>
            <ToolbarItem style={{ minWidth: '15rem' }}>
              <SearchInput
                placeholder="Filter by name"
                value={filterValue}
                onChange={(_e, value) => setFilterValue(value)}
                onClear={() => setFilterValue('')}
                aria-label="Filter projects"
                data-testid="projects-filter-input"
              />
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>
      }
      rowRenderer={(project) => (
        <ProjectsTableRow key={project.name} project={project} />
      )}
    />
  );
};

export default ProjectsTable;
```

### 3.6 ProjectsPage (`frontend/src/app/pages/projects/ProjectsPage.tsx`)

```typescript
import * as React from 'react';
import {
  PageSection,
  Title,
  EmptyState,
  EmptyStateBody,
  Spinner,
  Alert,
} from '@patternfly/react-core';
import { useProjects } from '~/app/hooks/useProjects';
import ProjectsTable from './ProjectsTable';

const ProjectsPage: React.FC = () => {
  const { projects, loaded, error } = useProjects();

  if (error) {
    return (
      <PageSection>
        <Alert variant="danger" title="Failed to load projects">
          {error.message}
        </Alert>
      </PageSection>
    );
  }

  if (!loaded) {
    return (
      <PageSection>
        <EmptyState>
          <Spinner size="lg" />
          <EmptyStateBody>Loading projects...</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Title headingLevel="h1" style={{ marginBottom: '1rem' }}>
        Projects
      </Title>
      <ProjectsTable projects={projects?.items ?? []} />
    </PageSection>
  );
};

export default ProjectsPage;
```

### 3.7 Route Registration (`frontend/src/app/AppRoutes.tsx`)

```typescript
import ProjectsPage from '~/app/pages/projects/ProjectsPage';

// Add to routes array:
{
  path: '/projects',
  element: <ProjectsPage />,
}
```

---

## Stage 4: Production BFF

### Replace Mocks with K8s Logic

Create `bff/internal/repositories/project_repository.go`:

```go
package repositories

import (
    "context"

    projectv1 "github.com/openshift/api/project/v1"
    "k8s.io/client-go/kubernetes"
    "project-navigator/bff/internal/models"
)

type ProjectRepository struct {
    client kubernetes.Interface
}

func (r *ProjectRepository) ListProjects(ctx context.Context) (models.ProjectList, error) {
    // Use ProjectRequest to list user-accessible projects
    // Convert projectv1.Project to models.Project
    // Handle pagination via continue token
}
```

Update handler to use repository instead of mocks when `MOCK_K8S_CLIENT=false`.

---

## Module Configuration

### Existing Configuration (from scaffolded package)

| Setting | Value |
|---------|-------|
| Module Federation Name | `projectNavigator` |
| Local Dev Port | `9103` |
| BFF Port | `4000` |
| URL Prefix | `/project-navigator` |
| API Version | `v1` |

### package.json (root)

```json
{
  "name": "@odh-dashboard/project-navigator",
  "module-federation": {
    "name": "projectNavigator",
    "local": {
      "host": "localhost",
      "port": 9103
    }
  }
}
```

---

## Testing Requirements

### Unit Tests (Jest)

| Test File | Coverage |
|-----------|----------|
| `useProjects.test.ts` | Hook behavior, loading states, error handling |
| `ProjectsTable.test.tsx` | Rendering, filtering, sorting |
| `columns.test.ts` | Sort functions |

### Cypress E2E Tests

| Test File | Scenarios |
|-----------|-----------|
| `projects.cy.ts` | List projects, filter, pagination, empty state |

### BFF Tests

| Test File | Coverage |
|-----------|----------|
| `projects_handler_test.go` | Handler responses, validation |

---

## Success Criteria

- [ ] **Stage 1**: OpenAPI spec updated with Project schema and `/api/v1/projects` endpoint
- [ ] **Stage 2**: BFF returns mock projects matching the contract
- [ ] **Stage 3**: UI displays projects in a filterable, sortable, paginated table
- [ ] **Stage 4**: BFF fetches real projects from OpenShift cluster

---

## References

- [Package AGENTS.md](../../packages/project-navigator/AGENTS.md)
- [mod-arch-starter AGENTS.md](https://github.com/opendatahub-io/mod-arch-library/blob/main/mod-arch-starter/AGENTS.md)
- [PatternFly v6 Table](https://www.patternfly.org/components/table)
- [@odh-dashboard/internal Table](../../frontend/src/components/table/)
