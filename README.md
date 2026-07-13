# TMCS — Portfolio + Blog (Payload CMS)

Bilingual (English / Vietnamese) Payload CMS app for a personal portfolio, blog, and project showcase. Runs as a **single Next.js app** on **Cloudflare Workers** (OpenNext) with **D1** (SQLite) and **R2** media storage.

This baseline ships Admin, the content model, RBAC, SEO data, contact intake, scheduled publishing, migrations, seeds, tests, and a **homepage-only public frontend**. Post/page/project detail routes and draft preview are deferred.

## Stack

- Payload CMS `3.86` + Next.js `16.2` + React `19`
- Cloudflare OpenNext, D1, R2
- Package manager: **bun**
- Locales: `en` (default + fallback), `vi`

## Roles

| Role        | Capabilities                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| **admin**   | Full access, including users/roles                                                                                   |
| **manager** | Editorial + site content, publish/schedule, media, taxonomies, globals, contact inbox. **Cannot** manage users/roles |
| **creator** | Own Posts/Projects drafts + own media. Preview + versions. **Cannot** publish/schedule/unpublish                     |

Creators draft → Manager/Admin publish (approval workflow).

Inactive users cannot log in or open the Admin panel.

## Quick start

```bash
bun install
cp .env.example .env
# set PAYLOAD_SECRET, SEED_* passwords, CRON_SECRET, CONTACT_HASH_SECRET

bun run migrate
bun run seed
bun run dev
```

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Public homepage: [http://localhost:3000](http://localhost:3000) · Vietnamese: [http://localhost:3000/vi](http://localhost:3000/vi)

## Environment variables

See [`.env.example`](.env.example) for the full documented list.

| Variable                 | Purpose                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `PAYLOAD_SECRET`         | Payload signing/encryption (**required** — boot fails if missing)              |
| `NEXT_PUBLIC_SERVER_URL` | Canonical site URL for previews / contact origin checks                        |
| `PAYLOAD_CSRF_ORIGINS`   | Extra Admin/API origins (comma-separated) for cookie login via alternate hosts |
| `ALLOWED_DEV_ORIGINS`    | Optional comma-separated hosts for `next dev` behind a LAN IP / tunnel         |
| `CRON_SECRET`            | Auth for `/api/cron/jobs` (scheduled publishing)                               |
| `CONTACT_HASH_SECRET`    | Hashes IP/UA for contact abuse metadata (falls back to `PAYLOAD_SECRET`)       |
| `SEED_*`                 | Local seed credentials only                                                    |

**Production:** set secrets with `wrangler secret put PAYLOAD_SECRET` (and `CRON_SECRET`, `CONTACT_HASH_SECRET`). Never commit real secrets.

## Cloudflare / Wrangler

[`wrangler.jsonc`](wrangler.jsonc):

1. Replace `database_id` / R2 bucket with real resources before production.
2. Keep `remote: false` for local D1; use `remote: true` only with a real Cloudflare D1 ID.
3. Cron trigger `*/5 * * * *` invokes scheduled publishing via [`worker.ts`](worker.ts).
4. `WORKER_SELF_REFERENCE` must match the Worker `name`.

Create resources:

```bash
bunx wrangler login
bunx wrangler d1 create tmcs
bunx wrangler r2 bucket create tmcs-media
bunx wrangler secret put PAYLOAD_SECRET
bunx wrangler secret put CRON_SECRET
bunx wrangler secret put CONTACT_HASH_SECRET
```

## Schema change workflow

1. Edit collections/globals/fields
2. `bun run generate:types`
3. `bun run generate:importmap`
4. `bun run migrate:create <name>` (accept **create column** prompts)
5. Review SQL under `src/migrations/`
6. `bun run migrate` locally
7. Backup remote D1 before production
8. `bun run deploy` (runs migrate then OpenNext deploy)

## Scripts

| Script                                                  | Description                                        |
| ------------------------------------------------------- | -------------------------------------------------- |
| `bun run dev`                                           | Next.js + Payload local                            |
| `bun run migrate` / `migrate:create` / `migrate:status` | D1 migrations                                      |
| `bun run seed`                                          | Idempotent local seed (`src/scripts/seed.ts`)      |
| `bun run reset:local`                                   | Clears `.next` / `.open-next` / `.wrangler` caches |
| `bun run typecheck`                                     | `tsc --noEmit`                                     |
| `bun run lint`                                          | ESLint                                             |
| `bun run format` / `format:check`                       | Prettier                                           |
| `bun run test:int`                                      | Vitest integration tests                           |
| `bun run test:e2e`                                      | Playwright admin/smoke                             |
| `bun run generate:types`                                | Wrangler + Payload types                           |
| `bun run deploy`                                        | Migrate remote D1 + deploy Worker                  |

## Content model

**Collections:** users, media, authors, categories, tags, posts, projects, pages, contact-submissions

**Globals:** site-settings, navigation, footer, homepage

**Portfolio:** a single published `pages` document (seeded slug `portfolio`) using rich-text + projects-grid blocks — not separate collections. Public rendering of that page is deferred.

**Posts / Projects / Pages:** drafts, autosave, schedulePublish, versions, localized SEO group.

## Public frontend (current)

Implemented:

- `/` and `/vi` homepage shell (nav, footer, hero, post feed)
- Locale header injection via `src/proxy.ts` (Next.js 16 proxy convention)
- `POST /api/contact` and `GET|POST /api/cron/jobs`

Deferred (CMS may still store these; UI does not link yet):

- `/posts/[slug]`, `/projects/[slug]`, `/[pageSlug]`
- Draft preview routes under `/preview/...`
- Contact form UI (API exists)

Internal CMS page links and post-card destinations are suppressed until those routes exist. External nav/footer links still render.

## Localization

- Field-level localization (`localized: true` on human-facing fields)
- `_status` is **document-level** (not per locale)
- Use `translationReady.vi` as an editorial completeness signal
- Frontend query contract: always pass `locale`; fallback on by default; for hard locale routes use `fallbackLocale: false` + `slug: { exists: true }`

## Scheduled publishing (Cloudflare)

`schedulePublish` only **queues** jobs. Workers have no long-running `autoRun`.

Jobs may be run by **Admin/Manager** or by requests carrying a valid `x-cron-secret` / cron bearer token. Creators cannot run jobs.

Flow:

1. Manager schedules publish in Admin
2. Payload stores a job
3. Cloudflare Cron → [`worker.ts`](worker.ts) `scheduled` handler
4. Handler calls `/api/cron/jobs` with `CRON_SECRET`
5. Route runs `payload.jobs.run({ limit })`

Local test:

```bash
curl -X POST 'http://localhost:3000/api/cron/jobs?limit=10' \
  -H "Authorization: Bearer $CRON_SECRET"
```

Or: `bunx wrangler dev --test-scheduled`

## Contact form

- Collection create access is **denied** for everyone
- Public intake: `POST /api/contact` (validation, honeypot, timing, hashed IP/UA, dedupe, raw-body size limit)
- Staff review in Admin → Contact submissions
- Email notifications / Turnstile: extension points only (not wired)

## Media policy

- Allowed uploads: JPEG, PNG, WebP, GIF, PDF, MP4, WebM
- **SVG is not allowed** (stored XSS risk with public media reads)
- Crop/focal point disabled (no `sharp` on Workers)

## Cloudflare constraints

- No `sharp` → responsive derivatives are a frontend/CDN follow-up
- Prefer Local/REST APIs; **GraphQL is disabled** in Payload config
- Watch Workers bundle/CPU limits as the schema grows

## Frontend handoff

See [`docs/frontend-cms-contract.md`](docs/frontend-cms-contract.md).

## Agent notes

See [`AGENTS.md`](AGENTS.md) and [`.agents/skills/payload/`](.agents/skills/payload/).

## License

MIT — see [`LICENSE`](LICENSE).
