---
name: planning
description: Create an ultra-detailed, repository-grounded implementation plan with file-by-file changes, coding guidance, acceptance criteria, and delegated validation. Use when asked to plan a feature, fix, refactor, or migration before implementation; save the plan as Markdown in the repository plans folder.
---

# Planning

Produce a plan that another agent can implement without rediscovering the design. Make it detailed through concrete decisions, verified source references, and observable outcomes rather than generic advice. Planning alone does not authorize implementation.

Read [references/plan-template.md](references/plan-template.md) before drafting. Use its structure and repeat file and task sections as needed. Mark irrelevant sections `Not applicable` with a brief reason. Replace all placeholders before delivering a completed plan.

## Investigate the actual repository

1. Identify the repository root and read applicable `AGENTS.md` instructions and relevant skills. Capture the current branch and working-tree changes so existing user work is protected.
2. If `.codegraph/` exists, use CodeGraph before searching or reading implementation code, following the project's local CLI rules. Do not initialize an index. Fall back to ordinary tools when no index exists or the tool is unavailable; record any investigation limitation. Re-read files explicitly reported stale.
3. Inspect the relevant implementation, callers, data flow, shared modules, tests, package scripts, and configuration. Distinguish files to change from files used only as references. Do not invent file paths, symbols, commands, or current behavior.
4. Read authoritative documentation for the installed framework version before prescribing its APIs. In this project, read relevant `node_modules/next/dist/docs/` documentation for Next.js work and `.agents/skills/payload/SKILL.md` for Payload work. Read relevant React performance or composition skills when applicable.
5. Record current behavior with paths, symbols, and useful line references. Explain the gap between current and required behavior, integration points, and the affected callers. Label facts, user requirements, inferred assumptions, and unresolved questions separately.

## Clarify uncertainties during planning

- Ask the user concise, self-contained questions when goals, behavior, design, constraints, or acceptance criteria are unclear and cannot be resolved from repository evidence. Bundle related questions and offer meaningful options where helpful.
- Use an available user-input tool; otherwise ask directly in the conversation. Continue investigation and independent plan sections while awaiting answers.
- Do not invent answers to required questions. Save the plan as `Draft - awaiting clarification` and identify dependent tasks if a blocking answer is pending. A draft is not ready for execution.
- For routine reversible choices, select the established project pattern and record the assumption. Do not add approval gates for choices the user has already authorized. Incorporate answers and later corrections into the same plan.

## Specify implementation in detail

Cover the goal, requirements, scope, current implementation, related files, proposed behavior, tasks, style, coding guide, coding standards, coding method, validation, testing, risks, and completion criteria.

For every file to change, specify:

- Exact repository-relative path and whether to create, edit, delete, or generate it.
- Existing symbols or sections and their current responsibility.
- The precise before/after behavior and the requirement or task it satisfies.
- Ordered edits to imports, types, functions, component state, JSX, styles, queries, hooks, or configuration as applicable.
- Required APIs and patterns, prohibited alternatives, and the reason for each consequential choice. Include focused pseudocode or an illustrative snippet when prose leaves ambiguity.
- Loading, empty, error, cleanup, race, authorization, localization, and accessibility behavior where relevant.
- Affected consumers and contracts, preserved behavior, and file-specific verification.

Do not dictate an API just because it appears in an example. For instance, prescribe `useEffect` only for a justified client synchronization requirement; use the documented server data-fetching pattern for server-rendered data. A file instruction should be as concrete as: "In `example.tsx`, synchronize the browser-only preview request in `useEffect` keyed by `itemId`; abort on cleanup and ignore stale responses; display explicit loading and failure states. Use `AbortController`; do not fetch during render." This is an illustrative example, not a default architecture or a claim that this file exists.

Create ordered task IDs with dependencies, exact file edits, and acceptance criteria. Keep implementation guidance consistent across shared modules and consumers. Choose the simplest existing pattern that satisfies the requirements; justify new abstractions or dependencies.

