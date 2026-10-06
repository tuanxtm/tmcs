# <Task title>

- Status: <Draft - awaiting clarification | Ready for implementation | In progress | Complete>
- Date: <YYYY-MM-DD>
- Repository: <absolute root>
- Baseline: <branch and commit; relevant working-tree changes>
- Plan owner: <primary agent>
- Validation agent: <supported model, preferably gpt-6-luna; or limitation>

## Execution instructions

<Insert the strict plan-following instruction from SKILL.md.>

## 1. Goal and expected outcome

<Define the user problem, desired result, and observable success. Include a concrete before/after example.>

## 2. Requirements and acceptance criteria

| ID | Requirement | Source | Observable acceptance criterion | Task IDs | Validation IDs |
| --- | --- | --- | --- | --- | --- |
| R1 | <behavior or constraint> | <user or verified source> | <measurable result> | T1 | V1 |

<Include relevant functional, performance, accessibility, security, localization, compatibility, and data-integrity constraints. Explain exclusions.>

## 3. Scope and protected boundaries

- In scope: <features and permitted modifications>
- Out of scope: <explicitly excluded behavior and files>
- Existing user changes to preserve: <paths and relevant state>
- Modification allowlist: <all application, test, configuration, and generated-output paths to change>
- Necessary deviation policy: <evidence, plan update, and when clarification is required>

## 4. Current implementation

<Explain the present entry point, callers, data/control flow, state ownership, dependencies, and current tests. Cite inspected paths and symbols. Explain the actual gap or failure, not just the proposed solution.>

| Source path / symbol | Current responsibility and behavior | Evidence | Implication for this change |
| --- | --- | --- | --- |
| <path / symbol> | <verified behavior> | <source lines, docs, or observed result> | <necessary change or preserved contract> |

## 5. Clarifications, assumptions, and decisions

| ID | Question or decision | Evidence / answer / assumption | Status | Dependent tasks |
| --- | --- | --- | --- | --- |
| Q1 | <unclear behavior> | <user answer, or explicitly pending> | <resolved / assumed / blocking> | <IDs> |

<Separate known facts from assumptions. For material architectural choices, record the selected approach, rationale, and relevant rejected alternative.>

## 6. Proposed design and coding method

<Describe the resulting architecture, request and rendering flow, interfaces, state lifecycle, and integration order. Specify types and data contracts; error and cleanup behavior; relevant server/client boundaries, cache/invalidation, authorization, and migration sequencing. Cite version-specific docs actually read. Explain how existing helpers and patterns will be reused.>

## 7. Related files and exact changes

| Path | Role | Action | Task IDs | Reason |
| --- | --- | --- | --- | --- |
| <exact relative path> | <implementation / test / generated / reference> | <create / edit / delete / generate / read only> | <IDs> | <specific purpose> |

### File: `<exact relative path>`

- Action and current symbols: <operation and symbols/sections>
- Current behavior: <verified source behavior>
- Required behavior: <precise before/after result>
- Requirements/tasks: <IDs>

Ordered edits:

1. <Specific import, type, function, hook, JSX, CSS, schema, or configuration change and its purpose.>
2. <Exact integration or consumer update.>

Required approach:

- Use <specific existing helper, API, or documented pattern> because <reason>.
- Do not use <specific incompatible alternative> because <concrete conflict>.
- Edge cases and lifecycle: <loading/empty/error, cleanup, race, permissions, locale, accessibility as applicable>.
- Preserved contracts: <exports, props, response shape, styling, behavior that must remain stable>.

Illustrative implementation, if needed:

```tsx
// Replace with focused, task-specific pseudocode or a verified API example.
```

- File verification: <command or behavior check, expected result, validation ID>

<Repeat this file section for every modification. Reference-only files need a reason but no proposed edits.>

## 8. Style and interaction guidance

<For UI changes: existing components/tokens, layout, spacing, typography, colors, breakpoints, motion, focus, keyboard behavior, touch behavior, loading/empty/error states, and semantic/accessibility expectations. Cite reference UI or CSS. For non-UI work, mark not applicable with a reason.>

