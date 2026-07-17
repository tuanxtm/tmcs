import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`end_of_feed_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`homepage\` ADD \`end_of_feed_preferred_shape\` text DEFAULT '2x1';`)
  await db.run(sql`ALTER TABLE \`homepage_locales\` ADD \`end_of_feed_eyebrow\` text DEFAULT 'End of feed';`)
  await db.run(sql`ALTER TABLE \`homepage_locales\` ADD \`end_of_feed_title\` text DEFAULT 'Thanks for reading';`)
  await db.run(sql`ALTER TABLE \`homepage_locales\` ADD \`end_of_feed_message\` text;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_end_of_feed_enabled\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` ADD \`version_end_of_feed_preferred_shape\` text DEFAULT '2x1';`)
  await db.run(sql`ALTER TABLE \`_homepage_v_locales\` ADD \`version_end_of_feed_eyebrow\` text DEFAULT 'End of feed';`)
  await db.run(sql`ALTER TABLE \`_homepage_v_locales\` ADD \`version_end_of_feed_title\` text DEFAULT 'Thanks for reading';`)
  await db.run(sql`ALTER TABLE \`_homepage_v_locales\` ADD \`version_end_of_feed_message\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`end_of_feed_enabled\`;`)
  await db.run(sql`ALTER TABLE \`homepage\` DROP COLUMN \`end_of_feed_preferred_shape\`;`)
  await db.run(sql`ALTER TABLE \`homepage_locales\` DROP COLUMN \`end_of_feed_eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`homepage_locales\` DROP COLUMN \`end_of_feed_title\`;`)
  await db.run(sql`ALTER TABLE \`homepage_locales\` DROP COLUMN \`end_of_feed_message\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_end_of_feed_enabled\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` DROP COLUMN \`version_end_of_feed_preferred_shape\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v_locales\` DROP COLUMN \`version_end_of_feed_eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v_locales\` DROP COLUMN \`version_end_of_feed_title\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v_locales\` DROP COLUMN \`version_end_of_feed_message\`;`)
}
