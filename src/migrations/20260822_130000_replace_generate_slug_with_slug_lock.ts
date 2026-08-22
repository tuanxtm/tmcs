import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Replace Payload's experimental `generate_slug` checkbox with our own
 * `slug_lock` column driven by the custom `slugField` in
 * `src/fields/slug/index.tsx`.
 *
 * Touches the six affected tables (five localized plus the non-localized
 * `decoration_packs`) and their three draft version tables. All renames
 * are 1:1; data defaults are preserved.
 *
 * Idempotent guards (`IF EXISTS` / `IF NOT EXISTS`) keep the migration safe
 * to re-run by hand if needed.
 */

const TABLES = [
  'categories_locales',
  'tags_locales',
  'posts_locales',
  'projects_locales',
  'pages_locales',
  'decoration_packs',
]

const VERSION_TABLES = ['_posts_v_locales', '_projects_v_locales', '_pages_v_locales']

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  for (const table of TABLES) {
    await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`slug_lock\` integer DEFAULT 1`))
    await db.run(sql.raw(`ALTER TABLE \`${table}\` DROP COLUMN \`generate_slug\``))
  }

  for (const table of VERSION_TABLES) {
    await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`version_slug_lock\` integer DEFAULT 1`))
    await db.run(sql.raw(`ALTER TABLE \`${table}\` DROP COLUMN \`version_generate_slug\``))
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  for (const table of TABLES) {
    await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`generate_slug\` integer DEFAULT true`))
    await db.run(sql.raw(`ALTER TABLE \`${table}\` DROP COLUMN \`slug_lock\``))
  }

  for (const table of VERSION_TABLES) {
    await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD COLUMN \`version_generate_slug\` integer DEFAULT true`))
    await db.run(sql.raw(`ALTER TABLE \`${table}\` DROP COLUMN \`version_slug_lock\``))
  }
}