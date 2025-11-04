# **RFE: Modular Architecture Deployment Migration - Independent Pod Strategy**

## **PARENT EPIC: Migrate Modular Modules to Independent Pod Deployments**

**Summary**: Migrate from multi-container pods to independent pod deployments for modular architecture modules

**Description**: Transform the deployment architecture for modular architecture modules from the current multi-container pod approach (Option 2) to independent pod deployments (Option 1). This migration will provide true microservice isolation, enable selective module deployment based on operator feature flags, and establish a scalable foundation for future module additions while collaborating closely with the Foundations Team to ensure seamless operator integration.

### Strategic Goals

- **Enable Operator-Driven Deployment**: Allow the operator to conditionally deploy/undeploy modules based on feature flags and controller availability
- **Achieve True Microservice Isolation**: Separate module lifecycles, resources, and fault domains through independent pods
- **Simplify Module Onboarding**: Create a standardized process for deploying new modules without modifying the main dashboard
- **Improve Resource Management**: Enable per-module scaling, resource allocation, and monitoring
- **Establish Manifest Independence**: Move module manifests outside dashboard overlays into their own hierarchy
- **Reduce Foundation Team Burden**: Provide clear patterns and automation to minimize manual operator work

### Scope

**In Scope**:

- Migration of existing modules (Model Registry, Gen AI) from multi-container to independent pods
- Operator integration for conditional module deployment based on feature enablement
- Independent manifest hierarchy for modules outside dashboard overlays
- Standardized onboarding process and templates for new modules
- Resource management and NetworkPolicy updates for independent pods
- Collaboration framework with Foundations Team for operator changes
- Migration guide and rollback strategy

**Out of Scope**:

- Changes to module frontend/backend code (deployment-only migration)
- Modifications to dashboard core functionality
- Non-Kubernetes deployment environments
- Performance optimization beyond resource allocation

### Success Criteria

- All existing modules (Model Registry, Gen AI) deployed as independent pods
- Operator can deploy/undeploy modules based on feature flags without manual intervention
- Module manifests live in independent hierarchy outside dashboard overlays
- Onboarding guide enables new module deployment in <1 day
- Zero downtime migration completed successfully
- Resource usage per module is measurable and manageable
- Foundations Team approves operator integration patterns

**Priority**: Major  
**Team**: RHOAI Dashboard (4158)  
**Labels**: enhancement, deployment, modular-architecture, operator-integration, infrastructure  
**Components**: Dashboard

---

## **EPIC 1: Operator Integration & Conditional Deployment**

**Summary**: Enable operator-driven conditional deployment of modules based on feature flags

**Description**:

### Overview (Epic 1)

Collaborate with the Foundations Team to extend the ODH/RHOAI operator to support conditional deployment of modular architecture modules. This Epic focuses on defining the operator API contract, feature flag mechanisms, and deployment lifecycle management needed to deploy/undeploy modules independently from the main dashboard based on cluster configuration and available controllers.

### Goals (Epic 1)

- Create operator reconciliation logic for module lifecycle
- Define operator logic for deploying modules based on feature flags
- Enable module deployment/undeployment without dashboard restarts
- Establish API contract between dashboard and operator for module status

### Technical Approach (Epic 1)

- Extend operator logic to conditionally deploy modules based on feature flags on DSC
- Implement operator controller for module reconciliation
- Create status conditions for module readiness and health
- Integrate with existing operator patterns (DSCInitialization, DataScienceCluster)

**Acceptance Criteria**:

- Operator can deploy/undeploy modules based on the DSC configuration
- Feature flags control which modules are active
- Module status visible in operator-managed CRs
- Operator handles module lifecycle (create, update, delete) independently from dashboard
- Documentation for operator integration approved by Foundations Team

**Priority**: Major  
**Labels**: operator, foundations-team, api, deployment

### **Stories under Epic 1**

#### **Story 1.1**: Define Operator API Contract for Module Deployment

**Description**:

#### Description (Story 1.1)

Design and document the operator API contract for modular module deployment, including DSC control based on feature flags, and status reporting mechanisms. Collaborate with Foundations Team to align with existing operator patterns.

#### Acceptance Criteria (Story 1.1)

