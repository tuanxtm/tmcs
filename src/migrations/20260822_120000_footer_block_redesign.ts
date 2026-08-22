import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Footer block redesign:
 * - Replace the single `legalLinks` picker with two labelled pickers
 *   (`labelSocialLinks` + `socialLinks`, `labelOtherLinks` + `otherLinks`)
 *   matching the hero block.
 * - Add a `cursorPopup` text field with a default of `'footer'`.
 *
 * The `legal_links` column was never migrated (the block schema referenced
 * it but no D1 column exists), so this migration only adds new columns and
 * leaves the historic `footer_text` and `copyright` columns untouched.
 *
 * Relationship storage for `socialLinks` / `otherLinks` reuses the existing
 * `pages_rels`, `posts_rels`, and `projects_rels` tables (Payload stores all
 * block-level relationships under the parent collection's rels with a
 * `path` like `layout.0.socialLinks`), so no new rels tables are required.
 *
 * Touches every collection that hosts the footer block (pages, posts,
 * projects) in both live and draft (`_v`) versions.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const tables = [
    'pages_blocks_layout_footer_locales',
    'posts_blocks_layout_footer_locales',
    'projects_blocks_layout_footer_locales',
  ] as const
  const versionedTables = [
    '_pages_v_blocks_layout_footer_locales',
    '_posts_v_blocks_layout_footer_locales',
    '_projects_v_blocks_layout_footer_locales',
  ] as const

  for (const table of tables) {
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` ADD \`label_social_links\` text;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` ADD \`label_other_links\` text;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` ADD \`cursor_popup\` text DEFAULT 'footer';`)
  }

  for (const table of versionedTables) {
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` ADD \`label_social_links\` text;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` ADD \`label_other_links\` text;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` ADD \`cursor_popup\` text DEFAULT 'footer';`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  const tables = [
    'pages_blocks_layout_footer_locales',
    'posts_blocks_layout_footer_locales',
    'projects_blocks_layout_footer_locales',
  ] as const
  const versionedTables = [
    '_pages_v_blocks_layout_footer_locales',
    '_posts_v_blocks_layout_footer_locales',
    '_projects_v_blocks_layout_footer_locales',
  ] as const

  for (const table of tables) {
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` DROP COLUMN \`label_social_links\`;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` DROP COLUMN \`label_other_links\`;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` DROP COLUMN \`cursor_popup\`;`)
  }

  for (const table of versionedTables) {
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` DROP COLUMN \`label_social_links\`;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` DROP COLUMN \`label_other_links\`;`)
    await db.run(sql`ALTER TABLE \`${sql.raw(table)}\` DROP COLUMN \`cursor_popup\`;`)
  }
}
