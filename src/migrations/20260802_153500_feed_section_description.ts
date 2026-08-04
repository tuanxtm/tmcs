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
 * Optional localized description under feedSection heading.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await addColumnIfMissing(db, 'pages_blocks_feed_section_locales', 'description', 'text')
  await addColumnIfMissing(db, '_pages_v_blocks_feed_section_locales', 'description', 'text')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite column drops are unreliable across local/prod D1 paths; leave columns.
  void db
}