- API design document created and reviewed by Foundations Team
- Feature flag mechanism designed (annotations, labels, or spec fields)
- Status conditions defined for module health and readiness
- OpenAPI/CRD YAML examples provided

#### Additional info (Story 1.1)

- Reference: Option 1 of the Deployment document
- Coordinate with Foundations Team for CRD review
- Consider existing patterns in DataScienceCluster and DSCInitialization CRDs

**Priority**: Major  
**Labels**: api, crd, foundations-team

---

#### **Story 1.2**: Implement Feature Flag Detection in Operator

**Description**:

#### Description (Story 1.2)

Implement operator logic to detect and evaluate feature flags that control module deployment, checking for required controllers and dependencies before deploying modules.

#### Acceptance Criteria (Story 1.2)

- Operator reads feature flags from DSC
- Logic checks for required controllers and features (e.g., Model Registry controller for Model Registry module)
- Operator gracefully skips module deployment when dependencies are unavailable
- Feature flag changes trigger module reconciliation
- Unit tests for feature flag evaluation logic

#### Additional info (Story 1.2)

- Relevant files: Operator codebase (to be coordinated with Foundations Team)
- Support multiple flag types: boolean, controller presence, version checks
- Consider feature flag precedence and override mechanisms

**Priority**: Major  
**Labels**: operator, feature-flags, reconciliation

---

#### **Story 1.3**: Create Module Lifecycle Reconciliation Controller

**Description**:

#### Description (Story 1.3)

Build operator controller logic to manage the full lifecycle of modular modules (create, update, delete, health monitoring) independently from the main dashboard deployment.

#### Acceptance Criteria (Story 1.3)

- Operator reconciles module Deployment, Service, ConfigMap resources
- Module creation triggered when feature flag is enabled
- Module deletion/cleanup triggered when feature flag is disabled
- Reconciliation handles updates to module images or configuration
- Controller uses controller-runtime patterns and follows operator best practices

#### Additional info (Story 1.3)

- Coordinate with Foundations Team for integration into operator codebase
- Reuse existing operator patterns for resource management
- Ensure idempotent reconciliation logic

**Priority**: Major  
**Labels**: operator, reconciliation, lifecycle

---

#### **Story 1.4**: Implement Module Status Reporting in DSC

**Description**:

#### Description (Story 1.4)

Add status conditions to the operator DSC to report module health, readiness, and any deployment errors, providing observability for module states.

#### Acceptance Criteria (Story 1.4)

- Status conditions include: `ModuleAvailable`, `ModuleReady`, `ModuleProgressing`, `ModuleDegraded`
- Status includes per-module details (name, version, pod status)
- Errors and warnings reported in status conditions
- Status visible via `kubectl get <crd>` and `oc describe`
- Unit and integration tests for status updates

#### Additional info (Story 1.4)

- Follow Kubernetes API conventions for conditions
- Include timestamps and generation tracking
- Reference: Operator SDK status best practices

**Priority**: Major  
**Labels**: operator, observability, status

---

#### **Story 1.5**: Integration Testing with Operator

**Description**:

#### Description (Story 1.5)

Develop integration tests to validate operator behavior for module deployment, feature flag changes, and lifecycle management in a real or simulated cluster.

#### Acceptance Criteria (Story 1.5)

- Integration test suite runs against test cluster
- Tests cover: module deployment, feature flag toggle, module update, module deletion
- Tests validate status conditions and resource creation
- CI pipeline includes integration tests
- Test documentation provided

#### Additional info (Story 1.5)

- Use envtest or kind for integration testing
- Coordinate with Foundations Team for CI integration
- Consider using Ginkgo/Gomega for test framework

**Priority**: Normal  
**Labels**: testing, operator, ci

---

## **EPIC 2: Manifest Restructuring & Independent Hierarchy**

**Summary**: Restructure manifests to support independent module deployments outside dashboard overlays

**Description**:

### Overview (Epic 2)

Refactor the current manifest structure in `manifests/modular-architecture` to enable independent module deployment with dedicated Deployments, Services, and ConfigMaps. Create a new manifest hierarchy that separates module manifests from dashboard overlays, allowing the operator to manage them independently.

### Goals (Epic 2)

