import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`things_locales\` RENAME COLUMN "affiliate_url" TO "primary_url";`)
  await db.run(sql`ALTER TABLE \`_things_v_locales\` RENAME COLUMN "version_affiliate_url" TO "version_primary_url";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`things_locales\` RENAME COLUMN "primary_url" TO "affiliate_url";`)
  await db.run(sql`ALTER TABLE \`_things_v_locales\` RENAME COLUMN "version_primary_url" TO "version_affiliate_url";`)
}
