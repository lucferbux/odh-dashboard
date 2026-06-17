# DevOps Integration Guide

How the Dashboard Konflux onboarding skill integrates with the DevOps `create-component-onboarding-jira` AI skill for Konflux setup.

## Overview

The DevOps team provides a Claude Code plugin (`create-component-onboarding-jira`) that automates Konflux infrastructure provisioning. It generates a `component_onboarding_details.yaml` validated against a JSON Schema, attaches it to a Jira ticket, and DevOps GitLab CI processes it.

**Two separate runs are required** — one for ODH and one for RHOAI — because each product context has different schema requirements and targets different repos/build pipelines. When no Jira URL is provided, the skill automatically clones a product-specific template (ODH: `RHOAIENG-35683`, RHOAI: `RHOAIENG-17225`) to create a new ticket.

## What DevOps Automates

The DevOps skill handles these items (roughly mapping to RHOAIENG-37060 subtasks):

| Step | Description | Related Subtask |
|------|-------------|-----------------|
| Quay repository creation | Creates the downstream Quay.io repo for built images | RHOAIENG-37062 |
| Konflux component registration | Registers the component in the downstream Konflux tenant | RHOAIENG-37062 |
| Konflux release configuration | Sets up ReleasePlanAdmission, release pipeline, advisory config | RHOAIENG-37064 |
| CI integration | Configures PipelinesAsCode triggers in the downstream repo | RHOAIENG-37064 |
| Renovate / automerge | Sets up automated dependency updates (image digest pinning) | RHOAIENG-37068 |
| GitOps changes | Updates deployment manifests in GitOps repos | RHOAIENG-37068 |

## What Dashboard Handles (Not DevOps)

| Step | Description | Related Subtask |
|------|-------------|-----------------|
| ODH upstream Dockerfile | `Dockerfile.workspace` or `<name>/Dockerfile` | RHOAIENG-37063 |
| ODH Tekton pipelines | `.tekton/` pipeline YAML files | RHOAIENG-37064 (upstream only) |
| RHOAI downstream Dockerfile | `Dockerfile.konflux.<name>` with FIPS/labels | RHOAIENG-37063, 37068 |
| Manifest overlays | `manifests/modular-architecture/modules/<name>/` (Type A only) | RHOAIENG-37066 |
| OpenShift CI config | `openshift/release` repo configuration | RHOAIENG-37065 |
| Operator integration | OLM bundle / ODH operator references | RHOAIENG-37067 |

## Using the DevOps Skill

### Installation

The skill is a Claude Code plugin from `opendatahub-io/aiops-infra`:

```text
/plugin install aiops-skills@opendatahub-skills:0.1.0
```

Verify installation:

```text
/skills
```
Look for `create-component-onboarding-jira` in the list.

### Prerequisites

The skill's Python scripts need:
- `uv` in PATH
- `jq` in PATH
- `JIRA_USER_EMAIL` — Atlassian account email
- `JIRA_API_TOKEN` — Atlassian Cloud API token

Scripts live at: `~/.claude/plugins/cache/opendatahub-skills/aiops-skills/0.1.0/`

**Important**: Claude Code shell state does not persist between Bash calls. You must export `JIRA_USER_EMAIL` and `JIRA_API_TOKEN` in every Bash invocation that calls the Python scripts. The skill handles this internally, but if running scripts manually, prefix each command:
```bash
JIRA_USER_EMAIL='you@redhat.com' JIRA_API_TOKEN='your-token' uv run --script scripts/...
```

### MCP Fallback (when env vars are not set)

