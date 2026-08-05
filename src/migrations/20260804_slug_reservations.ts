import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS slug_reservations (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      locale text NOT NULL,
      slug text NOT NULL,
      collection text NOT NULL,
      content_id integer NOT NULL
    );
  `)

  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS slug_reservations_unique ON slug_reservations (collection, locale, slug);`,
  )

  await db.run(
    sql`CREATE INDEX IF NOT EXISTS slug_reservations_slug_locale_idx ON slug_reservations (slug, locale);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS slug_reservations;`)
}