Document styling separately from coding conventions: UI layout, responsive behavior, typography, spacing, tokens, interaction states, and accessibility; then types, naming, imports, module boundaries, error handling, formatting, and comments. Ground all conventions in the repository. This project uses English only, regular hyphens, bun, and code comments of at most three lines. Relevant Payload schema changes must include type/import-map generation and the project-specific migration workflow without assuming permission to reset data.

## Require execution to follow the plan

Include this instruction prominently in every saved plan:

> Follow this plan strictly. Change only the files and behavior listed in scope. Preserve existing user changes. Do not perform unrelated cleanup, formatting, refactors, dependency upgrades, or configuration changes. If another change is necessary to satisfy a requirement or resolve a verified blocker, document the evidence, rationale, affected files, and validation impact in this plan before proceeding. Ask the user if the change alters the goal, materially expands scope, or leaves a required decision unresolved; otherwise continue within existing authorization. Keep the plan synchronized with necessary deviations and completed tasks. Follow higher-priority instructions and later user corrections.

Keep investigation references separate from the modification allowlist. List generated outputs and necessary tests in scope. Do not treat a plan as authorization to deploy, publish, commit, delete data, or run destructive commands.

## Delegate validation and testing

Every plan must include two explicit delegation checkpoints:

1. **Plan review before implementation:** A lower-cost subagent checks whether the plan is feasible, grounded in the supplied source, complete, and internally consistent; verifies requirement coverage, file boundaries, API choices, task order, and testing expectations. Run this review during planning when delegation is available and authorized. Address supported findings in the plan.
2. **Implementation validation before completion:** After implementation is authorized and complete, a lower-cost subagent reviews the actual diff against the plan, checks functional regressions and unintended changes, and runs appropriate checks and tests in a separate nonconflicting session. Record reproducible findings, exact commands, exit status, and evidence. The primary agent fixes confirmed issues and reruns only affected checks.

Prefer `gpt-6-luna` when supported by the active environment. Use a Sonnet variant only if it is actually exposed by the environment; do not invent model identifiers. Use a supported reliable lower-cost alternative when needed and record the choice. Honor tool constraints on model overrides and context inheritance. Give the subagent the plan, applicable instructions, acceptance criteria, relevant source or diff, permitted commands, and a read-only review scope except for test artifacts. The reviewer must not independently modify application code or disturb the user's work.

Keep delegation focused on validation and testing. The primary agent remains responsible for implementation decisions, findings, and completion. If delegation is unavailable or prohibited, explicitly record that limitation and perform available primary-agent checks without claiming independent validation. Do not enable a provider, install tools, or change configuration merely to obtain a model.

Select checks from real package scripts and existing test infrastructure. For each check, state its purpose, prerequisites, exact command and working directory, observable pass condition, owner, and whether it changes local state. Match tests to the change: exercise user-visible behavior, meaningful failure paths, and affected contracts. Do not add tests solely to mirror implementation or for reversible, low-impact edits without a justified regression risk. Distinguish planned checks from executed results, and record blocked or skipped checks with reasons.

## Save and hand off

- Save the plan to `<repository-root>/plans/YYYY-MM-DD-<task-slug>.md`. In this project `/plans` means `/home/tuantm/projects/tmcs/plans`, not the filesystem root. Create the directory if missing.
- Use a meaningful lowercase kebab-case task slug. Update the same file for the same active plan; avoid overwriting an unrelated plan and add a suffix for collisions.
- Record status, date, relevant source baseline, unresolved questions, decisions, and any necessary deviations. Use `Ready for implementation` only when required decisions are resolved. This status describes completeness and does not grant execution authorization.
- Verify the saved Markdown, requirement-to-task-to-check mapping, file paths, commands, and consistency of all API decisions. A draft may retain explicitly unresolved decisions but must not disguise them as implementation instructions.
- Return a clickable link to the saved plan with a brief statement of its status and any blocking questions. If the user requested planning only, finish after delivering the plan. If implementation was already requested, continue under that authorization once blocking questions are resolved.
