---
name: konflux-onboarding
description: "Guides Konflux CI/CD pipeline onboarding for new components — upstream ODH Dockerfiles & Tekton pipelines, downstream RHOAI Dockerfile generation, DevOps skill integration, manifest overlays, and Jira tracking."
argument-hint: "<component-name> [--skip-odh] [--skip-downstream] [--skip-jira]"
---

# Konflux Onboarding

Onboard a component to Konflux CI/CD pipelines for both ODH (upstream) and RHOAI (downstream). This skill handles Dockerfiles, Tekton PipelineRun YAML, DevOps coordination, manifest overlays, OpenShift CI, operator integration, and Jira updates.

Companion to `/module-onboarding` which handles Dashboard-side package scaffolding. This skill covers the CI/CD pipeline side.

## Flags

Parse from `$ARGUMENTS`:
- `--skip-odh` — skip Phases 1-2 (ODH upstream Dockerfile and Tekton pipelines)
- `--skip-downstream` — skip Phases 3-4 (RHOAI DevOps request and downstream Dockerfile)
- `--skip-jira` — skip Phase 8 (Jira updates)

## Phase 0: Upfront Q&A

Collect all inputs before any CI/CD work begins. Ask each question in sequence, validating and auto-detecting as you go.

### Q1: Component Name

Extract from `$ARGUMENTS` (first positional argument). If missing, ask:

> What is the component name? (kebab-case, e.g., `my-module` or `dashboard-operator`)

**Validate**: Must match `^[a-z0-9]+(-[a-z0-9]+)*$`.

**Auto-classify** immediately after validation:

```bash
if [ -d "packages/${COMPONENT_NAME}" ]; then
  TYPE="A"   # Modular-arch package
elif [ -d "${COMPONENT_NAME}" ] && [ -f "${COMPONENT_NAME}/go.mod" ]; then
  TYPE="B"   # Standalone Go component
else
  # Ask user to clarify or confirm the component doesn't exist yet
fi
```

Report the classification to the user:
```text
Component: <name>
Type: A (modular-arch package) / B (standalone Go component)
```

### Q2: Konflux Component Name

Suggest a default based on type:
- **Type A** → `odh-mod-arch-<name>` (e.g., `odh-mod-arch-gen-ai`)
- **Type B** → `odh-<name>` (e.g., `odh-dashboard-operator`)

> Suggested Konflux component name: **<suggested>**
> Accept? (yes / enter a different name)

**Validate**: Must match `^odh-[a-z0-9]+(-[a-z0-9]+)*$`.

### Q3: Already Onboarded?

Auto-detect existing state:

```bash
# ODH Dockerfile
# Type A:
[ -f "packages/${COMPONENT_NAME}/Dockerfile.workspace" ] && echo "ODH Dockerfile: exists"
# Type B:
[ -f "${COMPONENT_NAME}/Dockerfile" ] && echo "ODH Dockerfile: exists"

# Tekton pipelines
find .tekton -maxdepth 1 -name "*${COMPONENT_NAME}*push*.yaml" -print -quit 2>/dev/null
find .tekton -maxdepth 1 -name "*${COMPONENT_NAME}*pull-request*.yaml" -print -quit 2>/dev/null
```

Report state:
```text
Existing state:
  ODH Dockerfile:      ✅ exists / ❌ missing
  Tekton push pipeline: ✅ exists / ❌ missing
  Tekton PR pipeline:   ✅ exists / ❌ missing
```

> Do you want to skip already-existing items? (yes / no)

If yes, set internal skip flags for those phases.

### Q4: Is this an operator/controller?

Infer from component type:
- **Type B** with `go.mod` referencing `sigs.k8s.io/controller-runtime` → suggest `yes`
- Otherwise → suggest `no`

> Is this component an operator or controller? (yes / no) [suggested: <inferred>]

### Q5: Konflux Onboarding Epic

> Do you have an existing Konflux onboarding epic (cloned from RHOAIENG-37060)?
> 1. **Yes** — I have an epic key (e.g., RHOAIENG-71234)
> 2. **No** — Clone the template for me

