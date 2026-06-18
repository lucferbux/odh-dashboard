# Automated Module Onboarding

How AI-driven skills turn a week-long onboarding process into a few hours of guided automation.

## The Problem

Onboarding a new module to the ODH Dashboard historically required navigating a maze of repositories, templates, and team handoffs:

- Scaffold the package in the monorepo (naming, ports, feature flags, host registration)
- Write and validate Dockerfiles for both ODH (upstream) and RHOAI (downstream)
- Create Tekton pipelines with the right substitutions
- File DevOps Jira tickets with validated YAML attachments — twice, once per product
- Wait for DevOps GitLab CI to provision Quay repos, Konflux components, and release pipelines
- Configure OpenShift CI in the `openshift/release` repo
- Create manifest overlays for Kubernetes deployment
- Coordinate operator integration with the Platform team
- Track all of this across 8+ Jira subtasks

Each step had its own conventions, edge cases, and tribal knowledge. A single missed detail — a wrong port, a missing SHA digest, a malformed YAML — could stall the entire pipeline for days. The end-to-end process typically took **a full week** of an engineer's time, spread across multiple sprints due to cross-team dependencies.

## The Solution

Four Claude Code skills now automate the vast majority of this work. An engineer runs a few commands, answers a handful of questions, and the skills handle scaffolding, validation, file generation, Jira tracking, and even PR creation.

### Skill 1: `/module-onboarding <name>`

Scaffolds a production-ready module in the Dashboard monorepo in minutes.

**What it does:**

1. Collects all inputs upfront (name, type, maturity level, ports) with validation
2. Runs the `mod-arch-installer` and patches the output
3. Registers the module in the host app (feature flag, `SupportedArea`, state map)
4. Verifies the Dockerfile builds correctly
5. Runs `npm install`, port validation, and full type-check
6. Produces a summary report with next steps

**Before:** 2-4 hours of manual scaffolding, copying from existing modules, fixing type errors, debugging port conflicts.

**After:** ~5 minutes of answering questions, then automated scaffolding and verification.

### Skill 2: `/konflux-onboarding <name>`

Sets up the entire CI/CD pipeline across ODH and RHOAI.

**What it does:**

1. Classifies the component (Type A modular-arch package vs Type B standalone Go binary)
2. Auto-detects existing state (Dockerfiles, pipelines) to skip completed work
3. Generates or verifies ODH upstream Dockerfiles and Tekton PipelineRun YAML
4. Generates RHOAI downstream Dockerfiles with SHA-pinned images, FIPS compliance, and Red Hat labels
5. Creates manifest overlays for Kubernetes deployment
6. Optionally automates OpenShift CI — forks `openshift/release`, generates config, creates a PR
7. Provides an operator integration checklist mapping RHOAIENG-31290 requirements
8. Tracks progress across Jira subtasks automatically

**Before:** 2-3 days of Dockerfile creation, pipeline YAML templating, and manual Jira updates across 8 subtasks.

**After:** ~30 minutes of guided automation with automatic Jira progress tracking.

### Skill 3: `/create-component-onboarding-jira`

Generates validated DevOps onboarding requests.

**What it does:**

1. Walks through the onboarding schema interactively (component name, repo, branch, architectures, release category)
2. Auto-derives values where possible (RHOAI branch from version, descriptions from README)
3. Generates `component_onboarding_details.yaml` validated against the DevOps JSON Schema
4. Creates or updates a Jira ticket (cloning from the correct product template)
5. Attaches the YAML and links to the parent feature

**Before:** 30-60 minutes per ticket, frequently rejected by DevOps automation due to schema mismatches.

**After:** ~5 minutes per ticket, validated before submission. Two runs (ODH + RHOAI) complete in under 15 minutes.

### Skill 4: `/validate-component-onboarding-jira <url>`

Pre-flight validation before DevOps processes the ticket.

**What it does:**

1. Fetches the Jira ticket details and downloads the YAML attachment
2. Validates against the DevOps JSON Schema
3. Cross-validates branch naming against the target RHOAI version
4. Checks that all Dockerfile `FROM` instructions use `@sha256:` digests (RHOAI only)
5. Updates the Jira ticket with `validation-successful` label and moves to In Progress