- Remove multi-container patches from dashboard deployment
- Create standalone Deployment manifests per module
- Establish independent manifest hierarchy (`manifests/modules/` or similar)
- Support module-specific ConfigMaps and Secrets
- Enable kustomize overlays per module for different environments

### Technical Approach (Epic 2)

- Create `manifests/modules/<module-name>/` directory structure
- Convert JSON6902 patches to standalone Deployment resources
- Split Service ports into per-module Services
- Separate NetworkPolicies for each module
- Provide base and overlay structure for module customization

**Acceptance Criteria**:

- Module manifests exist independently in `manifests/modules/`
- Each module has: Deployment, Service, ConfigMap, NetworkPolicy
- Dashboard deployment no longer includes multi-container patches
- Kustomize builds succeed for independent modules
- Operator can apply module manifests independently

**Priority**: Major  
**Labels**: manifests, kustomize, infrastructure

### **Stories under Epic 2**

#### **Story 2.1**: Create Independent Manifest Directory Structure

**Description**:

#### Description (Story 2.1)

Establish a new directory structure for module manifests outside the dashboard overlay, following Kubernetes and kustomize best practices.

#### Acceptance Criteria (Story 2.1)

- Directory structure created: `manifests/modules/<module-name>/base/`
- Each module has: `kustomization.yaml`, `deployment.yaml`, `service.yaml`, `configmap.yaml`, `networkpolicy.yaml`
- README.md per module explains manifest structure
- Base manifests are environment-agnostic
- Overlays directory prepared for environment-specific customization

#### Additional info (Story 2.1)

- Reference: `manifests/modular-architecture/` current structure
- Follow patterns from `manifests/core-bases/`
- Coordinate with SRE/Platform teams for directory naming conventions

**Priority**: Major  
**Labels**: manifests, directory-structure

---

#### **Story 2.2**: Convert Model Registry to Standalone Deployment

**Description**:

#### Description (Story 2.2)

Extract Model Registry container definition from `deployment.yaml` JSON6902 patch and create a standalone Deployment resource with all necessary configurations.

#### Acceptance Criteria (Story 2.2)

- Standalone `model-registry-ui-deployment.yaml` created
- Deployment includes: container spec, resources, probes, volumeMounts, args, securityContext
- Image reference uses kustomize variable substitution
- Pod labels and selectors defined
- Service account reference included

#### Additional info (Story 2.2)

- Source: `manifests/modular-architecture/deployment.yaml` (model-registry-ui section)
- Target: `manifests/modules/model-registry/base/deployment.yaml`
- Ensure parity with current multi-container spec

**Priority**: Major  
**Labels**: manifests, model-registry, deployment

---

#### **Story 2.3**: Convert Gen AI to Standalone Deployment

**Description**:

#### Description (Story 2.3)

Extract Gen AI container definition from `deployment.yaml` JSON6902 patch and create a standalone Deployment resource.

#### Acceptance Criteria (Story 2.3)

- Standalone `gen-ai-ui-deployment.yaml` created
- Deployment includes all configurations from multi-container spec
- Image reference uses kustomize variable substitution
- Pod labels and selectors defined
- Service account reference included

#### Additional info (Story 2.3)

- Source: `manifests/modular-architecture/deployment.yaml` (gen-ai-ui section)
- Target: `manifests/modules/gen-ai/base/deployment.yaml`
- Mirror patterns from Story 2.2

**Priority**: Major  
**Labels**: manifests, gen-ai, deployment

---

#### **Story 2.4**: Create Independent Service Manifests per Module

**Description**:

#### Description (Story 2.4)

Create dedicated Service resources for each module to expose their pods independently, replacing the current port patches on the dashboard Service.

#### Acceptance Criteria (Story 2.4)

- `model-registry-ui-service.yaml` created with port 8043
- `gen-ai-ui-service.yaml` created with port 8143
- Services have proper selectors matching module Deployments
- Service type and annotations configured
- Naming conventions follow Kubernetes best practices

#### Additional info (Story 2.4)

- Source: `manifests/modular-architecture/service.yaml`
- Target: `manifests/modules/<module-name>/base/service.yaml`
- Consider headless service option if needed

**Priority**: Major  
**Labels**: manifests, service, networking