**If yes**: Ask for the epic key. Fetch subtask keys via MCP:

```
jira_search: jql = '"Epic Link" = <EPIC_KEY> ORDER BY key ASC'
```

Store the subtask mapping by ordinal position:
- Subtask 1 (+1): Upstream Module Scaffolding
- Subtask 2 (+2): Quay Repository + Konflux Component
- Subtask 3 (+3): Dockerfiles
- Subtask 4 (+4): Tekton Pipelines + CI Integration
- Subtask 5 (+5): OpenShift CI
- Subtask 6 (+6): Manifest Overlays
- Subtask 7 (+7): Operator Integration
- Subtask 8 (+8): Downstream Repo + Renovate

**If no**: Clone RHOAIENG-37060 via MCP:

1. Use `jira_create_issue` to create a new Epic with the same structure, updating the summary to include the component name:
   ```
   summary: "Konflux onboarding: <component-name>"
   ```
2. Create the 8 subtasks linked to the new epic using `customfield_12311140` (Epic Link).
3. Store the epic key and subtask keys for progress tracking.

### Q6: Target RHOAI Version

> What is the target RHOAI version? (e.g., `3.5`, `3.5-ea-2`)

**Validate**: Must match `^\d+\.\d+(?:\.0)?(?:-ea[-.]?\d+)?$`.

**Normalize** to canonical form:
- `3.5`, `3.5.0` → `3.5`
- `3.5-ea2`, `3.5-ea-2`, `3.5-ea.2` → `3.5-ea-2`

**Auto-derive** `repo_branch`:
- No EA suffix (e.g., `3.5`): `rhoai-3.5`
- EA suffix (e.g., `3.5-ea-2`): `rhoai-3.5-ea.2`

### Q7: CPU Architectures

> Which CPU architectures should this component build for?
> Default: [x86_64, arm64, ppc64le, s390x]
> Press Enter to accept, or enter a comma-separated list.

**Validate**: Each must be in `{x86_64, arm64, ppc64le, s390x}`.

### Q8: Release Category

> What is the release category?
> 1. **Generally Available** (GA) — default
> 2. **Tech Preview** (TP)
> 3. **Dev Preview / Beta** (DP)

Map to stored value: `"Generally Available"`, `"Tech Preview"`, or `"Beta"`.

### Q9: Automate OpenShift CI?

> Would you like to automate the OpenShift CI configuration?
> This will fork `openshift/release`, generate the CI config, and create a PR.
> Requires: `gh` CLI authenticated with your GitHub account.
> (yes / no) [default: no]

If yes, verify `gh` CLI is available:
```bash
gh auth status 2>&1
```

If `gh` is not authenticated, inform the user and fall back to instructions-only.

### Confirmation

Display a summary:

```text
Konflux onboarding summary:

  Component:           <name>
  Type:                A (modular-arch package) / B (standalone Go)
  Konflux name:        <odh-name>
  Is operator:         yes / no
  Tracking epic:       RHOAIENG-XXXXX (or: will be created)
  Target RHOAI:        <version>
  Repo branch:         <derived-branch>
  Architectures:       <list>
  Release category:    <category>
  Automate OpenShift CI: yes / no

  Existing state:
    ODH Dockerfile:        ✅ / ❌
    Tekton push pipeline:  ✅ / ❌
    Tekton PR pipeline:    ✅ / ❌

Proceed? (yes / no / edit)
```

- `yes` → continue to Phase 1
- `no` → abort
- `edit` → ask which field to change, update it, re-display summary

## Phase 1: ODH Upstream Dockerfile

**Goal**: Ensure the component has an upstream Dockerfile for ODH Konflux builds.

Skip if: `--skip-odh` flag, or Dockerfile already exists (detected in Q3).

### Type A

Check for `packages/<name>/Dockerfile.workspace`. If missing, scaffold from `packages/plugin-template/Dockerfile.workspace`.

