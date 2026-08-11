---
description:
alwaysApply: true
---

# Agents

1. This project uses the Payload CMS skill at `.agents/skills/payload/`. Start with `.agents/skills/payload/SKILL.md` for a quick reference, then see `.agents/skills/payload/reference/` for detailed docs.

2. Next.js: ALWAYS read docs before coding. Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated - the docs are the source of truth.

## Core principles

- **Simplicity**: Use the simplest solution that works, don't overcomplicate things, don't overengineer, don't over thinking.
- **Consistency**: Use the same solution for the same problem.
- **Modularity**: Use the small possible modules.
- **Reusability**: Use the same modules in multiple places.
- **Maintainability**: Use the simplest solution that is easy to maintain.
- **Scalability**: Use the simplest solution that is easy to scale.
- **Performance**: Use the simplest solution that is maximizing performance.
- **Output**: Do not use em dash (—), use regular dash (-).

## Project backend map

TMCS is a **single** Next.js + Payload app (not a multi-package monorepo) targeting Cloudflare D1/R2 via OpenNext.

### Important directories

| Path                               | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `src/payload/config.ts`            | Payload config: localization, jobs access, GraphQL disabled, D1/R2, migrations |
| `src/collections/`                 | Content + auth collections                                                     |
| `src/globals/`                     | Site settings (e.g. `SiteSettings`)                                            |
| `src/access/`                      | RBAC helpers                                                                   |
| `src/fields/`                      | Reusable SEO + common field groups                                             |
| `src/hooks/`                       | Slug reservations, YouTube thumbnail import, frontend revalidation             |
| `src/blocks/`                      | Page layout blocks                                                             |
| `src/components/`                  | Shared React components (UI primitives, frontend widgets)                      |
| `src/lib/`                         | Roles, locales, env, crypto, reading time, payload queries, cache tags        |
| `src/migrations/`                  | D1 migrations (pass `prodMigrations` in adapter)                               |
| `src/backup_migrations/`           | Snapshot of migrations kept as a safety net (not consumed by Payload)          |
| `src/scripts/`                     | `seed.ts` (idempotent local seed), `local-reset.ts`, `decoration-upload.ts`    |
| `src/proxy.ts`                     | Next.js 16 proxy: locale header + Admin CSRF LAN workaround                    |
| `src/app/(frontend)/api/contact`   | Hardened public contact intake                                                 |
| `src/app/(frontend)/api/cron/jobs` | Protected Payload jobs runner                                                  |
| `worker.ts`                        | OpenNext + Cloudflare Cron scheduled handler                                   |
| `docs/frontend-cms-contract.md`    | Frontend consumption contract                                                  |

### Roles (one per user)

- `admin` - everything including users
- `manager` - editorial/publish; no user management
- `creator` - own drafts only; cannot publish

Always pass `user` + `overrideAccess: false` when operating on behalf of a user in Local API.

### Security invariants

- `PAYLOAD_SECRET` is required (no empty-string fallback)
- `jobs.access.run` allows Admin/Manager **or** cron secret only (not Creators)
- Inactive users cannot log in or enter Admin
- GraphQL is disabled; prefer REST/Local API
- Media uploads disallow SVG

### Localization

- Locales: `en` (default), `vi` (fallback to `en`)
- `_status` is document-level; use `translationReady.vi` for editorial completeness

### Scheduled publishing

Do **not** enable `jobs.autoRun` on Workers. Cron → `worker.ts` → `/api/cron/jobs`.

### Package manager

Use **bun** (`bun install`, `bun run …`).

### After schema edits

1. `bun run generate:types`
2. `bun run generate:importmap`

Note: `bun run migrate:create <name>` may spawn an interactive prompt (Payload CLI confirmation). In agent/headless runs this will time out and fail. Avoid it; pick one of the workflows below instead.

#### Big schema change (recommended workflow)

Use this when adding/removing collections, renaming tables, or making changes that rewrite a large portion of the schema. D1 has no destructive diffs, so partial migrations become a maintenance burden fast.

1. Delete the local D1 database (`bun run local:reset` or `rm .wrangler/state/v3/d1/*.sqlite*`).
2. Clear all migrations in `src/migrations/` **EXCEPT** `slug_reservations` (this table is managed outside the Payload schema and must be preserved).
3. Re-run `bun run migrate:create <name>` to produce a single fresh migration that reflects the current schema in full.
4. Review the generated SQL.
5. Run `bun run migrate` to apply.
6. Update `src/scripts/seed.ts` to match the new schema.
7. Run `bun run seed` to repopulate local data.

#### Small schema change (incremental workflow)

Use this for a single column add/rename, a new field on an existing collection, or any change that is a clean additive diff.

1. **Do not** use the Payload CLI to create the migration. Instead, manually create a new file in `src/migrations/` matching the existing naming convention (e.g. `YYYYMMDD_HHMMSS_short_name.ts` and `.json`) and import it from `src/migrations/index.ts`. This avoids the interactive prompt entirely.
2. Run `bun run migrate` to apply.
3. Update `src/scripts/seed.ts` to match the new schema.
4. Run `bun run seed` to verify local data still aligns.