---

#### **Story 2.5**: Update Federation ConfigMap for Independent Services

**Description**:

#### Description (Story 2.5)

Modify the Module Federation ConfigMap to reference independent module Services instead of dashboard ports, supporting the new deployment architecture.

#### Acceptance Criteria (Story 2.5)

- Federation ConfigMap updated with independent service references
- Service names and ports reference new module Services
- Namespace handling supports multi-namespace deployments
- ConfigMap generation integrated with kustomize
- Backward compatibility maintained during migration

#### Additional info (Story 2.5)

- Source: `manifests/modular-architecture/federation-configmap.yaml`
- Update `service.name` fields to match independent Services
- Consider ConfigMap per module vs. centralized approach

**Priority**: Major  
**Labels**: manifests, configmap, module-federation

---

#### **Story 2.6**: Create Module NetworkPolicies for Pod Isolation

**Description**:

#### Description (Story 2.6)

Define NetworkPolicy resources for each module to restrict ingress/egress traffic, ensuring modules only communicate with the dashboard and required services.

#### Acceptance Criteria (Story 2.6)

- NetworkPolicy per module created
- Ingress rules allow traffic from dashboard pods only
- Egress rules allow API server, DNS, and required services
- Policies tested in development cluster
- Documentation explains network isolation model

#### Additional info (Story 2.6)

- Reference: `manifests/modular-architecture/networkpolicy.yaml`
- Target: `manifests/modules/<module-name>/base/networkpolicy.yaml`
- Align with security requirements and zero-trust principles

**Priority**: Normal  
**Labels**: manifests, security, networkpolicy

---

#### **Story 2.7**: Remove Multi-Container Patches from Dashboard Overlay

**Description**:

#### Description (Story 2.7)

Clean up `manifests/modular-architecture/` by removing JSON6902 patches that inject module containers into the dashboard Deployment, now that modules are independent.

#### Acceptance Criteria (Story 2.7)

- `deployment.yaml` and `service.yaml` patches removed from dashboard overlay
- Dashboard kustomization updated to remove patch references
- Dashboard deployment builds successfully without module patches
- Documentation updated to reflect removal
- Git history preserved for reference

#### Additional info (Story 2.7)

- Ensure operator no longer applies these patches
- Consider deprecation period if needed for rollback
- Update `manifests/modular-architecture/README.md`

**Priority**: Normal  
**Labels**: manifests, cleanup, dashboard

---

## **EPIC 3: Onboarding Process & Module Templates**

**Summary**: Standardize the process for onboarding new modular modules with templates and automation

**Description**:

### Overview (Epic 3)

Create comprehensive onboarding materials, templates, and automation to enable new modular modules to be deployed with minimal effort from the Foundations Team. This Epic focuses on reducing toil and establishing a repeatable process for adding modules to the platform.

### Goals (Epic 3)

- Provide Helm/Kustomize templates for new modules
- Document the end-to-end onboarding workflow
- Create automation for manifest generation
- Define checklist for module deployment readiness
- Establish review and approval process with Foundations Team

**Acceptance Criteria**:

- Onboarding guide enables module deployment in <1 day
- Templates cover all required Kubernetes resources
- Automation generates module manifests from module metadata
- Checklist ensures modules meet deployment requirements
- At least one new module onboarded using the process successfully

**Priority**: Normal  
**Labels**: documentation, automation, onboarding, templates

### **Stories under Epic 3**

#### **Story 3.1**: Create Module Manifest Templates

**Description**:

#### Description (Story 3.1)

Develop Kustomize/Helm templates for module Deployments, Services, ConfigMaps, and NetworkPolicies that can be customized for each new module.

#### Acceptance Criteria (Story 3.1)

- Template directory created: `manifests/modules/template/`
- Templates include placeholders for: module name, image, ports, paths
- Kustomize patches provided for common customizations
- README explains how to use templates
- Example module demonstrates template usage

#### Additional info (Story 3.1)

- Follow patterns from existing Model Registry and Gen AI manifests
- Consider parameterization via kustomize replacements
- Include security defaults (securityContext, NetworkPolicy)

**Priority**: Normal  
**Labels**: templates, manifests, onboarding

---