Read the template from `packages/plugin-template/Dockerfile.workspace` and adapt:
- Set `ARG MODULE_NAME=<name>`
- Update `UI_SOURCE_CODE` and `BFF_SOURCE_CODE` paths
- If the package has no BFF (no `packages/<name>/bff/` directory), remove the BFF build stage and adjust the final stage to only copy UI artifacts
- Check `packages/<name>/bff/go.mod` for the Go version if BFF exists

See [references/dockerfile-templates.md](references/dockerfile-templates.md) § Type A for the full template.

### Type B

Check for `<name>/Dockerfile`. If missing, scaffold using the Type B template.

Read `<name>/go.mod` to determine Go version. Identify the binary build target from `<name>/cmd/*/main.go`.

See [references/dockerfile-templates.md](references/dockerfile-templates.md) § Type B for the full template.

**Verify**: The Dockerfile builds from repo root context (not from the component subdirectory).

### Jira Progress Update

If a tracking epic is linked, post a comment to subtask +3 (Dockerfiles):

```
jira_add_comment(issue_key="<SUBTASK_3_KEY>", body="ODH upstream Dockerfile <created/verified>: <path>")
```

## Phase 2: ODH Upstream Tekton Pipelines

**Goal**: Ensure `.tekton/` has push and pull-request pipelines for this component.

Skip if: `--skip-odh` flag, or both pipeline files already exist (detected in Q3).

### Type A

Scaffold `odh-mod-arch-<name>-push.yaml` and `odh-mod-arch-<name>-pull-request.yaml`.

Use an existing Type A pipeline as reference (e.g., `.tekton/odh-mod-arch-gen-ai-push.yaml`). Apply substitutions from [references/pipeline-templates.md](references/pipeline-templates.md):
- `COMPONENT_CI_NAME`: `odh-mod-arch-<name>-ci`
- `PIPELINE_NAME_PREFIX`: `odh-mod-arch-<name>`
- `QUAY_IMAGE`: `quay.io/opendatahub/odh-mod-arch-<name>`
- `DOCKERFILE_PATH`: `packages/<name>/Dockerfile.workspace`
- `PATH_CHANGED_EXPR`: `packages/<name>/**`
- `EXTRA_PATH_EXPR`: `|| "Dockerfile.workspace".pathChanged()`
- `SERVICE_ACCOUNT`: `build-pipeline-<name>` (must be provisioned by DevOps)

### Type B

Scaffold `<name>-push.yaml` and `<name>-pull-request.yaml`.

Use `.tekton/dashboard-operator-push.yaml` as reference. Apply substitutions:
- `COMPONENT_CI_NAME`: `<name>-ci`
- `PIPELINE_NAME_PREFIX`: `<name>`
- `QUAY_IMAGE`: `quay.io/opendatahub/<name>`
- `DOCKERFILE_PATH`: `<name>/Dockerfile`
- `PATH_CHANGED_EXPR`: `<name>/**`
- `EXTRA_PATH_EXPR`: `|| "manifests/**".pathChanged()` (if applicable)
- `SERVICE_ACCOUNT`: `build-pipeline-<name>`

**Important**: The service account must be provisioned by DevOps before the pipeline can run. Remind the user that Phase 3 (DevOps onboarding) handles this.

### Jira Progress Update

If a tracking epic is linked, post a comment to subtask +4 (Tekton/CI):

```
jira_add_comment(issue_key="<SUBTASK_4_KEY>", body="Tekton pipelines <created/verified>: <push-path>, <pr-path>")
```

## Phase 3: DevOps Onboarding Request

**Goal**: Generate `component_onboarding_details.yaml` files, validate them, and attach to a Jira ticket for DevOps automation.

Skip if: `--skip-downstream` flag.

Read [references/devops-integration.md](references/devops-integration.md) for the full integration guide.

**Important**: Two separate onboarding YAMLs are required — one for **ODH** and one for **RHOAI**. Each has different schema requirements. Run this phase twice.

### Prerequisites

The DevOps skill (`/create-component-onboarding-jira`) is a Claude Code plugin from `opendatahub-io/aiops-infra`. It requires `JIRA_USER_EMAIL` and `JIRA_API_TOKEN` env vars for its Python scripts.

