# **RFE: Clusterless Development Mode for Downstream Dashboard**

## **PARENT EPIC: Clusterless Development Mode**

**Summary**: Enable clusterless development for RHOAI downstream dashboard (Core features)

**Description**: Enable clusterless development for the RHOAI downstream dashboard by implementing a comprehensive mock mode system for Core dashboard resources, similar to the modular architecture modules. This will allow developers to work on Core dashboard functionality (User, Dashboard Config, Application, Document, QuickStart) without requiring a running Kubernetes cluster, significantly improving developer velocity and reducing onboarding friction.

### Strategic Goals
- **Accelerate Development Cycles**: Remove dependency on Kubernetes cluster for Core feature development
- **Improve Developer Onboarding**: Make it easier for new developers to start contributing to Core dashboard features
- **Align with Modular Architecture**: Adopt patterns used in upstream modular architecture modules
- **Reduce Infrastructure Costs**: Minimize need for local or remote test clusters during Core feature development
- **Enable Feature-Specific Mocking**: Allow selective mocking of Core K8s resources per feature area
- **Establish Foundation**: Create extensible framework for future feature-specific mock data expansion

### Scope

**In Scope**:
- Backend mock mode infrastructure in Fastify
  - Core -> User, Dashboard Config, Application, (Document, QuickStart)
- Frontend SDK mocking system for kubernetes API calls outside BFF
- Ability to enable/disable features in mock mode so you can launch only certain features with mock data
- Developer documentation and setup guides

**Out of Scope**:
- Production deployment changes
- Actual cluster integration testing (remains cluster-dependent)
- E2E test modifications (continue using real cluster)
- Feature-specific mock data (Notebooks, Model Serving, Projects, Data Connections, Model Registry, Pipelines)

### Success Criteria
- Developers can run dashboard locally without K8s cluster for Core features
- Mock mode covers 80% of common development workflows through Core resource mocking
- Developer setup time reduced by 50%
- Clear documentation for adding new mock data for Core resources
- Environment variables allow granular control of mocking and feature enablement for Core features
- Foundation established for future expansion to feature-specific mock data

**Priority**: Major  
**Team**: RHOAI Dashboard (4158)  
**Labels**: enhancement, developer-experience, mock-mode  
**Components**: Dashboard

---

## **EPIC 1: Backend Mock Mode Infrastructure**

**Summary**: Implement Fastify backend mock mode infrastructure

**Description**:

### Overview
Create a comprehensive mock mode system in the Fastify backend to simulate Kubernetes API responses without requiring a live cluster, inspired by the modular architecture's Go BFF implementation.

### Goals
- Implement mock environment flags similar to model-registry BFF (`--mock-k8s-client`, `--mock-data`)
- Create mock data infrastructure for K8s resources
- Implement pass-through API mock layer
- Enable feature-specific mock mode control

### Technical Approach
- Add environment variables: `MOCK_MODE`, `MOCK_K8S_API`, `MOCK_FEATURES`
- Create mock data provider system for Core resources
- Implement conditional routing in pass-through API
- Add mock data generators for Core resources (User, Dashboard Config, Application, Document, QuickStart)

**Acceptance Criteria**:
- Mock mode can be enabled via environment variable
- Pass-through API routes to mock data when enabled for Core resources
- Mock data matches real K8s response structures for Core resources
- Feature flags control which Core features use mock mode
- Documentation for adding new Core mock resources
- Clear separation between Core and feature-specific functionality

**Priority**: Major  
**Labels**: enhancement, backend, mock-mode

### **Stories under Epic 1**:

#### **Story 1.1**: Add Mock Mode Environment Variables and Configuration

**Description**:

### Description of the enhancement
Add environment variable support and configuration system for enabling mock mode in the Fastify backend, similar to how model-registry BFF uses `--mock-k8s-client`.

### Acceptance Criteria
- Add `MOCK_MODE` boolean environment variable to constants.ts
- Add `MOCK_K8S_API` environment variable for K8s API mocking control
- Add `MOCK_FEATURES` JSON string for feature-specific mock control
- Update backend startup to log mock mode status
- Add type definitions for mock configuration
- Add/Update unit tests for configuration loading

### Additional info
- Relevant files: constants.ts, dotenv.ts
- Follow existing patterns from `DEV_MODE` flag
- Reference: main.go for flag patterns

**Priority**: Major  
**Labels**: enhancement, backend, configuration

---

#### **Story 1.2**: Create Mock Data Provider Infrastructure

**Description**:

### Description of the enhancement
Create a mock data provider system that can generate and serve mock Kubernetes resources, providing a foundation for all mock data needs.

### Acceptance Criteria
- Create `backend/src/utils/mockData/` directory structure
- Implement `MockDataProvider` base class/interface
- Create mock data for Core K8s resources (ConfigMaps, Secrets, Namespaces/Projects)
- Focus on resources needed for Core dashboard functionality (User, Dashboard Config, Application)
- Implement data generation helpers for Core resources
- Support both static and dynamic mock data
- Add/Update unit tests for mock data providers

### Additional info
- Relevant areas: utils
- Consider using faker.js or similar for generating realistic data
- Mock data should match K8s API response structures exactly
- Focus on Core resources only; feature-specific resources (Notebooks, Model Serving, etc.) are out of scope

**Priority**: Major  
**Labels**: enhancement, backend, mock-data

---

#### **Story 1.3**: Implement Pass-Through API Mock Layer

**Description**:

### Description of the enhancement
Modify the pass-through API to conditionally route to mock data providers when mock mode is enabled, maintaining the same interface for frontend consumers.

### Acceptance Criteria
- Update `passThroughResource` to check `MOCK_MODE` flag
- Implement mock response routing logic
- Maintain existing pass-through behavior when mock mode disabled
- Handle HTTP methods (GET, POST, PUT, PATCH, DELETE) in mock mode
- Preserve error handling patterns
- Add/Update unit tests for mock routing

### Additional info
- Relevant files: pass-through.ts
- Mock responses must match real K8s API response structures
- Consider adding request/response logging in mock mode

**Priority**: Major  
**Labels**: enhancement, backend, api

---

#### **Story 1.4**: Implement Feature-Specific Mock Control

**Description**:

### Description of the enhancement  
Create a system to enable/disable mock mode per feature area, allowing developers to test specific Core features without mocking the entire dashboard.

### Acceptance Criteria
- Implement feature flag parsing from `MOCK_FEATURES` environment variable
- Create feature registry system for Core features
- Add API to check if feature should use mock mode
- Support patterns for Core resources (e.g., `core.user`, `core.dashboardConfig`, `core.application`)
- Focus on Core dashboard features only
- Add/Update unit tests for feature flag logic

### Additional info
- Relevant files: New file `backend/src/utils/mockFeatures.ts`
- Should integrate with existing feature flag system if present
- Scope limited to Core features; advanced feature-specific mocking (notebooks, model serving) is out of scope

**Priority**: Normal  
**Labels**: enhancement, backend, feature-flags

---

#### **Story 1.5**: Create Mock Data for Core Dashboard Resources

**Description**:

### Description of the enhancement
Implement mock data providers for core dashboard resources like OdhDashboardConfig, OdhApplication, OdhDocument, etc.

### Acceptance Criteria
- Create mock data for `OdhDashboardConfig`
- Create mock data for `OdhApplication`
- Create mock data for `OdhDocument`
- Create mock data for `OdhQuickStart`
- Mock data represents realistic scenarios
- Add/Update unit tests for mock data generation

### Additional info
- Relevant files: New files in `backend/src/utils/mockData/`
- Reference: constants.ts for `blankDashboardCR`

**Priority**: Major  
**Labels**: enhancement, backend, mock-data

---

## **EPIC 2: Frontend SDK Mocking & Mock Data Provider**

**Summary**: Implement frontend K8s SDK mocking system

**Description**:

### Overview
Create a mocking system for `@openshift/dynamic-plugin-sdk` to intercept K8s API calls made from the frontend and return mock data when the backend is in mock mode.

### Goals
- Enable SDK mocking at the application level
- Create mock implementations of K8s SDK functions
- Support both static and dynamic mock responses
- Maintain TypeScript typing throughout

### Technical Approach
- Create mock SDK wrapper/provider
- Implement mock versions of `k8sGetResource`, `k8sCreateResource`, etc.
- Add mock detection from backend
- Create mock data matching K8s resource types needed for Core features

**Acceptance Criteria**:
- Frontend can detect backend mock mode
- SDK calls are intercepted when in mock mode for Core resources
- Mock responses match real SDK response structures for Core K8s resources
- TypeScript types are preserved
- Documentation for adding frontend mock data for Core resources
- Clear boundaries established between Core and feature-specific mocking

**Priority**: Major  
**Labels**: enhancement, frontend, mock-mode, sdk

### **Stories under Epic 2**:

#### **Story 2.1**: Create SDK Mock Provider Infrastructure

**Description**:

### Description of the enhancement
Build the infrastructure to wrap and mock kubernetes calls, allowing the frontend to use mock data during development.

### Acceptance Criteria
- Try to reuse or extend the current Mock k8s module that we already have for testing
- Implement mock provider for SDK functions
- Create TypeScript interfaces for mock configurations
- Support conditional mocking based on backend mode
- Add/Update unit tests for mock provider

### Additional info
- Relevant files: k8sUtils.ts
- Reference SDK documentation in SDK.md
- Must maintain full TypeScript typing

**Priority**: Major  
**Labels**: enhancement, frontend, sdk

---

#### **Story 2.2**: Implement Mock k8sGetResource

**Description**:

### Description of the enhancement
Create a mock implementation of `k8sGetResource` that returns realistic K8s resource data for development.

### Acceptance Criteria
- Implement mock version of `k8sGetResource`
- Support all K8s resource models used in dashboard
- Return data matching real K8s API structure
- Support query options (name, namespace)
- Handle not found scenarios
- Add/Update unit tests for mock function

### Additional info
- Relevant files: New file `frontend/src/api/k8sMocks/k8sGetResource.ts`
- Reference: SDK documentation and existing usage patterns

**Priority**: Major  
**Labels**: enhancement, frontend, sdk

---

#### **Story 2.3**: Implement Mock k8sCreateResource, k8sUpdateResource, k8sPatchResource

**Description**:

### Description of the enhancement
Create mock implementations of create, update, and patch operations for K8s resources.

### Acceptance Criteria
- Implement mock `k8sCreateResource` with validation
- Implement mock `k8sUpdateResource` with validation
- Implement mock `k8sPatchResource` supporting JSON patches
- Store created/updated resources in mock store
- Return appropriate success/error responses
- Add/Update unit tests for mock functions

### Additional info
- Relevant files: New files in `frontend/src/api/k8sMocks/`
- Must support JSON Patch operations (add, replace, remove)
- Reference: k8sUtils.ts for `createPatchesFromDiff`

**Priority**: Major  
**Labels**: enhancement, frontend, sdk

---

#### **Story 2.4**: Implement Mock k8sDeleteResource and k8sListResource

**Description**:

### Description of the enhancement
Create mock implementations for delete and list operations on K8s resources.

### Acceptance Criteria
- Implement mock `k8sDeleteResource`
- Implement mock `k8sListResource` with filtering support
- Remove resources from mock store on delete
- Support list filtering by labels, namespace
- Add pagination support for list operations
- Add/Update unit tests for mock functions

### Additional info
- Relevant files: New files in `frontend/src/api/k8sMocks/`
- List operations should support K8sResourceListResult type

**Priority**: Major  
**Labels**: enhancement, frontend, sdk

---

#### **Story 2.5**: Create Scaffolding for Frontend Mock Data

**Description**:

### Description of the enhancement
Create the scaffolding and initial mock data for Core K8s resources needed by the dashboard, investigate reusing the existing test mocks.

### Acceptance Criteria
- Create the logic to load mock data
- Initial mock data is provided for Core K8s resources
- Existing test mocks are reviewed and reused where applicable
- Mock data is structured to support Core dashboard functionality
- Add the ability for easy extension of mock data for specific features

### Additional info
- Should support scenarios needed for Core dashboard features (empty, populated, error states)
- Feature-specific resources (PVCs, Services, Notebooks, etc.) are not created but scaffolding allows future extension for teams to add them
- Documentation for adding new mock data providers

**Priority**: Major  
**Labels**: enhancement, frontend, mock-data

---

#### **Story 2.6**: Implement Mock Mode Detection and Initialization

**Description**:

### Description of the enhancement
Create a system to detect if the backend is running in mock mode and automatically initialize frontend SDK mocking.

### Acceptance Criteria
- Add API endpoint to check backend mock mode status
- Implement frontend initialization logic
- Automatically enable SDK mocking when backend in mock mode
- Provide visual indicator of mock mode (dev ribbon/banner)
- Add developer console logging for mock mode
- Add/Update unit tests for mock mode detection

### Additional info
- Relevant files: AppLauncher.tsx or similar initialization point
- Consider adding a `/api/health` or `/api/status` endpoint

**Priority**: Major  
**Labels**: enhancement, frontend, initialization

---

## **EPIC 3: Documentation & Developer Experience**

**Summary**: Create comprehensive documentation for Core mock mode

**Description**:

### Overview
Provide clear, comprehensive documentation to help developers set up and use mock mode effectively for Core dashboard development.