#### **Story 3.2**: Document Module Onboarding Workflow

**Description**:

#### Description (Story 3.2)

Write comprehensive onboarding documentation that guides module owners through the process of deploying a new module to the platform.

#### Acceptance Criteria (Story 3.2)

- Onboarding guide created: `docs/module-onboarding.md`
- Covers: manifest creation, operator integration, testing, deployment
- Includes decision tree for module requirements
- Links to templates and examples
- Reviewed and approved by Foundations Team

#### Additional info (Story 3.2)

- Reference: `mod-arch-docs/modular-architecture-deployment.md`
- Include prerequisites (module BFF ready, containers built, etc.)
- Provide troubleshooting section

**Priority**: Normal  
**Labels**: documentation, onboarding

---

#### **Story 3.3**: Create Module Deployment Readiness Checklist

**Description**:

#### Description (Story 3.3)

Define a checklist to validate that a module is ready for deployment, covering technical, security, and operational requirements.

#### Acceptance Criteria (Story 3.3)

- Checklist covers: manifest completeness, image availability, network requirements, resource limits, security posture
- Integrated into onboarding guide
- Automation (script or CI check) validates checklist items where possible
- Checklist reviewed by SRE and Security teams

#### Additional info (Story 3.3)

- Include items like: TLS certificates, service account permissions, health checks
- Consider integration with CI/CD pipeline

**Priority**: Minor  
**Labels**: checklist, onboarding, quality

---

#### **Story 3.4**: Automate Manifest Generation from Module Metadata

**Description**:

#### Description (Story 3.4)

Build tooling to generate module manifests from a simple metadata file (YAML/JSON), reducing manual manifest creation.

#### Acceptance Criteria (Story 3.4)

- CLI tool or script created: `scripts/generate-module-manifests.sh`
- Accepts module metadata: name, image, port, paths, feature flags
- Generates: Deployment, Service, ConfigMap, NetworkPolicy
- Output validated against Kubernetes schema
- Documentation and examples provided

#### Additional info (Story 3.4)

- Use templating engine (Helm, ytt, or envsubst)
- Consider integration with operator for dynamic generation
- Follow patterns from `packages/app-config/scripts/package-subtree.sh`

**Priority**: Minor  
**Labels**: automation, tooling, manifests

---

#### **Story 3.5**: Onboard Pilot Module Using New Process

**Description**:

#### Description (Story 3.5)

Validate the onboarding process by deploying a new module (or re-onboarding an existing one) following the documented workflow and using templates.

#### Acceptance Criteria (Story 3.5)

- New module successfully onboarded following guide
- Time to onboard measured (<1 day target)
- Feedback collected and used to improve templates/docs
- Lessons learned documented
- Process approved by Foundations Team

#### Additional info (Story 3.5)

- Candidate modules: upcoming modular architecture module (e.g., Notebooks, Pipelines)
- Involve module owner in process validation
- Document any deviations or issues encountered

**Priority**: Minor  
**Labels**: pilot, onboarding, validation

---

## **EPIC 4: Migration Strategy & Rollout**

**Summary**: Plan and execute migration from multi-container to independent pod deployments

**Description**:

### Overview (Epic 4)

Develop a comprehensive migration strategy to transition existing modules (Model Registry, Gen AI) from multi-container pods to independent pods with zero downtime, including rollback procedures and phased rollout.

### Goals (Epic 4)

- Design zero-downtime migration approach
- Create rollback and recovery procedures
- Execute phased rollout (dev → staging → production)
- Validate functionality and performance post-migration
- Document migration outcomes and lessons learned

**Acceptance Criteria**:

- Migration plan approved by stakeholders
- Zero downtime achieved during migration
- Rollback tested and documented
- All environments migrated successfully
- Post-migration metrics show expected behavior

**Priority**: Major  
**Labels**: migration, rollout, deployment

### **Stories under Epic 4**

#### **Story 4.1**: Design Zero-Downtime Migration Strategy

**Description**:

#### Description (Story 4.1)

Plan the technical approach for migrating from multi-container pods to independent pods without service interruption.

#### Acceptance Criteria (Story 4.1)