## 9. Coding guide and standards

- Applicable instructions/docs: <actual files and relevant requirements>
- Naming, imports, types, and exports: <existing conventions and concrete type contracts>
- Module boundaries and reuse: <helpers/components to reuse and ownership>
- Error handling, cleanup, and validation: <required patterns>
- Security and data access: <task-specific invariants>
- Performance: <justified fetching, rendering, caching, and bundle choices>
- Formatting and comments: <repository conventions>
- Dependencies and generated files: <justified additions or generation commands; no manual generated edits>

## 10. Ordered implementation tasks

### T1: <specific outcome>

- Depends on: <task IDs or none>
- Requirements: <IDs>
- Files: <exact paths>
- Steps: <ordered, executable changes referencing the file sections>
- Acceptance: <observable completion conditions>
- Validation: <IDs>
- Status: <pending / in progress / complete / blocked and reason>

<Repeat for remaining tasks, including necessary generation, migration, and validation work. Identify tasks that can run independently without conflicting writes or shared test state.>

## 11. Validation and testing

### Delegated checkpoints

- Plan review: <supported low-cost model; files/docs to inspect; feasibility, coverage, API, scope, and consistency checks; findings and disposition>
- Implementation review: <supported low-cost model; compare actual diff with this plan; review affected callers, regression risks, and unplanned edits; permitted test commands; evidence requirements>
- Isolation: <read-only application scope, allowed test artifacts, fixture/state constraints, no overlapping mutation or conflicting test runs>
- Fallback: <record any unavailable delegation/model, actual owner, and limitation>

### Check matrix

| ID | Requirement / risk | Owner / model | Prerequisites and working directory | Exact command or manual steps | Expected observable result | Local-state effects |
| --- | --- | --- | --- | --- | --- | --- |
| V1 | <R1 and regression risk> | <primary / subagent model> | <fixtures, environment, directory> | <verified project command> | <specific pass condition> | <none or stated effects> |

<Select appropriate formatting/static/type/build checks, existing unit/integration/end-to-end tests, and manual UI checks. Include relevant negative cases and regression cases. Explain why added tests are needed; do not create tests merely to assert implementation structure.>

### Actual validation results

| Check ID | Status | Command / steps actually executed | Exit status / evidence | Findings and follow-up |
| --- | --- | --- | --- | --- |
| <ID> | <planned / passed / failed / skipped / blocked> | <actual execution, if any> | <evidence, not an assumed pass> | <fix or remaining limitation> |

## 12. Risks, rollout, and recovery

<Describe material risks and mitigations; compatibility and migration implications; reversible recovery steps where relevant. Include deployment actions only if requested, and identify authorization dependencies for external or destructive actions. Otherwise mark rollout not applicable.>

## 13. Necessary deviations and change log

| Date | Evidence / blocker | Necessary change and affected files | Requirement / validation impact | User decision if required |
| --- | --- | --- | --- | --- |
| <date> | <verified reason> | <scope update> | <updated IDs/checks> | <answer or not required under existing scope> |

<Use "None" until a deviation occurs. Do not use this section to justify unrelated cleanup.>

## 14. Completion checklist and handoff

- [ ] Required questions resolved; remaining assumptions explicit.
- [ ] Every requirement maps to implementation tasks and meaningful checks.
- [ ] File edits and documented API choices are consistent and grounded in source.
- [ ] Plan-review findings resolved or clearly recorded.
- [ ] Authorized implementation tasks complete; user changes preserved.
- [ ] Implementation validation performed by the delegated agent, or limitation recorded.
- [ ] Relevant checks passed; skipped or blocked checks and residual risks disclosed.
- [ ] Final diff conforms to the scope and documented necessary deviations.
- [ ] Plan status and actual results updated; saved plan linked in handoff.

<During planning only, leave implementation and execution items unchecked. A plan must never claim unperformed work is complete.>
