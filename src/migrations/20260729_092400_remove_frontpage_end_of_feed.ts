import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Drop Frontpage end-of-feed tile fields (enabled, preferredShape, localized text).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`frontpage\` DROP COLUMN \`end_of_feed_enabled\`;`)
  await db.run(sql`ALTER TABLE \`frontpage\` DROP COLUMN \`end_of_feed_preferred_shape\`;`)
  await db.run(sql`ALTER TABLE \`frontpage_locales\` DROP COLUMN \`end_of_feed_text\`;`)
  await db.run(sql`ALTER TABLE \`_frontpage_v\` DROP COLUMN \`version_end_of_feed_enabled\`;`)
  await db.run(sql`ALTER TABLE \`_frontpage_v\` DROP COLUMN \`version_end_of_feed_preferred_shape\`;`)
  await db.run(sql`ALTER TABLE \`_frontpage_v_locales\` DROP COLUMN \`version_end_of_feed_text\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`frontpage\` ADD \`end_of_feed_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`frontpage\` ADD \`end_of_feed_preferred_shape\` text DEFAULT '2x1';`)
  await db.run(sql`ALTER TABLE \`frontpage_locales\` ADD \`end_of_feed_text\` text;`)
  await db.run(
    sql`ALTER TABLE \`_frontpage_v\` ADD \`version_end_of_feed_enabled\` integer DEFAULT true;`,
  )
  await db.run(
    sql`ALTER TABLE \`_frontpage_v\` ADD \`version_end_of_feed_preferred_shape\` text DEFAULT '2x1';`,
  )
  await db.run(sql`ALTER TABLE \`_frontpage_v_locales\` ADD \`version_end_of_feed_text\` text;`)
}