If those env vars are not set, you can do the equivalent work manually:
1. Generate the YAML using the `generate_onboarding_yaml.py` script
2. Validate using `validate_yaml_schema.py`
3. Attach to Jira using the mcp-atlassian MCP tools

Scripts live at: `~/.claude/plugins/cache/opendatahub-skills/aiops-skills/0.1.0/`

### Step 3a: Generate ODH YAML

Use values collected in Phase 0 Q&A. Most ODH fields have defaults:

| Field | Value |
|-------|-------|
| `product_context` | `ODH` |
| `build_type` | `CI` |
| `component_name` | Konflux name from Q2 |
| `repo_url` | `https://github.com/opendatahub-io/odh-dashboard` |
| `repo_branch` | `main` |
| `context_path` | `./` |
| `dockerfile_path` | Type A: `packages/<name>/Dockerfile.workspace`, Type B: `<name>/Dockerfile` |
| `is_operator` | From Q4 |

```bash
cd ~/.claude/plugins/cache/opendatahub-skills/aiops-skills/0.1.0
uv run --script scripts/generate_onboarding_yaml.py \
  --output "$WORKDIR/component_onboarding_details.yaml" \
  --product-context "ODH" \
  --component-name "<konflux-name>" \
  --repo-url "https://github.com/opendatahub-io/odh-dashboard" \
  --repo-branch "main" \
  --context-path "./" \
  --dockerfile-path "<path>" \
  --build-type "CI" \
  [--is-operator --operator-manifest-src-path "..." --operator-manifest-dest-path "..."]
```

Validate against schema:
```bash
uv run --script scripts/validate_yaml_schema.py \
  "$WORKDIR/component_onboarding_details.yaml" \
  schemas/component_onboarding_details.schema.json
```

### Step 3b: Generate RHOAI YAML

| Field | Value |
|-------|-------|
| `product_context` | `RHOAI` |
| `component_name` | Konflux name from Q2 |
| `repo_url` | `https://github.com/red-hat-data-services/odh-dashboard` |
| `repo_branch` | Auto-derived in Q6 |
| `target_rhoai_version` | From Q6 |
| `architectures` | From Q7 |
| `release_category` | From Q8 |
| `dockerfile_path` | `Dockerfile.konflux.<name>` |

```bash
uv run --script scripts/generate_onboarding_yaml.py \
  --output "$WORKDIR/component_onboarding_details_rhoai.yaml" \
  --product-context "RHOAI" \
  --component-name "<konflux-name>" \
  --repo-url "https://github.com/red-hat-data-services/odh-dashboard" \
  --repo-branch "<derived-branch>" \
  --context-path "./" \
  --dockerfile-path "Dockerfile.konflux.<name>" \
  --target-rhoai-version "<version>" \
  --architectures "<arch1,arch2,...>" \
  --release-category "<category>" \
  --long-description "<desc>" \
  --short-description "<desc>" \
  [--is-operator --operator-manifest-src-path "..." --operator-manifest-dest-path "..."]
```

### Step 3c: Dockerfile Digest Check (RHOAI only)

Skip for ODH. For RHOAI, verify all `FROM` instructions use `@sha256:` digests:

```bash
uv run --script scripts/check_dockerfile_digests.py \
  --dockerfile-url "<raw-github-url>"
```

If the downstream branch doesn't exist yet (HTTP 404), verify digests locally against the Dockerfile content from Phase 4 or an existing PR.

### Step 3d: Attach to Jira

Ask user for the Jira issue key and parent feature ID (if not already known).

Using mcp-atlassian MCP tools (if `JIRA_USER_EMAIL`/`JIRA_API_TOKEN` not set):
1. `jira_update_issue` — attach the YAML file and add `yaml-attached` label
2. `jira_create_issue_link` — link to parent feature with "Related" link type
3. `jira_add_comment` — post a summary comment with component details

Name files distinctly: `component_onboarding_details.yaml` (ODH) and `component_onboarding_details_rhoai.yaml` (RHOAI).

### Step 3e: Post-Attachment Flow

