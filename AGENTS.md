# Agents

This project uses the Payload CMS skill at `.agents/skills/payload/`.
Start with `.agents/skills/payload/SKILL.md` for a quick reference, then see `.agents/skills/payload/reference/` for detailed docs.

## Project backend map

TMCS is a **single** Next.js + Payload app (not a multi-package monorepo) targeting Cloudflare D1/R2 via OpenNext.

### Important directories

| Path                               | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `src/payload.config.ts`            | Payload config: localization, jobs access, GraphQL disabled, D1/R2, migrations |
| `src/collections/`                 | Content + auth collections                                                     |
| `src/globals/`                     | Site settings, nav, footer, homepage                                           |
| `src/access/`                      | RBAC helpers                                                                   |
| `src/fields/`                      | Reusable SEO + common fields                                                   |
| `src/hooks/`                       | Owner, publish date, last-admin protection                                     |
| `src/blocks/`                      | Page layout blocks                                                             |
| `src/lib/`                         | Roles, locales, env, crypto, reading time                                      |
| `src/migrations/`                  | D1 migrations (pass `prodMigrations` in adapter)                               |
| `src/scripts/seed.ts`              | Idempotent local seed                                                          |
| `src/proxy.ts`                     | Next.js 16 proxy: locale header + Admin CSRF LAN workaround                    |
| `src/app/(frontend)/api/contact`   | Hardened public contact intake                                                 |
| `src/app/(frontend)/api/cron/jobs` | Protected Payload jobs runner                                                  |
| `worker.ts`                        | OpenNext + Cloudflare Cron scheduled handler                                   |
| `docs/frontend-cms-contract.md`    | Frontend consumption contract                                                  |

### Roles (one per user)

- `admin` — everything including users
- `manager` — editorial/publish; no user management
- `creator` — own drafts only; cannot publish

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
3. `bun run migrate:create <name>`
4. Review SQL, then `bun run migrate`
