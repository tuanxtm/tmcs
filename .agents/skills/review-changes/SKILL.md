---
name: review-changes
description: Reviews every changed file for functional regressions, bugs, security issues, React and Next.js performance problems, and component composition risks before commit or merge. Use when reviewing all uncommitted, staged, or branch changes, or when the user invokes /review-changes.
disable-model-invocation: true
---

# Review Changes

Perform a complete, read-only review of the requested change set. Preserve the product's existing behavior unless the change explicitly changes it. Report only actionable findings introduced or exposed by the change.

## Required workflow

### 1. Establish the review scope

- For an explicit `/review-changes` invocation with no scope argument, review all uncommitted changes, including staged and unstaged changes.
- If the user names a base branch, commit, PR, range, files, or severity, use that scope.
- Include untracked files that are part of the change.
- Do not inspect or report unrelated working-tree changes.
- If no changes exist, say that no diff was found and stop.
- Do not modify, stage, commit, reset, or clean anything.

### 2. Understand the change

- Read the complete diff, not only individual changed lines.
- Read every changed file in full when practical.
- Read relevant callers, types, configuration, tests, and unchanged context needed to verify behavior.
- Summarize the intended behavior and affected data flow before judging implementation details.
- Identify assumptions that must remain true for the application to work.

### 3. Review every file

Review each changed file against every applicable category below. Record which files were checked even when they have no findings.

Prioritize findings in this order:

1. Security vulnerabilities and authorization bypasses
2. Data loss, corruption, broken core behavior, and non-trivial regressions
3. Edge cases, error handling, concurrency, and state bugs
4. Material performance regressions
5. Maintainability and composition issues that create meaningful risk

Do not let low-value style observations overshadow functional findings.

## Functional correctness

- Verify existing behavior remains intact and the requested behavior actually works.
- Check null, empty, loading, success, error, unauthorized, disabled, stale, and retry paths where relevant.
- Check control flow, state transitions, async behavior, timeouts, cancellation, cleanup, and ordering.
- Check type contracts, object shape, dates, locale-sensitive data, and boundary values.
- Check migrations, generated files, imports, exports, dependencies, scripts, and deployment configuration.
- Check tests for changed behavior and meaningful edge cases.
- Do not report a suspicion as a bug. Explain the concrete input, execution path, and impact.

## Security

- Check authentication and authorization in every public endpoint, Server Action, webhook, job, hook, and mutation path.
- Check Local API calls made on behalf of a user use `overrideAccess: false` and the correct `user`.
- Check trust boundaries, input validation, output encoding, mass assignment, IDOR, tenant isolation, and secret exposure.
- Check SQL or query construction, command execution, file access, path traversal, SSRF, open redirects, unsafe HTML, upload handling, and rate limiting.
- Check that errors and logs do not expose tokens, credentials, personal data, stack traces, or internal details.
- Check sensitive values do not reach clients, caches, analytics, URLs, or module-level state.
- Treat new execution of untrusted input, especially `eval`, dynamic code, raw HTML, or unvalidated file operations, as high risk.

## React and Next.js performance

Apply the Vercel React Best Practices skill to every applicable changed file. Check the highest-impact rules first:

- Independent async operations must run concurrently; avoid new sequential waterfalls.
- Start independent API-route or Server Action work early and await late.
- Avoid unnecessary server or client work, repeated database requests, duplicate serialization, and broad RSC props.
- Keep request-scoped data in the request or render tree. Do not introduce shared mutable module state.
- Authenticate and authorize Server Actions inside the action itself.
- Avoid client boundaries, barrel imports, eager heavy-library imports, and static work that do not need to be in the initial bundle.
- Do not use `useMemo` or `memo` for trivial work without a real cost. React Compiler may already handle some optimization.
- Check state derived from props, effect dependencies, stale closures, event-handler effects, and transient values.
- Check hydration boundaries, localStorage access, layout shifts, and hydration mismatches.
- Check hot-path loops, repeated lookups, repeated storage access, and avoidable object or array copies.

Read the relevant detailed rule under `vercel-react-best-practices/rules/` when the quick list is insufficient.

## Component composition

Apply the Vercel Composition Patterns skill to every applicable changed file. Look for:

- New boolean prop combinations that make impossible states or exponential conditionals.
- Components that need a compound-component or explicit variant structure.
- Shared state trapped inside a visual component instead of a provider with a clear contract.
- UI coupled to a specific state implementation rather than receiving `state`, `actions`, and `meta` through an interface.
- Render props or structural flags that would be clearer as children or composed subcomponents.
- New `forwardRef` or `useContext` usage in a React 19 codebase. Prefer React 19 ref-as-prop and `use()` conventions where applicable.
- Duplicated component logic that should be a small shared component, but do not request abstraction for one-off markup.

Suggest composition changes only when they reduce real state-space complexity, improve reuse, or prevent bugs. Keep the change minimal.

## Project invariants

Apply repository guidance in addition to general review rules. In particular:

- Do not allow an empty `PAYLOAD_SECRET` fallback.
- Preserve Admin, Manager, and Creator permission boundaries.
- Keep GraphQL disabled unless an explicit project decision changes it.
- Disallow SVG media uploads.
- Preserve D1/R2 and OpenNext deployment assumptions.
- Do not enable `jobs.autoRun` on Workers.
- After Payload schema changes, require generated Payload types and import map to be updated.
- Match project conventions and avoid unrelated cleanup.

## Performance standard

Performance findings must be material and evidence-based. Estimate or demonstrate the extra work, request, render, memory, or transfer cost when possible. Prefer safe optimizations that preserve behavior. If optimization adds caching, concurrency, client work, or semantic change, verify its invalidation, error handling, consistency, and access-control implications.

Do not recommend optimization for a hot path that is not hot, or trade correctness, accessibility, or security for an unmeasured micro-optimization.

## Finding quality

Every finding must include:

- A severity: `P0`, `P1`, `P2`, or `P3`
- A concise title
- The exact location as `file:line`
- The concrete failure mode or performance impact
- Why the current implementation causes it
- The smallest safe correction that preserves intended behavior

Severity definitions:

- `P0`: Exploitable security issue, destructive data loss, or complete outage requiring immediate action
- `P1`: Likely serious bug, authorization flaw, broken primary flow, or major performance regression
- `P2`: Real edge-case bug, reliability issue, or moderate performance regression that should be fixed
- `P3`: Low-risk maintainability, test, or performance improvement worth considering

## Output format

Start with one of:

- `No findings.`
- `Found N finding(s).`

Then provide findings sorted by severity, highest first, using this exact table structure:

| Severity | Location | Finding |
| --- | --- | --- |
| `P1` | `src/path/file.ts:42` | Concise issue, impact, and smallest safe correction |

After the table:

- List the files reviewed.
- Separate blocking findings from optional suggestions.
- State which checks or tests were run and their result.
- State any important validation that was not run.
- If no actionable findings exist, say `No bugs, security issues, functional regressions, material performance issues, or composition risks were found in the reviewed change set.`

Do not include speculative style comments, praise-only comments, unrelated pre-existing problems, or full-file code dumps.

## Completion checklist

- [ ] Reviewed the requested change set completely
- [ ] Read relevant surrounding code and contracts
- [ ] Checked every changed file for functional regressions
- [ ] Checked security and authorization boundaries
- [ ] Applied applicable React and Next.js performance rules
- [ ] Applied applicable component composition rules
- [ ] Verified tests, lint, or types when practical
- [ ] Kept all recommendations functional and minimal
- [ ] Reported only actionable findings with exact locations
