# **RFE: Upstream-to-Downstream Development Flow Optimization**

## **PARENT EPIC: Improve Upstream-First Flow for Modular Architecture Modules**

**Summary**: Streamline and harden the upstream ➜ downstream development flow

**Description**: Optimize the development experience for teams working "upstream-first" (primarily in Kubeflow) while integrating downstream into the RHOAI dashboard monorepo. This initiative focuses on auditing the current flow, enhancing the `package-subtree.sh` sync tooling, defining issue/governance conventions, improving documentation and developer onboarding, and piloting the changes with an active modular architecture module.

This work targets modular architecture modules fetched from upstream and extended downstream (e.g., `packages/model-registry`). It builds on the guidance in `mod-arch-docs` and the current subtree-based sync approach, ensuring a consistent, low-friction workflow that is measurable and repeatable.

### Strategic Goals

- **Accelerate Upstream-First Delivery**: Reduce cycle time from upstream merge to downstream availability
- **Improve Reliability**: Decrease merge conflicts and downstream drift during subtree syncs
- **Increase Traceability**: Bi-directional linkage between upstream PRs/Issues and downstream Jira work
- **Standardize Extensions**: Codify downstream extension/override patterns with clear guardrails
- **Elevate Developer Experience**: Provide clear playbooks, templates, and automation for day-to-day tasks

### Scope

**In Scope**:

- Audit and map current end-to-end flow (upstream ➜ subtree sync ➜ downstream extensions)
- Tooling and automation improvements to `packages/app-config/scripts/package-subtree.sh`
- Issue linkage and governance conventions for upstream-first work
- Developer documentation, playbooks, and onboarding updates
- Pilot in `packages/model-registry` with measurable outcomes, then staged rollout

**Out of Scope**:

- Creating new feature functionality for modules (feature work remains in module roadmaps)
- Replacing upstream components or changing upstream community processes
- Broad platform-wide process changes beyond modular architecture modules

### Success Criteria

- Lead time from upstream commit to downstream PR reduced by 40%
- Subtree sync merge-conflict rate reduced by 50%
- 100% of downstream PRs referencing upstream PRs/Issues or release tags
- Adoption of new playbooks/templates across at least 3 modular modules
- Positive developer feedback (≥80% satisfied in post-pilot survey)

**Priority**: Major  
**Team**: RHOAI Dashboard (4158)  
**Labels**: enhancement, developer-experience, modular-architecture, upstream-first, automation  
**Components**: Dashboard

---

## **EPIC 1: Audit Current Flow & Value Stream Mapping**

**Summary**: Document the end-to-end upstream-first flow and establish a baseline

**Description**:

### Overview (Epic 1)

Analyze the current upstream ➜ downstream process used by modular architecture modules (e.g., Model Registry). Produce flow diagrams, identify friction points, capture baseline metrics (lead time, conflict frequency), and build a prioritized improvement backlog.

### Goals (Epic 1)

- Capture actual steps, actors, systems, and handoffs
- Baseline current performance and pain points
- Align on a shared view of the process across teams
- Produce a ranked improvement backlog

**Acceptance Criteria**:

- Flow diagrams and swimlanes covering upstream repo ➜ subtree sync ➜ downstream extensions ➜ release
- Baseline metrics gathered for at least one recent cycle (lead time, #conflicts, rework rate)
- Written report listing top 10 pain points with evidence
- Prioritized backlog of improvements agreed with module owners

**Priority**: Major  
**Labels**: research, process, developer-experience

### **Stories under Epic 1**

#### **Story 1.1**: Interviews and Survey with Active Module Teams

**Description**:

#### Description (Story 1.1)

Interview contributors from modules working upstream-first (starting with Model Registry) and run a short survey to capture friction points and desired improvements.

#### Acceptance Criteria (Story 1.1)

- Interview guide and 30-minute sessions scheduled with ≥5 developers/maintainers
- Survey created and distributed; ≥80% response rate within pilot team
- Consolidated notes with themes and quotes
- Findings summarized in the audit report

#### Additional info (Story 1.1)

- Reference: `mod-arch-docs/contributing.md`
- Modules: start with `packages/model-registry`

**Priority**: Major  
**Labels**: research, survey

---

#### **Story 1.2**: Create End-to-End Flow Diagram and Swimlanes

**Description**:

#### Description (Story 1.2)

Produce a sequence of diagrams showing upstream development, subtree sync, conflict resolution, downstream extension layering, and release steps.

#### Acceptance Criteria (Story 1.2)

- Mermaid or draw.io diagrams added to repo
- Swimlane diagram includes roles, tools, and artifacts
- Reviewed and signed off by module maintainers

#### Additional info (Story 1.2)

- Location: `docs/` or `mod-arch-docs/`
- Include references to subtree and extensions steps

**Priority**: Major  
**Labels**: documentation, process

---

#### **Story 1.3**: Baseline Metrics and Pain Points Report

**Description**:

#### Description (Story 1.3)

Collect data from recent syncs: elapsed time, # of commits applied, conflicts encountered, rework needed, and developer time spent.

#### Acceptance Criteria (Story 1.3)

- Metrics table added to the audit report
- At least two recent sync cycles analyzed
- Top 10 pain points listed with examples
- Backlog of improvements derived and ranked

#### Additional info (Story 1.3)

- Pull data from Git history and PRs
- Coordinate with module owners for time estimates

**Priority**: Major  
**Labels**: research, metrics

---

## **EPIC 2: Tooling & Automation for Upstream Sync (Subtree)**

**Summary**: Enhance `package-subtree.sh` and add CI to make syncs safer and faster

**Description**:

### Overview (Epic 2)

Augment the existing subtree sync script and surrounding automation to reduce conflicts, increase visibility, and shorten the path from upstream merges to downstream updates.

### Goals (Epic 2)

- Safer incremental updates with previews and clear diffs
- On-demand and scheduled automation that opens PRs
- Standardized branch and PR templates that link Jira and upstream
- Better conflict guidance and per-path merge strategies

### Technical Approach (Epic 2)

- Extend `packages/app-config/scripts/package-subtree.sh` with additional flags and reporting
- Provide a companion PR creation script and a GitHub Actions workflow
- Generate change summaries and a per-sync CHANGELOG
- Optional per-path merge strategies for known generated files

**Acceptance Criteria**:

- Dry-run and summary modes available
- Automated PRs created with templates and Jira links
- CHANGELOG generated from upstream commit range
- Scheduled and manual workflows available in CI
- Clear conflict guidance and (optional) per-path strategy hooks

**Priority**: Major  
**Labels**: automation, tooling, ci, developer-experience

### **Stories under Epic 2**

#### **Story 2.1**: Add `--dry-run` and Change Summary to Subtree Script

**Description**:

#### Description (Story 2.1)

Add a dry-run mode that fetches the upstream range, lists commits to apply, and prints a file-level diff summary without touching the working tree.

#### Acceptance Criteria (Story 2.1)

- `--dry-run` prints commit range, commit subjects, and file change counts
- No filesystem or git state changes in dry-run
- Exit codes suitable for CI gating
- Unit tests for summary parsing

#### Additional info (Story 2.1)

- File: `packages/app-config/scripts/package-subtree.sh`
- Consider `git diff --name-status` summaries

**Priority**: Major  
**Labels**: tooling, bash

---

#### **Story 2.2**: Generate Per-Sync CHANGELOG from Upstream Commits

**Description**:

#### Description (Story 2.2)

Create a CHANGELOG entry summarizing upstream commits applied in a sync, with links to upstream PRs/issues when available.

#### Acceptance Criteria (Story 2.2)

- CHANGELOG includes commit range and grouped subjects
- Links to upstream repo commits/PRs
- Added to PR body automatically
- Unit tests for formatting

#### Additional info (Story 2.2)

- Store under module package (e.g., `packages/model-registry/CHANGELOG.upstream.md`)
- Reuse commit messages from `git log`

**Priority**: Major  
**Labels**: documentation, automation

---

#### **Story 2.3**: Auto-create Downstream PRs with Templates and Jira Links

**Description**:

#### Description (Story 2.3)

Provide a script that, after a successful sync, opens a branch, stages changes, and creates a PR using a template that references the corresponding Jira Epic/Stories and upstream range.

#### Acceptance Criteria (Story 2.3)

- Branch naming convention: `subtree/<module>/<date>-<shortsha>`
- PR template includes Jira keys, upstream range, and CHANGELOG snippet
- Labels applied automatically (e.g., `upstream-sync`)
- Works locally and in CI via tokens

#### Additional info (Story 2.3)

- Include example PR template under `.github/PULL_REQUEST_TEMPLATE/`
- Document required environment variables for tokens

**Priority**: Major  
**Labels**: automation, workflow

---

#### **Story 2.4**: GitHub Actions Workflow for Scheduled and Manual Syncs

**Description**:

#### Description (Story 2.4)

Add a workflow that can run on a schedule and via "workflow_dispatch" to run dry-run, comment summaries on issues/PRs, and optionally open PRs.

#### Acceptance Criteria (Story 2.4)

- Cron schedule configured (e.g., daily)
- Manual dispatch with inputs: package name, commit, dry-run only
- Posts summary as PR comment or opens PR based on input
- Secrets managed and documented

#### Additional info (Story 2.4)

- Location: `.github/workflows/upstream-sync.yml`
- Use checkout with fetch-depth: 0

**Priority**: Major  
**Labels**: ci, automation

---

#### **Story 2.5**: Conflict Assistant and Per-Path Strategy Hooks

**Description**:

#### Description (Story 2.5)

Provide guidance and optional hooks for per-path merge strategies (e.g., prefer upstream for generated files, prefer downstream for extensions).

#### Acceptance Criteria (Story 2.5)

- Documented strategy hooks and examples
- Script option to apply strategy config (opt-in)
- Conflict assistant outputs next steps and common commands
- Unit tests for strategy selection logic

#### Additional info (Story 2.5)

- Document in `docs/upstream-sync-troubleshooting.md`
- Keep defaults conservative (no destructive auto-resolve)

**Priority**: Normal  
**Labels**: tooling, docs

---

#### **Story 2.6**: Hardening: Tests, Shellcheck, and Error Modes

**Description**:

#### Description (Story 2.6)

Add shellcheck linting, unit tests for key parsing/printing functions, and clear exit codes for user vs system errors.

#### Acceptance Criteria (Story 2.6)

- Shellcheck passes in CI
- Unit tests cover summary generation and argument parsing
- Error codes documented and used in CI
- Robust logging consistent with colored output

#### Additional info (Story 2.6)

- File: `packages/app-config/scripts/package-subtree.sh`
- Add CI job `scripts-ci.yml`

**Priority**: Normal  
**Labels**: quality, testing, ci

---

## **EPIC 3: Issue Linking & Governance for Upstream-First**

**Summary**: Establish conventions and light automation for Jira ⇄ GitHub

**Description**:

### Overview (Epic 3)

Create conventions to ensure every downstream Epic/Story references precise upstream artifacts (PRs, Issues, tags), and vice versa. Introduce RFC/ADR templates to capture cross-repo decisions and keep downstream extensions aligned with upstream evolution.

### Goals (Epic 3)

- Consistent metadata and linkage across systems
- Documented upstream-first checklist and DoD
- Lightweight automation to reduce manual steps

**Acceptance Criteria**:

- Templates and conventions adopted in active module
- PR checklist enforced in downstream
- Example links present in pilot PRs
- RFC/ADR docs created and referenced from code

**Priority**: Major  
**Labels**: governance, documentation, process

### **Stories under Epic 3**

#### **Story 3.1**: Define Labeling and Metadata Conventions

**Description**:

#### Description (Story 3.1)

Create a mapping of labels and fields to use across upstream GitHub and downstream Jira for upstream-first work.

#### Acceptance Criteria (Story 3.1)

- Label conventions documented (e.g., `upstream-first`, `module:<name>`)
- Jira custom fields or labels specified when applicable
- Example issues/PRs updated to follow the conventions

#### Additional info (Story 3.1)

- Document in `docs/upstream-first-conventions.md`
- Align with team’s Jira guidelines

**Priority**: Major  
**Labels**: governance, documentation

---

#### **Story 3.2**: Create PR and Issue Templates with Linking Sections

**Description**:

#### Description (Story 3.2)

Add templates that include required fields for upstream references (PRs, Issues, tags) and downstream Jira keys.

#### Acceptance Criteria (Story 3.2)

- `.github/ISSUE_TEMPLATE` and PR templates created/updated
- Templates include explicit Upstream Links and Downstream Jira Links sections
- Included in Story 2.3 auto-PR flow

#### Additional info (Story 3.2)

- Keep concise; rely on automation where possible
- Provide examples in templates

**Priority**: Major  
**Labels**: documentation, workflow

---

#### **Story 3.3**: RFC/ADR Template and Process

**Description**:

#### Description (Story 3.3)

Introduce a short RFC/ADR template to capture decisions impacting upstream/downstream boundaries and extension points.

#### Acceptance Criteria (Story 3.3)

- Template added under `docs/adr/` with numbering
- At least one ADR authored during pilot
- ADRs linked from code and PRs where applicable

#### Additional info (Story 3.3)

- Reference: `mod-arch-docs/contributing.md`
- Keep ADRs brief (1–2 pages)

**Priority**: Normal  
**Labels**: governance, documentation

---

#### **Story 3.4**: Upstream-First Definition of Done and Checklist

**Description**:

#### Description (Story 3.4)

Define a DoD for upstream-first work to ensure changes are opened upstream, reviewed, merged, and then synced downstream with clear traceability.

#### Acceptance Criteria (Story 3.4)

- DoD document created and shared
- Checklist integrated into PR template and CI checks
- Adopted in pilot module PRs

#### Additional info (Story 3.4)

- Align with `docs/definition-of-done.md`
- Keep CI checks non-blocking initially

**Priority**: Normal  
**Labels**: governance, process

---

## **EPIC 4: Developer Experience & Documentation**

**Summary**: Playbooks, onboarding, extension patterns, and troubleshooting

**Description**:

### Overview (Epic 4)

Provide concise developer-facing guides that make upstream-first development predictable and simple. Document extension patterns to layer downstream behavior over upstream code safely.

### Goals (Epic 4)

- Playbook for day-to-day upstream-first work
- Extension override/augmentation guidelines
- Troubleshooting for subtree conflicts and divergence
- Quick onboarding for new contributors

**Acceptance Criteria**:

- New guides published and cross-linked in repo
- Examples included from active modules
- Positive feedback in developer survey (≥80% satisfied)

**Priority**: Normal  
**Labels**: documentation, developer-experience

### **Stories under Epic 4**

#### **Story 4.1**: Upstream-First Developer Playbook

**Description**:

#### Description (Story 4.1)

Write a step-by-step playbook showing how to develop upstream, sync downstream via subtree, and apply extensions.

#### Acceptance Criteria (Story 4.1)

- Playbook includes commands, checkpoints, and rollback steps
- References PR/Issue templates and CHANGELOG flow
- Reviewed by at least two active maintainers

#### Additional info (Story 4.1)

- Location: `docs/upstream-first-playbook.md`
- Include Model Registry examples

**Priority**: Normal  
**Labels**: documentation, onboarding

---

#### **Story 4.2**: Extension and Override Guidelines with Examples

**Description**:

#### Description (Story 4.2)

Document how downstream extensions augment upstream code (e.g., via extension points, module federation, or plugin patterns) while minimizing long-lived forks.

#### Acceptance Criteria (Story 4.2)

- Clear examples showing allowed overrides and anti-patterns
- Guidance on keeping extension surfaces stable across syncs
- Linked from `docs/extensibility.md`

#### Additional info (Story 4.2)

- Align with `docs/module-federation.md` and `docs/extensibility.md`
- Provide code snippets

**Priority**: Normal  
**Labels**: documentation, extensibility

---

#### **Story 4.3**: Troubleshooting Guide for Subtree Syncs

**Description**:

#### Description (Story 4.3)

Create a compact guide for common sync failures, conflicts, and divergence scenarios with resolutions.

#### Acceptance Criteria (Story 4.3)

- Sections for conflict types, file strategy suggestions, and recovery
- Cross-referenced from Story 2.5 Conflict Assistant output
- Includes examples from pilot incidents

#### Additional info (Story 4.3)

- Location: `docs/upstream-sync-troubleshooting.md`
- Keep concise and action-oriented

**Priority**: Normal  
**Labels**: documentation, troubleshooting

---

#### **Story 4.4**: Quickstart and Onboarding for New Contributors

**Description**:

#### Description (Story 4.4)

Provide a short quickstart targeted at new developers working on modular modules downstream.

#### Acceptance Criteria (Story 4.4)

- Covers environment setup, running syncs, opening PRs
- Links to playbook, templates, and troubleshooting
- Validated by a new contributor during pilot

#### Additional info (Story 4.4)

- Location: `docs/upstream-first-quickstart.md`
- Include copy-pasteable commands

**Priority**: Minor  
**Labels**: documentation, onboarding

---

## **EPIC 5: Pilot and Rollout**

**Summary**: Pilot improvements in Model Registry, then stage rollout

**Description**:

### Overview (Epic 5)

Validate the improvements end-to-end in `packages/model-registry`. Measure outcomes, iterate, and then propose a staged rollout plan to additional modules.

### Goals (Epic 5)

- Demonstrate measurable improvements in a real module
- Gather feedback, iterate, and de-risk broader rollout
- Create a replicable adoption playbook

**Acceptance Criteria**:

- Pilot completed in Model Registry with before/after metrics
- Post-pilot survey shows ≥80% satisfaction
- Rollout plan drafted with candidate modules and timeline
- Final report shared with stakeholders

**Priority**: Normal  
**Labels**: pilot, rollout, metrics

### **Stories under Epic 5**

#### **Story 5.1**: Define Pilot Scope and Success Metrics

**Description**:

#### Description (Story 5.1)

Select specific upstream commits/range and downstream PRs for the pilot. Define concrete metrics and success thresholds.

#### Acceptance Criteria (Story 5.1)

- Pilot scope doc created (commits, dates, owners)
- Metrics and targets agreed with maintainers
- Risks and mitigations listed

#### Additional info (Story 5.1)

- Module: `packages/model-registry`
- Coordinate with release cadence

**Priority**: Normal  
**Labels**: planning, pilot

---

#### **Story 5.2**: Execute Pilot with Enhanced Tooling and Guides

**Description**:

#### Description (Story 5.2)

Run the improved subtree sync flow using new scripts/templates, resolve issues, and collect data.

#### Acceptance Criteria (Story 5.2)

- Sync completed using `--dry-run`, CHANGELOG, and auto-PR flow
- Conflicts resolved using documented strategies
- Times and outcomes recorded

#### Additional info (Story 5.2)

- Use GitHub Actions workflow from Story 2.4 where possible
- Keep detailed notes for report

**Priority**: Normal  
**Labels**: execution, pilot

---

#### **Story 5.3**: Measure Outcomes and Iterate

**Description**:

#### Description (Story 5.3)

Compare pilot metrics to baseline, identify gaps, and make targeted adjustments to tooling or docs.

#### Acceptance Criteria (Story 5.3)

- Before/after metrics table produced
- Top 3 follow-up improvements created as Stories
- Stakeholder review completed

#### Additional info (Story 5.3)

- Update guides and scripts based on findings
- Feed follow-ups into backlog

**Priority**: Normal  
**Labels**: metrics, iteration

---

#### **Story 5.4**: Staged Rollout Plan to Additional Modules

**Description**:

#### Description (Story 5.4)

Create a plan to adopt the improved flow in 1–2 additional modules, with owners and timeline.

#### Acceptance Criteria (Story 5.4)

- Candidate modules selected and contacted
- Adoption checklist and timeline defined
- Risks and dependencies documented

#### Additional info (Story 5.4)

- Consider modules with active upstream work
- Align with release windows

**Priority**: Minor  
**Labels**: rollout, planning

---

#### **Story 5.5**: Final Report and Handover

**Description**:

#### Description (Story 5.5)

Publish a concise report summarizing outcomes, artifacts, and the ongoing maintenance plan.

#### Acceptance Criteria (Story 5.5)

- Report shared with links to scripts, workflows, docs, and PRs
- Ownership documented for continued maintenance
- Retrospective notes and lessons learned included

#### Additional info (Story 5.5)

- Store under `docs/` and announce in team channels
- Use same metrics format for future comparisons

**Priority**: Minor  
**Labels**: documentation, handover

---

## **Summary**

This RFE provides a comprehensive plan to improve the upstream ➜ downstream development flow for modular architecture modules. The work is organized into 5 Epics with 21 total Stories:

- **Epic 1** (Audit & Mapping): 3 Stories  
- **Epic 2** (Tooling & Automation): 6 Stories  
- **Epic 3** (Issue Linking & Governance): 4 Stories  
- **Epic 4** (Developer Experience & Docs): 4 Stories  
- **Epic 5** (Pilot & Rollout): 5 Stories

The implementation leverages existing practices (`mod-arch-docs`), improves the subtree sync pipeline (`packages/app-config/scripts/package-subtree.sh`), and codifies upstream-first conventions with measurable outcomes. All Stories include acceptance criteria and references to relevant parts of the codebase.

**Estimated Timeline**: 3–5 months with 2–3 developers (pilot in Month 1–2; staged rollout in Month 3–5)
