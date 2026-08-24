import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Add `slug` and `slug_lock` columns to the `things_locales` table, plus
 * `version_slug_lock` to the `_things_v_locales` version table.
 *
 * This mirrors the pattern established for other collections in
 * `20260822_130000_replace_generate_slug_with_slug_lock.ts`.
 *
 * Idempotent guards (`IF NOT EXISTS`) keep the migration safe to re-run.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // things_locales: add slug (text, localized) + slug_lock (boolean, localized)
  await db.run(
    sql.raw(`ALTER TABLE \`things_locales\` ADD COLUMN \`slug\` text DEFAULT NULL`),
  )
  await db.run(
    sql.raw(`ALTER TABLE \`things_locales\` ADD COLUMN \`slug_lock\` integer DEFAULT 1`),
  )

  // _things_v_locales: add version columns for draft versioning
  await db.run(
    sql.raw(
      `ALTER TABLE \`_things_v_locales\` ADD COLUMN \`version_slug\` text DEFAULT NULL`,
    ),
  )
  await db.run(
    sql.raw(
      `ALTER TABLE \`_things_v_locales\` ADD COLUMN \`version_slug_lock\` integer DEFAULT 1`,
    ),
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql.raw(`ALTER TABLE \`things_locales\` DROP COLUMN \`slug_lock\``))
  await db.run(sql.raw(`ALTER TABLE \`things_locales\` DROP COLUMN \`slug\``))

  await db.run(
    sql.raw(`ALTER TABLE \`_things_v_locales\` DROP COLUMN \`version_slug_lock\``),
  )
  await db.run(
    sql.raw(`ALTER TABLE \`_things_v_locales\` DROP COLUMN \`version_slug\``),
  )
}