After attaching:
1. **DevOps GitLab CI** picks up YAML attachments every ~2 hours
2. Automated PRs are raised for Konflux component registration, release pipelines, Quay repos
3. PRs require human review and merge
4. This phase covers: Quay repo creation, Konflux component registration, release pipeline config, Renovate/automerge setup

### Jira Progress Update

If a tracking epic is linked, post comments to:
- Subtask +2 (Quay/Konflux): "DevOps onboarding YAML submitted for <ODH/RHOAI>. Waiting for GitLab CI processing (~2-4 hours)."
- Subtask +4 (Tekton/CI): "DevOps CI configuration submitted via onboarding YAML."
- Subtask +8 (Downstream): "Downstream onboarding YAML submitted. DevOps will configure Renovate/automerge."

## Phase 4: RHOAI Downstream Dockerfile

**Goal**: Generate a downstream Dockerfile for the RHOAI build.

Skip if: `--skip-downstream` flag.

Generate `Dockerfile.konflux.<name>` content for the `red-hat-data-services/odh-dashboard` repo root.

### Type A

Based on the upstream `Dockerfile.workspace`, generate a downstream variant with:
- SHA-pinned base images (use `skopeo inspect` to get current digests, or use placeholder `@sha256:<digest>`)
- Red Hat labels on the final stage
- Same FIPS flags as upstream (already uses `CGO_ENABLED=1 -tags strictfipsruntime`)

See [references/dockerfile-templates.md](references/dockerfile-templates.md) § Downstream Type A.

### Type B

Generate from the upstream Dockerfile with these changes:
- Builder: `registry.redhat.io/ubi9/go-toolset:<version>@sha256:<digest>` (not Docker Hub `golang:`)
- Add `USER root` after FROM in builder stage (go-toolset runs non-root by default)
- Build flags: `CGO_ENABLED=1 GOOS=linux go build -a -ldflags="-s -w" -tags strictfipsruntime`
- Runtime: `registry.access.redhat.com/ubi9/ubi-minimal@sha256:<digest>` (SHA-pinned)
- Red Hat labels on final stage:

  ```dockerfile
  LABEL com.redhat.component="odh-<name>-container" \
        name="managed-open-data-hub/odh-<name>-rhel9" \
        summary="ODH <Display Name>" \
        description="<Description> for Red Hat OpenShift AI" \
        io.k8s.display-name="ODH <Display Name>" \
        io.k8s.description="<Description> for Red Hat OpenShift AI" \
        io.openshift.tags="rhods,rhoai,odh,<name>"
  ```

See [references/dockerfile-templates.md](references/dockerfile-templates.md) § Downstream Type B.

### Pushing to the Downstream Repo

The downstream Dockerfile **must** be committed to the downstream repo (e.g. `red-hat-data-services/odh-dashboard`), **not** to the upstream repo (`opendatahub-io/odh-dashboard`).

1. **Identify the downstream remote.** Scan `git remote -v` for the downstream repo URL (e.g. `red-hat-data-services/odh-dashboard`). The remote name varies by checkout — it may be `origin`, `downstream`, or something else.

   ```bash
   DOWNSTREAM_REMOTE=$(git remote -v | grep 'red-hat-data-services/odh-dashboard' | head -1 | awk '{print $1}')
   if [ -z "$DOWNSTREAM_REMOTE" ]; then
     echo "ERROR: No remote found for red-hat-data-services/odh-dashboard"
     echo "Add it with: git remote add downstream git@github.com:red-hat-data-services/odh-dashboard.git"
     exit 1
   fi
   echo "Downstream remote: $DOWNSTREAM_REMOTE"
   ```

2. **Determine the target branch.** Use the `repo_branch` value from Phase 0 Q6 (e.g. `rhoai-3.5-ea.2`). Fetch and verify it exists:

   ```bash
   git fetch "$DOWNSTREAM_REMOTE" "$TARGET_BRANCH"
   ```