If `JIRA_USER_EMAIL` or `JIRA_API_TOKEN` are not set, the YAML generation and validation scripts still work (they don't need Jira credentials), but the Jira attachment/update scripts will fail. In this case:

1. Generate YAML: `uv run --script scripts/generate_onboarding_yaml.py ...`
2. Validate: `uv run --script scripts/validate_yaml_schema.py ...`
3. Use mcp-atlassian MCP tools for Jira operations:
   - `jira_update_issue` — attach YAML and add labels
   - `jira_create_issue_link` — link to parent feature
   - `jira_add_comment` — post summary comment

## Running the Skill

### Invocation

```text
# Recommended: no URL — auto-creates a Jira from the product template
/create-component-onboarding-jira

# With an existing Jira — attaches YAML directly
/create-component-onboarding-jira https://redhat.atlassian.net/browse/RHOAIENG-1234
```

### Typical Workflow

Run the skill **twice** per component — once for ODH, once for RHOAI:

1. **Run 1 (ODH)**: Creates a ticket from template `RHOAIENG-35683`, targets the upstream `opendatahub-io` repo
2. **Run 2 (RHOAI)**: Creates a ticket from template `RHOAIENG-17225`, targets the downstream `red-hat-data-services` repo

Both tickets should link to the same parent feature (e.g. `RHOAIENG-60566`).

### Example: ODH Run (typical non-operator component)

```text
Q1  Product:          ODH
Q2  Build type:       CI
Q3  Component name:   odh-new-module
Q4  Repo URL:         https://github.com/opendatahub-io/odh-dashboard
Q5  Branch:           main
Q6  Context path:     ./
Q7  Dockerfile path:  ./packages/new-module/Dockerfile.workspace
Q8  Operator:         no
                      # Most dashboard components are NOT operators.
                      # Only dashboard-operator itself answers "yes" here.
```

Generated YAML:
```yaml
inputs:
  product_context: ODH
  component_name: odh-new-module
  repo_url: https://github.com/opendatahub-io/odh-dashboard
  repo_branch: main
  context_path: ./
  dockerfile_path: ./packages/new-module/Dockerfile.workspace
  build_type: CI
  is_operator: false
  # operator_manifest_src_path and operator_manifest_dest_path are
  # omitted when is_operator is false (most components).
```

### Example: RHOAI Run (typical non-operator component)

```text
Q1  Product:          RHOAI
Q2a Target version:   3.5-ea-2       → canonical: 3.5-ea-2
Q2b Architectures:    x86_64, arm64, ppc64le, s390x
Q3  Component name:   odh-new-module
Q3.5 Release category: Generally Available
Q4  Repo URL:         https://github.com/red-hat-data-services/odh-dashboard
Q4.5 Descriptions:    (auto-suggested from README, confirm or edit)
Q5  Branch:           (auto-derived) → rhoai-3.5-ea.2
Q6  Context path:     ./
Q7  Dockerfile path:  Dockerfile.konflux.new-module
                      # RHOAI Dockerfiles must start with "Dockerfile.konflux"
Q8  Operator:         no
                      # Most dashboard components are NOT operators.
                      # Only dashboard-operator itself answers "yes" here.
```

Generated YAML:
```yaml
inputs:
  product_context: RHOAI
  component_name: odh-new-module
  repo_url: https://github.com/red-hat-data-services/odh-dashboard
  repo_branch: rhoai-3.5-ea.2
  context_path: ./
  dockerfile_path: Dockerfile.konflux.new-module
  architectures:
    - x86_64
    - arm64
    - ppc64le
    - s390x
  target_rhoai_version: 3.5-ea-2
  release_category: "Generally Available"
  long_description: >-
    The New Module provides ... (auto-suggested from README).
  short_description: New Module
  is_operator: false
  # operator_manifest_src_path and operator_manifest_dest_path are
  # omitted when is_operator is false (most components).
```

> **Operator components**: If the component IS an operator (e.g. `dashboard-operator`),
> answer Q8 with "yes". The skill will then ask two additional questions:
> - Q9a: Manifest source path (e.g. `./manifests`)
> - Q9b: Manifest destination path (e.g. `odh-dashboard-operator`)

## Q&A Flow Reference

The skill asks questions sequentially. Each product context has different required fields.

### Common Fields (both ODH and RHOAI)

| # | Question | Field | Validation |
|---|----------|-------|------------|
| Q1 | Which product? (ODH/RHOAI) | `product_context` | `ODH` or `RHOAI` |
| Q3 | Component name? | `component_name` | Regex: `^odh-[a-z0-9]+(-[a-z0-9]+)*$` |
| Q4 | GitHub repo URL? | `repo_url` | Regex: `^https://github\.com/.+/.+$`, must return HTTP 200 |
| Q6 | Docker build context path? | `context_path` | Non-empty, default `./` |
| Q7 | Dockerfile path? | `dockerfile_path` | Non-empty |
| Q8 | Is this an operator? (yes/no) | `is_operator` | Boolean — almost always `no` for dashboard components |
| Q9a | Manifest source path? (if operator) | `operator_manifest_src_path` | Non-empty — only asked when Q8=yes |
| Q9b | Manifest dest path? (if operator) | `operator_manifest_dest_path` | Non-empty — only asked when Q8=yes |

### ODH-Only Fields

| # | Question | Field | Validation |
|---|----------|-------|------------|
| Q2 | CI or Release build? | `build_type` | `CI` or `Release` |
| Q2.5 | Version tag? (Release only) | `odh_release_tag` | Non-empty |
| Q5 | Branch to build? | `repo_branch` | Non-empty, default `main` |

### RHOAI-Only Fields

| # | Question | Field | Validation |
|---|----------|-------|------------|
| Q2a | Target RHOAI version? | `target_rhoai_version` | Regex: `^\d+\.\d+(?:\.0)?(?:-ea[-.]?\d+)?$` |
| Q2b | CPU architectures? | `architectures` | Subset of `[x86_64, arm64, ppc64le, s390x]` |
| Q3.5 | Release category? | `release_category` | `Generally Available`, `Tech Preview`, or `Beta` |
| Q4.5a | Long description? | `long_description` | Non-empty, auto-suggested from README |
| Q4.5b | Short description? | `short_description` | Non-empty, auto-suggested from long_description |
| Q5 | Branch (auto-derived) | `repo_branch` | NOT asked — derived from version |
| Q7 | Dockerfile path? | `dockerfile_path` | Basename must start with `Dockerfile.konflux` |

### Key Differences Between Runs

| Aspect | ODH Run | RHOAI Run |
|--------|---------|-----------|
| Template cloned | `RHOAIENG-35683` | `RHOAIENG-17225` |
| Repo | `opendatahub-io/odh-dashboard` | `red-hat-data-services/odh-dashboard` |
| Branch | `main` (user-specified) | Auto-derived from version (e.g. `rhoai-3.5-ea.2`) |
| Dockerfile naming | Free-form (e.g. `./packages/<name>/Dockerfile.workspace`) | Must start with `Dockerfile.konflux` |
| Digest pinning | Not required | All `FROM` images must use `@sha256:` |
| Extra fields | `build_type` | `architectures`, `target_rhoai_version`, `release_category`, descriptions |

### RHOAI Branch Auto-Derivation

The `repo_branch` for RHOAI is derived from `target_rhoai_version` — do NOT ask the user:
- `3.5` → `rhoai-3.5`
- `3.5-ea-2` → `rhoai-3.5-ea.2`

### RHOAI Version Canonical Form

Input is normalized:
- `3.4`, `3.4.0` → `3.4`
- `3.4-ea2`, `3.4-ea-2`, `3.4-ea.2`, `3.4.0-ea2` → `3.4-ea-2`

## Schema Validation

The YAML is validated against `schemas/component_onboarding_details.schema.json`. Key rules:

- `inputs` wrapper is required
- ODH requires: `build_type`
- RHOAI requires: `target_rhoai_version`, `architectures`, `release_category`, `long_description`, `short_description`
- `component_name` must match `^odh-[a-z0-9]+(-[a-z0-9]+)*$`
- `repo_url` must match `^https://github\.com/.+/.+$`
- Conditional validation via `allOf`/`if`/`then` blocks

## Dockerfile Digest Check (RHOAI only)

RHOAI Dockerfiles must pin all `FROM` instructions with `@sha256:` digests:

```bash
uv run --script scripts/check_dockerfile_digests.py \
  --dockerfile-url "<raw-github-url>"
```

The skill constructs the raw URL automatically from `repo_url`, `repo_branch`, `context_path`, and `dockerfile_path`. The Dockerfile must already exist on the target branch before the RHOAI run — push it first (see Phase 4 in SKILL.md).

If the downstream branch doesn't exist yet (HTTP 404), verify digests locally:
```bash
grep "^FROM " <dockerfile-path>
# All FROM lines must contain @sha256:
```

## Automated Flow After Attachment

After the YAML is attached to a Jira ticket:

1. **DevOps GitLab CI picks it up** — scheduled job runs every ~2 hours
2. **Automated PRs are raised** for:
   - Konflux component registration
   - Release pipeline configuration
   - Quay repository setup
   - PipelinesAsCode triggers
3. **Human review required** — each PR needs manual review and merge
4. **Verification** — after PRs merge:
   - Quay repo exists and is accessible
   - Konflux component appears in the tenant
   - A test push triggers a build

## Label Progression

DevOps automation tracks progress via Jira labels. These are added automatically by CI as each step completes:

| Label | Meaning | Added by |
|-------|---------|----------|
| `yaml-attached` | Onboarding YAML attached to ticket | `/create-component-onboarding-jira` skill |
| `validation-successful` | YAML passes schema + Dockerfile digest validation | `/validate-component-onboarding-jira` skill |
| `component-onboarding` | GitLab CI picked up the request | DevOps automation |
| `onboarding-in-review` | PRs/MRs have been generated and are pending review | DevOps automation |
| `okc-pr-merged` | OKC (Konflux component registration) PR merged | DevOps automation |
| `tekton-pr-merged` | Tekton pipeline configuration PR merged | DevOps automation |
| `operator-pr-merged` | Operator-related PR merged (if applicable) | DevOps automation |
| `bundle-pr-merged` | OLM bundle PR merged (if applicable) | DevOps automation |
| `quay-mr-merged` | Quay repository MR merged | DevOps automation |
| `krd-mr-merged` | KRD (Konflux Release Definition) MR merged (RHOAI only) | DevOps automation |
| `component-onboarding-completed` | All onboarding steps finished | DevOps automation |

**Monitoring**: Check the Jira ticket labels to track which stage the onboarding has reached. If labels stop progressing after 4+ hours, check the GitLab CI pipeline logs.

## Monitoring Progress

1. Check if the YAML was committed to the onboarding repo
2. Watch for automated PRs (typically 2-4 hours after YAML commit)
3. Check Jira labels for progression (see table above)
4. Review and merge each PR as it appears
5. Verify end-to-end by pushing a small change to the downstream repo

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| DevOps skill not found | `/plugin install aiops-skills@opendatahub-skills:0.1.0` |
| `JIRA_USER_EMAIL`/`JIRA_API_TOKEN` not set | Export in each Bash call (shell state doesn't persist) or use MCP fallback |
| Jira scripts fail silently | Credentials must be exported in the same Bash invocation as the script |
| `check_prerequisites.sh` not found | Scripts are at the plugin root `~/.claude/plugins/cache/opendatahub-skills/aiops-skills/0.1.0/scripts/`, not in the skill subdirectory |
| GitLab CI didn't process YAML | Check GitLab CI pipeline status; may need manual trigger |
| PRs not appearing | Wait up to 4 hours; check GitLab CI logs for errors |
| Dockerfile digest check HTTP 404 | Branch or file doesn't exist yet; push the Dockerfile first, then re-run |
| Build fails after merge | Check Dockerfile path, service account permissions, Quay access |
| Image not pushed to Quay | Verify robot account has push permissions; check Konflux logs |
| Schema validation fails | Check conditional required fields per product context |
| GitHub MCP tools fail on downstream repo | MCP token may lack access to `red-hat-data-services`; use git CLI directly |
