import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

async function columnNames(db: MigrateUpArgs['db'], table: string): Promise<Set<string>> {
  const result = await db.run(sql.raw(`PRAGMA table_info(${table})`))
  const rows = Array.isArray(result)
    ? result
    : ((result as { rows?: Array<{ name: string }>; results?: Array<{ name: string }> }).rows ??
      (result as { results?: Array<{ name: string }> }).results ??
      [])
  return new Set((rows as Array<{ name: string }>).map((row) => row.name))
}

async function addColumnIfMissing(
  db: MigrateUpArgs['db'],
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  if ((await columnNames(db, table)).has(column)) return
  await db.run(sql.raw(`ALTER TABLE \`${table}\` ADD \`${column}\` ${definition}`))
}

/**
 * feedSection: static vs infinite pagination + CMS Page destination for View all.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  const liveHadViewAll = (await columnNames(db, 'pages_blocks_feed_section')).has(
    'view_all_page_id',
  )
  const versionHadViewAll = (await columnNames(db, '_pages_v_blocks_feed_section')).has(
    'view_all_page_id',
  )

  await addColumnIfMissing(db, 'pages_blocks_feed_section', 'pagination', "text DEFAULT 'static'")
  await addColumnIfMissing(
    db,
    'pages_blocks_feed_section',
    'view_all_page_id',
    'integer REFERENCES pages(id)',
  )

  await addColumnIfMissing(db, '_pages_v_blocks_feed_section', 'pagination', "text DEFAULT 'static'")
  await addColumnIfMissing(
    db,
    '_pages_v_blocks_feed_section',
    'view_all_page_id',
    'integer REFERENCES pages(id)',
  )

  if (!liveHadViewAll) {
    await db.run(
      sql`CREATE INDEX \`pages_blocks_feed_section_view_all_page_idx\` ON \`pages_blocks_feed_section\` (\`view_all_page_id\`);`,
    )
  }

  if (!versionHadViewAll) {
    await db.run(
      sql`CREATE INDEX \`_pages_v_blocks_feed_section_view_all_page_idx\` ON \`_pages_v_blocks_feed_section\` (\`view_all_page_id\`);`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite column drops are unreliable across local/prod D1 paths; leave columns.
  void db
}