3. **Create a feature branch, add the Dockerfile, and push:**

   ```bash
   git checkout -b "<jira-key>-dockerfile-konflux" "$DOWNSTREAM_REMOTE/$TARGET_BRANCH"
   # Write Dockerfile.konflux.<name> at repo root
   git add "Dockerfile.konflux.<name>"
   git commit -m "<JIRA-KEY>: Add Dockerfile.konflux.<name> for RHOAI Konflux builds"
   git push "$DOWNSTREAM_REMOTE" "<jira-key>-dockerfile-konflux"
   ```

4. **Create a PR against the downstream repo** targeting `$TARGET_BRANCH`:

   ```bash
   gh pr create \
     --repo red-hat-data-services/odh-dashboard \
     --base "$TARGET_BRANCH" \
     --head "<jira-key>-dockerfile-konflux" \
     --title "<JIRA-KEY>: Add Dockerfile.konflux.<name>" \
     --body "Adds the downstream Konflux Dockerfile for the <name> component.

   This Dockerfile uses SHA-pinned base images and FIPS-compliant build flags
   as required for RHOAI builds."
   ```

**Do NOT** write the Dockerfile to the upstream repo or create a PR against `opendatahub-io/odh-dashboard` — the downstream Dockerfile only exists in the downstream repo.

### Jira Progress Update

If a tracking epic is linked, post a comment to subtask +3 (Dockerfiles):

```
jira_add_comment(issue_key="<SUBTASK_3_KEY>", body="RHOAI downstream Dockerfile created: Dockerfile.konflux.<name>. PR: <pr-url>")
```

Also update subtask +8 (Downstream):

```
jira_add_comment(issue_key="<SUBTASK_8_KEY>", body="Downstream Dockerfile.konflux.<name> PR opened: <pr-url>")
```

## Phase 5: Manifest Overlay (Type A only)

**Goal**: Scaffold deployment manifests for a modular-arch package.

Skip if: Type B, or manifests already exist in `manifests/modular-architecture/modules/<name>/`.

For Type A packages, check if `manifests/modular-architecture/modules/<name>/` exists. If not, scaffold:
- Deployment overlay adding the module container
- Service port configuration
- Image parameter for Konflux/operator injection
- Kustomization.yaml entry

Reference existing module overlays in `manifests/modular-architecture/modules/` for the pattern.

### Jira Progress Update

If a tracking epic is linked, post a comment to subtask +6 (Manifests):

```
jira_add_comment(issue_key="<SUBTASK_6_KEY>", body="Manifest overlay <created/verified/N/A (Type B)>: manifests/modular-architecture/modules/<name>/")
```

## Phase 6: OpenShift CI

**Goal**: Configure OpenShift CI for the component in `openshift/release`.

**Prerequisite**: The component's Quay repository must have the `opendatahub+openshift_ci` robot account with **push** permission. Request this via `#rhoai-devtestops-request` Slack channel if not already configured.

### If Automated (Q9 = yes)

Requires `gh` CLI authenticated with a GitHub account that can fork `openshift/release`.

#### Step 1: Fork and clone

```bash
gh repo fork openshift/release --clone=false 2>/dev/null || true
GH_USER=$(gh api user --jq '.login')

WORK_DIR="/tmp/openshift-release-$(date +%s)"
gh repo clone "${GH_USER}/openshift-release" "$WORK_DIR" -- --depth=1
cd "$WORK_DIR"
git remote add upstream https://github.com/openshift/release.git
git fetch upstream master --depth=1
git checkout -b "add-${COMPONENT_NAME}-ci" upstream/master
```

#### Step 2: Read existing config

Read the existing CI config at:
```
ci-operator/config/opendatahub-io/odh-dashboard/opendatahub-io-odh-dashboard-main.yaml
```

#### Step 3: Add new entries

Insert the new component's entries following the existing pattern. Use the component type to determine the Dockerfile path and image name:

**Type A entries:**
```yaml
# In images.items — add after the last existing entry:
- context_dir: .
  dockerfile_path: ./packages/<name>/Dockerfile.workspace
  to: odh-mod-arch-<name>-image

# In tests — add PR mirror:
- as: odh-mod-arch-<name>-pr-image-mirror
  steps:
    dependencies:
      SOURCE_IMAGE_REF: odh-mod-arch-<name>-image
    env:
      IMAGE_REPO: odh-mod-arch-<name>
    workflow: opendatahub-io-ci-image-mirror

# In tests — add postsubmit mirror:
- as: odh-mod-arch-<name>-image-mirror
  postsubmit: true
  steps:
    dependencies:
      SOURCE_IMAGE_REF: odh-mod-arch-<name>-image
    env:
      IMAGE_REPO: odh-mod-arch-<name>
      RELEASE_VERSION: main
    workflow: opendatahub-io-ci-image-mirror
```

**Type B entries:**
```yaml
# In images.items:
- context_dir: .
  dockerfile_path: ./<name>/Dockerfile
  to: <name>-image

# In tests — PR mirror:
- as: <name>-pr-image-mirror
  steps:
    dependencies:
      SOURCE_IMAGE_REF: <name>-image
    env:
      IMAGE_REPO: <name>
    workflow: opendatahub-io-ci-image-mirror

# In tests — postsubmit mirror:
- as: <name>-image-mirror
  postsubmit: true
  steps:
    dependencies:
      SOURCE_IMAGE_REF: <name>-image
    env:
      IMAGE_REPO: <name>
      RELEASE_VERSION: main
    workflow: opendatahub-io-ci-image-mirror
```

#### Step 4: Commit and push

```bash
git add ci-operator/config/opendatahub-io/odh-dashboard/
git commit -m "Add CI config for <konflux-name> in odh-dashboard"
git push origin "add-${COMPONENT_NAME}-ci"
```

#### Step 5: Create PR

```bash
gh pr create \
  --repo openshift/release \
  --base master \
  --title "Add CI config for <konflux-name> in odh-dashboard" \
  --body "Adds image build and mirror configuration for the <name> component in opendatahub-io/odh-dashboard.

This adds:
- Image build definition (Dockerfile + context)
- PR image mirror test
- Postsubmit image mirror test

The Quay repository opendatahub+openshift_ci robot account must have push permission."
```

#### Step 6: Clean up

```bash
rm -rf "$WORK_DIR"
```

Report the PR URL to the user.

### If Manual (Q9 = no)

Provide the user with instructions:

```text
To add OpenShift CI for this component:
1. Ensure Quay repo has opendatahub+openshift_ci robot account with push permission
2. Fork openshift/release and edit:
   ci-operator/config/opendatahub-io/odh-dashboard/opendatahub-io-odh-dashboard-main.yaml
3. Add image build entry, PR mirror test, and postsubmit mirror test
4. Reference existing entries in the same file for the pattern
5. Submit a PR to openshift/release against the master branch
```

### Jira Progress Update

If a tracking epic is linked, post a comment to subtask +5 (OpenShift CI):

```
jira_add_comment(issue_key="<SUBTASK_5_KEY>", body="OpenShift CI: <PR created: <url> / instructions provided to user>")
```

## Phase 7: Operator Integration

**Goal**: Provide instructions and checklist for operator/controller integration.

This phase provides a structured checklist based on the requirements from RHOAIENG-31290. It applies to all components but is especially relevant for operators (Q4 = yes).

### Operator Integration Checklist

Present the following checklist to the user. For dashboard components that need operator integration, map against these requirements:

| Requirement | Dashboard Coverage | Action Required |
|-------------|-------------------|-----------------|
| QE repos for component | Covered — existing QE repos include dashboard testing | None |
| Prometheus monitoring | Covered — dashboard supports metrics endpoints | None |
| must-gather support | Covered — existing must-gather includes dashboard data | None |
| product-definitions entry | **Action Required** — add component to product-definitions repo | Open PR to product-definitions |
| Snyk scans | Covered — repo already scanned | None |
| Integration with RHOAI/ODH operator | **Required** — add image reference to operator | See PR steps below |
| AIPCC Integration | **Action Required** — add to AIPCC repo if applicable | Coordinate with AIPCC team |
| FIPS compliance | Covered — Dockerfiles use `strictfipsruntime` build tags | Verify in downstream Dockerfile |

### Operator PR Steps

