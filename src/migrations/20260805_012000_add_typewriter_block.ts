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

/**
 * Add the typewriter page-builder block.
 * Stores the picked short-stories relationship via `pages_rels.short_stories_id`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // --- Typewriter block (live) ---
  await db.run(sql`CREATE TABLE \`pages_blocks_typewriter\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_path\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`block_name\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_typewriter_order_idx\` ON \`pages_blocks_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_typewriter_parent_id_idx\` ON \`pages_blocks_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_typewriter_path_idx\` ON \`pages_blocks_typewriter\` (\`_path\`);`,
  )

  await db.run(sql`CREATE TABLE \`pages_blocks_typewriter_locales\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_typewriter\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`pages_blocks_typewriter_locales_locale_parent_id_unique\` ON \`pages_blocks_typewriter_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // --- Typewriter block (versions) ---
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_typewriter\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_path\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_uuid\` text,
    \`block_name\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_typewriter_order_idx\` ON \`_pages_v_blocks_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_typewriter_parent_id_idx\` ON \`_pages_v_blocks_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_typewriter_path_idx\` ON \`_pages_v_blocks_typewriter\` (\`_path\`);`,
  )

  await db.run(sql`CREATE TABLE \`_pages_v_blocks_typewriter_locales\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_typewriter\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_pages_v_blocks_typewriter_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_typewriter_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // short-stories relationship on pages_rels (live + versions)
  if (!(await columnNames(db, 'pages_rels')).has('short_stories_id')) {
    await db.run(
      sql`ALTER TABLE \`pages_rels\` ADD \`short_stories_id\` integer REFERENCES short_stories(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`pages_rels_short_stories_id_idx\` ON \`pages_rels\` (\`short_stories_id\`);`,
    )
  }
  if (!(await columnNames(db, '_pages_v_rels')).has('short_stories_id')) {
    await db.run(
      sql`ALTER TABLE \`_pages_v_rels\` ADD \`short_stories_id\` integer REFERENCES short_stories(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`_pages_v_rels_short_stories_id_idx\` ON \`_pages_v_rels\` (\`short_stories_id\`);`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_typewriter_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_typewriter\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_typewriter_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_typewriter\`;`)

  // SQLite cannot DROP COLUMN reliably across all environments used here;
  // leave short_stories_id columns in place on down.
}