**Before:** Submit, wait 2+ hours for DevOps CI, get rejected, fix, resubmit. Often 2-3 round trips.

**After:** Instant local validation. Issues caught before the ticket is even submitted.

## The Onboarding Epic: RHOAIENG-37060

The [Modular Architecture - Deployment](https://redhat.atlassian.net/browse/RHOAIENG-37060) epic serves as the template for every new module onboarding. It breaks down into 8 subtasks that map directly to the skills:

| Subtask | Summary | Automation | Skill |
|---------|---------|------------|-------|
| +1 | Onboard module to Dashboard | Fully automated | `/module-onboarding` |
| +2 | Create Konflux onboarding Jiras | Fully automated | `/create-component-onboarding-jira` |
| +3 | Create Dockerfiles & Tekton Pipelines | Mostly automated | `/konflux-onboarding` Phases 1-4 |
| +4 | Track & verify ODH Konflux onboarding | Automated monitoring | DevOps GitLab CI + label progression |
| +5 | Set up OpenShift CI builds | Opt-in automation | `/konflux-onboarding` Phase 6 |
| +6 | Onboard module in manifest overlays | Automated scaffolding | `/konflux-onboarding` Phase 5 |
| +7 | Onboard module in operator | Manual + checklist | `/konflux-onboarding` Phase 7 checklist |
| +8 | Track & verify RHOAI Konflux onboarding | Automated monitoring | DevOps GitLab CI + label progression |

The `/konflux-onboarding` skill automatically posts progress comments to each subtask as phases complete, so the tracking epic always reflects the current state.

### DevOps Label Progression

DevOps automation tracks its own progress through Jira labels. After a validated YAML is attached, the ticket progresses automatically:

```
yaml-attached -> validation-successful -> component-onboarding
  -> onboarding-in-review -> okc-pr-merged -> tekton-pr-merged
  -> operator-pr-merged -> bundle-pr-merged -> quay-mr-merged
  -> krd-mr-merged -> component-onboarding-completed
```

Each label transition corresponds to a DevOps GitLab CI job completing a specific provisioning step (Quay repo, Konflux component, release pipeline, Renovate config, etc.). The engineer monitors this progression — when it reaches `component-onboarding-completed`, the infrastructure is fully provisioned.

## Timeline: Before vs After

### Before (Manual Process)

| Day | Activity |
|-----|----------|
| Day 1 | Scaffold module, write upstream Dockerfile, create Tekton pipelines |
| Day 2 | Write downstream Dockerfile, fix SHA digests, debug FIPS flags |
| Day 3 | File DevOps Jira tickets, get rejected, fix YAML, resubmit |
| Day 4 | Wait for DevOps CI, review generated PRs, configure OpenShift CI |
| Day 5 | Create manifest overlays, coordinate operator integration, verify end-to-end |

**Total: ~5 working days**, often stretched across 2 sprints due to back-and-forth with DevOps and the Platform team.

### After (Automated Process)

| Time | Activity |
|------|----------|
| 0:00 | Run `/module-onboarding my-module` — module scaffolded and verified |
| 0:10 | Run `/konflux-onboarding my-module` — Dockerfiles, pipelines, overlays, OpenShift CI PR created |
| 0:40 | Run `/create-component-onboarding-jira` twice — ODH and RHOAI tickets filed and validated |
| 0:50 | Review generated files, push PRs |
| 2:00 | DevOps GitLab CI processes tickets (runs every ~2 hours) |
| 3:00 | Review and merge DevOps-generated PRs |
| 4:00 | Verify first builds succeed, operator checklist handed to Platform team |

**Total: ~4 hours of active work**, plus ~2 hours of waiting for DevOps CI. The only remaining human-in-the-loop steps are PR reviews, operator coordination, and end-to-end verification.

## Impact for Teams

### No More Bottlenecks

Previously, onboarding was a specialized task that only a few engineers understood end-to-end. Teams building new modules had to wait for those engineers to be available, creating a bottleneck that could delay feature delivery by weeks.

Now, **any engineer on any team** can onboard a module by running four commands. The skills encode all the tribal knowledge — naming conventions, port ranges, Dockerfile patterns, FIPS requirements, Jira schemas — into guided automation that validates as it goes.

### From Specialist Knowledge to Shared Capability

The skills don't just automate steps — they make the _why_ visible. When `/konflux-onboarding` generates a downstream Dockerfile, it explains the SHA digest pinning requirement. When `/module-onboarding` allocates a port, it shows the valid range and what's already taken. Engineers learn the system as they use it.

### Parallel Module Development

With onboarding reduced from a week to hours, teams can spin up new modules at the pace of product decisions, not infrastructure constraints. A module conceived on Monday can have its first CI build running by Tuesday.

## Getting Started

### Prerequisites

- Claude Code with the Dashboard skills available
- DevOps plugin: `/plugin install aiops-skills@opendatahub-skills:0.1.0`
- `uv` (Python): `curl -LsSf https://astral.sh/uv/install.sh | sh`
- Jira API credentials exported:
  ```bash
  export JIRA_USER_EMAIL='you@redhat.com'
  export JIRA_API_TOKEN='your-token'
  ```
- Write access to `opendatahub-io/odh-dashboard` and `red-hat-data-services/odh-dashboard`

### Quick Start

```bash
# 1. Scaffold the module
/module-onboarding my-module

# 2. Set up CI/CD pipelines
/konflux-onboarding my-module

# 3. File DevOps onboarding requests (run twice: ODH + RHOAI)
/create-component-onboarding-jira

# 4. Validate before DevOps picks it up
/validate-component-onboarding-jira https://redhat.atlassian.net/browse/RHOAIENG-XXXXX
```

Each skill guides you through the process interactively. No prior onboarding experience required.

## References

### Skill Development PRs (opendatahub-io/odh-dashboard)

| PR | Status | Description |
|----|--------|-------------|
| [#6761](https://github.com/opendatahub-io/odh-dashboard/pull/6761) | Merged | Add agent skills — initial Claude Code skill framework |
| [#6770](https://github.com/opendatahub-io/odh-dashboard/pull/6770) | Merged | Check for module federation port conflict — port validation tooling |
| [#7885](https://github.com/opendatahub-io/odh-dashboard/pull/7885) | Merged | Convert module onboarding rule into a skill (`/module-onboarding`) |
| [#8073](https://github.com/opendatahub-io/odh-dashboard/pull/8073) | Merged | Add Konflux onboarding Claude Code skill (`/konflux-onboarding`) |
| [#8184](https://github.com/opendatahub-io/odh-dashboard/pull/8184) | Open | Enhance onboarding skills with upfront Q&A and automation |

### Real-World Onboarding PRs

These PRs were produced (or informed) by the onboarding skills during actual module onboardings:

**Upstream (opendatahub-io/odh-dashboard)**

| PR | Status | Description |
|----|--------|-------------|
| [#7610](https://github.com/opendatahub-io/odh-dashboard/pull/7610) | Merged | Add agent-ops mod-arch module — first module onboarded using `/module-onboarding` |
| [#7881](https://github.com/opendatahub-io/odh-dashboard/pull/7881) | Merged | Remove agent-ops from federation-configmap until container is deployed |
| [#7800](https://github.com/opendatahub-io/odh-dashboard/pull/7800) | Open | Add agent-ops BFF to mod-arch manifests |
| [#8093](https://github.com/opendatahub-io/odh-dashboard/pull/8093) | Open | Add Helm bootstrap chart for dashboard module controller |
| [#8133](https://github.com/opendatahub-io/odh-dashboard/pull/8133) | Open | Dashboard module controller implementation |
| [#8201](https://github.com/opendatahub-io/odh-dashboard/pull/8201) | Open | Add early-gate CI pipelines |
| [#7742](https://github.com/opendatahub-io/odh-dashboard/pull/7742) | Merged | Add AI harness for dashboard-operator |

**Downstream (red-hat-data-services/odh-dashboard)**

| PR | Status | Description |
|----|--------|-------------|
| [#895](https://github.com/red-hat-data-services/odh-dashboard/pull/895) | Merged | Create Dockerfile.konflux for mod-arch component |
| [#1278](https://github.com/red-hat-data-services/odh-dashboard/pull/1278) | Merged | Add maas as a Dockerfile.konflux |
| [#1479](https://github.com/red-hat-data-services/odh-dashboard/pull/1479) | Merged | Add MLflow UI as a Dockerfile.konflux |
| [#1484](https://github.com/red-hat-data-services/odh-dashboard/pull/1484) | Merged | Add Dockerfile.konflux for automl and autorag |
| [#1974](https://github.com/red-hat-data-services/odh-dashboard/pull/1974) | Merged | Upgrade Konflux Dockerfiles from nodejs-20 to nodejs-22 |
| [#2061](https://github.com/red-hat-data-services/odh-dashboard/pull/2061) | Open | Add Dockerfile.konflux.dashboard-operator |

**OpenShift CI (openshift/release)**

| PR | Status | Description |
|----|--------|-------------|
| [#68914](https://github.com/openshift/release/pull/68914) | Merged | Add new module for modular architecture model registry |

### Jira Issues

**Epic and Subtask Templates**

| Issue | Summary |
|-------|---------|
| [RHOAIENG-37060](https://redhat.atlassian.net/browse/RHOAIENG-37060) | Modular Architecture - Deployment — template epic with 8 subtasks |
| [RHOAIENG-37061](https://redhat.atlassian.net/browse/RHOAIENG-37061) | Onboard module to Dashboard Repo (subtask +1) |
| [RHOAIENG-37062](https://redhat.atlassian.net/browse/RHOAIENG-37062) | Create Konflux Onboarding Jira Tickets (subtask +2) |
| [RHOAIENG-37063](https://redhat.atlassian.net/browse/RHOAIENG-37063) | Create Dockerfiles & Tekton Pipelines (subtask +3) |
| [RHOAIENG-37064](https://redhat.atlassian.net/browse/RHOAIENG-37064) | Track & Verify ODH Konflux Onboarding (subtask +4) |
| [RHOAIENG-37065](https://redhat.atlassian.net/browse/RHOAIENG-37065) | Set up module for OpenShift CI builds (subtask +5) |
| [RHOAIENG-37066](https://redhat.atlassian.net/browse/RHOAIENG-37066) | Onboard Module in Manifest Overlays (subtask +6) |
| [RHOAIENG-37067](https://redhat.atlassian.net/browse/RHOAIENG-37067) | Onboard Module in Operator (subtask +7) |
| [RHOAIENG-37068](https://redhat.atlassian.net/browse/RHOAIENG-37068) | Track & Verify RHOAI Konflux Onboarding (subtask +8) |

**Skill Development**

| Issue | Status | Summary |
|-------|--------|---------|
| [RHOAIENG-66095](https://redhat.atlassian.net/browse/RHOAIENG-66095) | Review | Create Konflux onboarding skill for the Dashboard |

**DevOps Onboarding Templates**

| Issue | Summary |
|-------|---------|
| [RHOAIENG-35683](https://redhat.atlassian.net/browse/RHOAIENG-35683) | [Template] ODH Konflux CI Build Onboarding — cloned by `/create-component-onboarding-jira` |
| [RHOAIENG-17225](https://redhat.atlassian.net/browse/RHOAIENG-17225) | [Template] RHOAI Konflux Onboarding — cloned by `/create-component-onboarding-jira` |

**Operator Integration**

| Issue | Status | Summary |
|-------|--------|---------|
| [RHOAIENG-59936](https://redhat.atlassian.net/browse/RHOAIENG-59936) | Review | Integrate Dashboard Module Controller with ODH Operator |
| [RHOAIENG-58839](https://redhat.atlassian.net/browse/RHOAIENG-58839) | New | Onboard module in Operator (checklist mapped by `/konflux-onboarding` Phase 7) |
| [RHOAIENG-31290](https://redhat.atlassian.net/browse/RHOAIENG-31290) | New | [Template] Tech Preview - ODH and RHOAI Integrations |
| [RHOAIENG-65724](https://redhat.atlassian.net/browse/RHOAIENG-65724) | Closed | Konflux CI build onboarding for dashboard-operator image |