- Migration design document created covering: traffic routing, resource overlap, cutover sequence
- Blue-green or rolling deployment strategy defined
- Service continuity validated (Module Federation, BFF routing)
- Resource requirements calculated (temporary resource doubling)
- Design reviewed by SRE and Foundations Team

#### Additional info (Story 4.1)

- Consider using Kubernetes Deployment rollouts
- Evaluate Service updates and Ingress/Route changes
- Plan for ConfigMap and Secret migrations

**Priority**: Major  
**Labels**: migration, architecture, planning

---

#### **Story 4.2**: Create Rollback and Recovery Procedures

**Description**:

#### Description (Story 4.2)

Document and test procedures to rollback to multi-container deployment if issues arise during or after migration.

#### Acceptance Criteria (Story 4.2)

- Rollback procedures documented step-by-step
- Rollback tested in development environment
- Recovery time objectives (RTO) defined
- Automation provided for rollback where possible
- Communication plan for rollback decision

#### Additional info (Story 4.2)

- Include data preservation steps (if any state exists)
- Define rollback triggers and decision criteria
- Test rollback under failure scenarios

**Priority**: Major  
**Labels**: rollback, recovery, risk-management

---

#### **Story 4.3**: Execute Migration in Development Environment

**Description**:

#### Description (Story 4.3)

Perform the first migration in a development cluster to validate the process and identify issues before production rollout.

#### Acceptance Criteria (Story 4.3)

- Migration executed in dev cluster successfully
- Modules function correctly as independent pods
- Module Federation and BFF routing validated
- Performance metrics collected
- Issues and adjustments documented

#### Additional info (Story 4.3)

- Use dev cluster: `opendatahub-dev` namespace (or equivalent)
- Monitor logs and metrics during migration
- Engage module owners for functional validation

**Priority**: Major  
**Labels**: migration, development, validation

---

#### **Story 4.4**: Execute Migration in Staging/Pre-Production

**Description**:

#### Description (Story 4.4)

Roll out the migration to staging environment, validating in a production-like setting with realistic workloads and configurations.

#### Acceptance Criteria (Story 4.4)

- Migration executed in staging cluster
- Load testing performed to validate performance
- Security scans and NetworkPolicy validation completed
- Sign-off from QE and module owners
- Issues resolved or risks documented

#### Additional info (Story 4.4)

- Use staging cluster mirrors production configuration
- Coordinate with QE for test execution
- Include smoke tests and integration tests

**Priority**: Major  
**Labels**: migration, staging, validation

---

#### **Story 4.5**: Execute Production Migration

**Description**:

#### Description (Story 4.5)

Perform the final migration in production clusters, following the validated process and monitoring closely for any issues.

#### Acceptance Criteria (Story 4.5)

- Migration executed in production cluster(s)
- Zero downtime confirmed (SLOs met)
- Monitoring dashboards show healthy module status
- User-facing functionality validated
- Incident response plan ready if issues occur

#### Additional info (Story 4.5)

- Schedule during low-traffic window
- Have Foundations Team and SRE on standby
- Rollback plan immediately available

**Priority**: Major  
**Labels**: migration, production, deployment

---

#### **Story 4.6**: Post-Migration Validation & Metrics Collection

**Description**:

#### Description (Story 4.6)

Validate that the migration achieved the desired outcomes and collect metrics to compare against baseline performance.

#### Acceptance Criteria (Story 4.6)

- Functional tests pass for all modules
- Performance metrics collected: latency, resource usage, error rates
- Metrics compared to pre-migration baseline
- Anomalies investigated and resolved
- Migration report created with outcomes and recommendations

#### Additional info (Story 4.6)

- Monitor for 1-2 weeks post-migration
- Collect feedback from module owners and users
- Document unexpected behaviors or improvements

**Priority**: Normal  
**Labels**: validation, metrics, observability

---

## **EPIC 5: Documentation & Foundation Team Collaboration**

**Summary**: Provide comprehensive documentation and establish collaboration patterns with Foundations Team

**Description**:

### Overview (Epic 5)

Create detailed documentation for the new deployment architecture, operator integration, and module onboarding process. Establish ongoing collaboration patterns with the Foundations Team to ensure smooth operation and future module additions.

### Goals (Epic 5)