To add the component image to the RHOAI/ODH operator:

1. **Add image to `imagesMap`** in `dashboard_support.go` (around line 50):
   ```go
   "<name>Image": "<name>-image",
   ```

2. **Configure parameter replacement** in `dashboard.go` (around line 42):
   ```go
   {
     InManifest: "<name>-image",
     Replace:    "<name>Image",
   },
   ```

3. **Reference PR**: [opendatahub-operator#3050](https://github.com/opendatahub-io/opendatahub-operator/pull/3050) for an example of this integration.

> **Note**: This step will change when the new dashboard-operator module controller takes over component lifecycle management. The controller-based approach will replace manual operator image registration with declarative module manifests.

### Jira Progress Update

If a tracking epic is linked, post a comment to subtask +7 (Operator Integration):

```
jira_add_comment(issue_key="<SUBTASK_7_KEY>", body="Operator integration checklist provided. Key actions: product-definitions PR, operator image registration, AIPCC coordination. See RHOAIENG-31290 requirements mapping.")
```

## Phase 8: Jira Updates

**Goal**: Update tracking Jira issues with onboarding progress.

Skip if: `--skip-jira` flag or no tracking epic linked.

### Summary Comment on Epic

Post a comprehensive summary comment on the tracking epic:

```markdown
## Konflux Onboarding Progress: <name>

### Component Details
- **Type**: A/B
- **Konflux name**: <odh-name>
- **Is operator**: yes/no

### Phase Status
| Phase | Status | Details |
|-------|--------|---------|
| ODH Dockerfile | ✅/⏭️ | <path or "skipped"> |
| Tekton Pipelines | ✅/⏭️ | <paths or "skipped"> |
| DevOps Request (ODH) | ✅/⏭️ | YAML attached to <jira-key> |
| DevOps Request (RHOAI) | ✅/⏭️ | YAML attached to <jira-key> |
| RHOAI Dockerfile | ✅/⏭️ | <path or "skipped"> |
| Manifest Overlay | ✅/⏭️/N/A | <path or "N/A for Type B"> |
| OpenShift CI | ✅/📋 | <PR url or "instructions provided"> |
| Operator Integration | 📋 | Checklist provided |

### Remaining Manual Steps
1. Review and merge DevOps-generated PRs (monitor Jira labels)
2. Review and merge Dockerfile.konflux PR in downstream repo
3. Complete operator integration PR
4. Verify first build succeeds end-to-end
```

### Individual Subtask Comments

If per-phase comments were not already posted (due to `--skip-jira` being removed after phases ran), post catch-up comments to each subtask with a summary of what was done.

## Phase 9: Verification Report

**Goal**: Summary of all work done and remaining steps.

Print a final report:

```text
## Konflux Onboarding Report: <name>

### Component Classification
- Type: A/B
- Component: <name>
- Konflux name: <odh-name>

### Completed
- [ ] ODH Dockerfile: <path> (created/already existed/skipped)
- [ ] Tekton push pipeline: <path> (created/already existed/skipped)
- [ ] Tekton PR pipeline: <path> (created/already existed/skipped)
- [ ] DevOps onboarding (ODH): requested/skipped
- [ ] DevOps onboarding (RHOAI): requested/skipped
- [ ] RHOAI Dockerfile: content generated/skipped
- [ ] Manifest overlay: created/already existed/skipped/N/A
- [ ] OpenShift CI: PR created/instructions provided/skipped
- [ ] Operator integration: checklist provided
- [ ] Jira updated: yes/skipped

### Files Created/Modified
- <list of files>

### Remaining Manual Steps
1. Review and merge Tekton pipeline PRs
2. Wait for DevOps GitLab CI to process onboarding request (~2-4 hours)
3. Review and merge DevOps-generated PRs (check Jira labels for progression)
4. Review and merge Dockerfile.konflux.<name> PR in the downstream repo
5. Submit/review OpenShift CI config PR to openshift/release
6. Complete operator integration — add image to operator, open product-definitions PR
7. Verify first build succeeds end-to-end (both ODH and RHOAI)
```
