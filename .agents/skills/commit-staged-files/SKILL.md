---
name: commit-staged-files
description: Stage changed files into focused commits and generate Conventional Commit subjects (≤120 chars). Use when the user asks to commit pending changes, break a mixed diff into smaller commits, draft commit messages, or wants per-file/per-area commits. Triggers on requests like "commit these changes", "split this into commits", "write commit messages", or "stage and commit individually".
---

# Commit Staged Files

Stage pending changes into small, focused commits and generate a Conventional Commit subject for each one. Subject line is **≤ 120 characters**, lowercase imperative, scoped to a single concern.

## When to use

- User says "commit this", "split into commits", "commit per file", "stage and commit individually", "write commit messages", or hands you a diff and asks for commits.
- Working tree has changes that should land as multiple logical commits instead of one big commit.

## When NOT to use

- Nothing changed (`git status --porcelain` is empty).
- User only wants a single commit - write one subject and stop.
- User asked for a PR, push, branch switch, or merge - do those separately.
- File path looks like a secret (`.env`, `*.pem`, credentials) - stop and ask the user.

## Conventions (this repo)

- Type prefixes used in history: `feat:`, `chore:`, `test:`, `fix:`, `refactor:`, `docs:`, `perf:`, `style:`, `build:`, `ci:`.
- Subject = `<type>(<optional scope>): <imperative summary>`.
- Scope is the area touched, e.g. `collections`, `blocks`, `feed`, `cms`, `proxy`, `seed`, `migrations`, `tests`, `skills`.
- Imperative mood, no trailing period, lowercase after the colon.
- Subject must fit in **≤ 120 characters**. Prefer ≤ 72; hard cap 120.
- Multi-line bodies are allowed but optional. Skip them unless the diff needs explanation.

## Workflow

```
Progress:
- [ ] Inspect repo state
- [ ] Group changes into focused commits
- [ ] For each group: stage, propose subject, commit
- [ ] Verify with git status + git log
```

### 1. Inspect repo state

Run these in parallel:

```bash
git status --porcelain
git diff --stat
git log -10 --pretty=format:"%s"
```

Read the recent log to match the project's voice (prefixes, scopes, tone).

If `git status --porcelain` is empty, report "nothing to commit" and stop.

### 2. Group changes into focused commits

Decide grouping yourself. A good group has **one clear concern**. Heuristics:

| Signal | Group together |
|---|---|
| Same top-level dir (`src/blocks/`, `src/collections/`, `tests/`) | Yes |
| Generated artifacts with their source (`importMap.js`, `payload-types.ts`) | Yes, commit with the source change |
| Lockfile for added dependency | Yes, with the `package.json` change |
| Migration files | Yes, one commit per migration unless trivial |
| Unrelated fixes mixed in | Split into a separate commit |
| New file + unrelated edit to old file | Split |
| `bun.lock` / `package.json` for a removed dep with no source change | Still own commit (`chore:`) |

Each group should be stageable with a single `git add` call. If a group needs selective `git add -p` (hunks), tell the user and ask before staging partial hunks.

### 3. For each group: stage, propose, commit

For each group, in order:

1. Stage the group:
   ```bash
   git add <paths>
   ```
2. Show what is staged and generate the subject:
   ```bash
   git diff --cached --stat
   ```
3. Pick the **type**:
   - `feat` - new user-visible capability
   - `fix` - bug fix
   - `refactor` - code change that neither fixes a bug nor adds a feature
   - `perf` - performance improvement
   - `test` - tests only
   - `docs` - docs only
   - `chore` - tooling, deps, generated types, config
   - `build`, `ci`, `style` - rare; use only when nothing else fits
4. Write the **summary** in imperative mood, ≤ 120 chars total for the subject line.
   - Lead with the user-visible "what" if `feat`/`fix`, or the area name if `chore`/`refactor`.
   - Examples from this repo: `feat: add noise SVG for background texture and fine tuning UI/UX`, `chore: update generated Cloudflare environment types`, `feat: implement feed-packer logic for dynamic tile placement and grid management`.
5. Commit using a HEREDOC to avoid shell quoting issues:
   ```bash
   git commit -m "$(cat <<'EOF'
   <subject line>
   EOF
   )"
   ```
   Don't add `Co-Authored-By` in any commit message.

### 4. Verify

After all groups:

```bash
git status --porcelain
git log -<n> --oneline
```

`git status` should be clean (or show only files the agent intentionally left unstaged). `git log` should show one commit per group with subjects that match the repo's voice.

## Subject length rule (hard)

If your draft subject is **> 120 characters**, shorten it. Tactics:

- Drop filler words ("and fine tuning", "for enhanced").
- Move detail into the commit body.
- Tighten the scope name: `(feed)` instead of `(feed components)`.
- Rewrite to lead with the verb: `add X` instead of `introduces support for X`.

Examples that fit ≤ 120 (and the repo's tone):

- `feat: add feed-packer logic for dynamic tile placement`
- `feat: add migrations for short stories and feed decorations`
- `feat: add noise SVG for background texture`
- `chore: update generated Cloudflare environment types`
- `test: cover feed-packer post sizing and packing logic`

## What to surface to the user

Before the first commit, briefly tell the user:

- How many commits you plan, and the one-line subject of each.
- Any files you intentionally left unstaged and why.

Then commit. Do not pause for confirmation between commits unless a group is ambiguous (e.g. mixed concerns that could split two ways).

## Safety rules

- Never update git config.
- Never force-push, hard-reset, or skip hooks unless the user asked.
- Never amend a commit you didn't just make in this session.
- Never push. Stop after the local commits and report what landed.
- Never commit files matching `.env`, `*.pem`, `*.key`, `credentials.*`, `secrets.*`, or anything in `.gitignore` that contains credentials. If staged, `git reset HEAD` them and tell the user.
- If a pre-commit hook fails, do **not** amend - fix the issue and make a new commit.

## Done means

- All non-secret changes are committed in focused groups.
- `git status --porcelain` is clean (or only shows intentionally-ignored files).
- A short summary of the commits is shown to the user.