- Document new deployment architecture and patterns
- Create operator integration guide for Foundations Team
- Update existing dashboard documentation
- Establish communication and review processes
- Provide training materials for stakeholders

**Acceptance Criteria**:

- Architecture documentation published and reviewed
- Foundations Team onboarded and trained
- Existing docs updated to reflect new deployment model
- Collaboration processes agreed and documented
- Runbooks and troubleshooting guides available

**Priority**: Normal  
**Labels**: documentation, collaboration, foundations-team

### **Stories under Epic 5**

#### **Story 5.1**: Document New Deployment Architecture

**Description**:

#### Description (Story 5.1)

Create comprehensive architecture documentation explaining the independent pod deployment model, including diagrams, resource definitions, and design decisions.

#### Acceptance Criteria (Story 5.1)

- Architecture document created: `docs/modular-architecture-deployment-v2.md`
- Includes: architecture diagram, resource topology, networking, security model
- Explains differences from multi-container approach
- Justifies design decisions with tradeoffs
- Reviewed and approved by architects and Foundations Team

#### Additional info (Story 5.1)

- Reference: `mod-arch-docs/modular-architecture-deployment.md` (update or create new version)
- Use diagrams from Option 1 architecture
- Include operator integration points

**Priority**: Normal  
**Labels**: documentation, architecture

---

#### **Story 5.2**: Create Operator Integration Guide for Foundations Team

**Description**:

#### Description (Story 5.2)

Write a dedicated guide for the Foundations Team explaining how to integrate new modules into the operator and manage feature flags.

#### Acceptance Criteria (Story 5.2)

- Operator guide created: `docs/operator-module-integration.md`
- Covers: CRD updates, feature flag configuration, reconciliation logic
- Provides code examples and patterns
- Includes testing and validation steps
- Reviewed and accepted by Foundations Team

#### Additional info (Story 5.2)

- Align with operator development practices
- Include references to relevant Stories from Epic 1
- Provide contribution guidelines

**Priority**: Normal  
**Labels**: documentation, operator, foundations-team

---

#### **Story 5.3**: Update Existing Dashboard Documentation

**Description**:

#### Description (Story 5.3)

Update all existing documentation referencing the deployment model to reflect the new independent pod architecture.

#### Acceptance Criteria (Story 5.3)

- `README.md`, `CONTRIBUTING.md`, `docs/dev-setup.md` updated
- References to multi-container deployment removed or marked deprecated
- Links to new architecture docs added
- Deployment commands and examples updated
- Documentation build/validation passes

#### Additional info (Story 5.3)

- Search for "modular-architecture" references across docs
- Update diagrams and screenshots where applicable
- Coordinate with technical writers if available

**Priority**: Normal  
**Labels**: documentation, maintenance

---

#### **Story 5.4**: Create Troubleshooting and Runbooks

**Description**:

#### Description (Story 5.4)

Develop troubleshooting guides and runbooks for common issues with independent pod deployments and module lifecycle management.

#### Acceptance Criteria (Story 5.4)

- Troubleshooting guide created: `docs/modular-architecture-troubleshooting.md`
- Covers: pod not starting, networking issues, operator reconciliation failures, rollback procedures
- Runbooks provided for SRE team
- Includes log locations and diagnostic commands
- Tested by QE or SRE team

#### Additional info (Story 5.4)

- Include kubectl/oc commands for common diagnostics
- Document expected vs. actual states
- Provide links to relevant Jira/GitHub issues

**Priority**: Minor  
**Labels**: documentation, troubleshooting, runbooks

---

#### **Story 5.5**: Conduct Training Session for Foundations Team

**Description**:

#### Description (Story 5.5)

Organize and deliver a training session for the Foundations Team covering the new deployment model, operator integration, and onboarding process.

#### Acceptance Criteria (Story 5.5)

- Training session scheduled and conducted
- Training materials prepared (slides, demo, hands-on)
- Foundations Team members attend and participate
- Q&A session addresses concerns and questions
- Feedback collected and incorporated into docs

#### Additional info (Story 5.5)

- Consider recording session for future reference
- Include live demo of operator reconciliation
- Provide sandbox environment for hands-on practice

**Priority**: Minor  
**Labels**: training, collaboration, foundations-team