### Goals
- Document setup and configuration for Core mock mode
- Provide examples for common Core development scenarios
- Create guides for adding new mock data for Core resources
- Document troubleshooting steps
- Focus documentation on Core features (User, Dashboard Config, Application)

### Documentation Areas
- Setup guide for Core mock mode
- Configuration reference for Core features
- Mock data creation guide for Core resources
- Troubleshooting guide
- Contributing guidelines for Core mock mode

**Acceptance Criteria**:
- Complete developer setup guide for Core mock mode
- Documentation for all Core-related configuration options
- Examples for extending Core mock data
- Troubleshooting section with common issues
- Clear indication of what is in scope (Core) vs out of scope (feature-specific)

**Priority**: Normal  
**Labels**: documentation, developer-experience

### **Stories under Epic 4**:

#### **Story 4.1**: Create Mock Mode Setup Guide

**Description**:

### Description of the enhancement
Create a comprehensive guide for setting up and running the dashboard in Core mock mode.

### Acceptance Criteria
- Document environment variable setup for Core mock mode
- Provide quick start instructions
- Include configuration examples for Core features
- Document prerequisites (Node.js, npm versions)
- Add troubleshooting steps
- Update main README.md with Core mock mode info
- Clearly indicate scope limitations (Core features only)

### Additional info
- Target audience: New developers onboarding to the project
- Location: `docs/mock-mode-setup.md`
- Should include both backend and frontend setup
- Emphasize that feature-specific mocking (notebooks, model serving) is not included

**Priority**: Normal  
**Labels**: documentation, getting-started

---

#### **Story 4.2**: Create Mock Data Creation Guide

**Description**:

### Description of the enhancement
Document the process for creating and contributing new mock data providers for Core features.

### Acceptance Criteria
- Document mock data architecture for Core resources
- Provide step-by-step guide for adding Core mock data
- Include code examples for Core resource types
- Document best practices for Core mock data
- Cover both backend and frontend mock data for Core features
- Add examples for User, Dashboard Config, Application, Document, QuickStart
- Clearly indicate that feature-specific resources are out of scope

### Additional info
- Location: `docs/mock-mode-contributing.md`
- Should include TypeScript examples
- Link to existing Core mock data implementations as examples
- Include section on scope limitations

**Priority**: Normal  
**Labels**: documentation, contributing

---

#### **Story 4.3**: Create Mock Mode Configuration Reference

**Description**:

### Description of the enhancement
Create a complete reference guide for all Core mock mode configuration options and environment variables.

### Acceptance Criteria
- Document all environment variables for Core mock mode
- Explain configuration precedence
- Provide examples for different Core configurations
- Document feature flag syntax for Core features (user, dashboardConfig, application, etc.)
- Include default values
- Add configuration troubleshooting
- Clearly document scope limitations

### Additional info
- Location: `docs/mock-mode-configuration.md`
- Should be structured as a reference guide
- Include `.env.example` file with all Core mock mode variables
- Indicate which features are supported vs out of scope

**Priority**: Normal  
**Labels**: documentation, configuration

---

#### **Story 4.4**: Update Development Workflow Documentation

**Description**:

### Description of the enhancement
Update existing development documentation to incorporate Core mock mode into standard workflows.

### Acceptance Criteria
- Update CONTRIBUTING.md with Core mock mode info
- Update dev-setup.md with Core mock mode instructions
- Add Core mock mode to PR review guidelines
- Document testing strategies with Core mock mode
- Update troubleshooting guides
- Add section explaining scope (Core features only)
- Document when to use vs not use mock mode

### Additional info
- Multiple file updates across docs/
- Should integrate seamlessly with existing docs
- Highlight when to use vs not use mock mode
- Emphasize that E2E tests remain cluster-dependent

**Priority**: Normal  
**Labels**: documentation, contributing

---

#### **Story 4.5**: Create Mock Mode Demo Video or Tutorial

**Description**:

### Description of the enhancement
Create a video walkthrough or interactive tutorial demonstrating Core mock mode setup and usage.

### Acceptance Criteria
- Record screen capture of Core mock mode setup process
- Demonstrate common Core development workflows
- Show how to add new Core mock data
- Highlight troubleshooting steps
- Clearly explain scope limitations (Core features only)
- Upload to team knowledge base
- Keep focus on Core features (User, Dashboard Config, Application)

### Additional info
- Could be recorded using Loom, OBS, or similar
- Keep under 10-15 minutes
- Consider creating multiple short videos for different Core aspects
- Emphasize what is possible vs what requires a cluster

**Priority**: Minor  
**Labels**: documentation, video, tutorial
