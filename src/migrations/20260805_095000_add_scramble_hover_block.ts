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
 * Add the scramble-hover page-builder block.
 * Stores the picked short-stories relationship via `pages_rels.short_stories_id`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // --- ScrambleHover block (live) ---
  await db.run(sql`CREATE TABLE \`pages_blocks_scramble_hover\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_path\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`block_name\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_scramble_hover_order_idx\` ON \`pages_blocks_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_scramble_hover_parent_id_idx\` ON \`pages_blocks_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_scramble_hover_path_idx\` ON \`pages_blocks_scramble_hover\` (\`_path\`);`,
  )

  await db.run(sql`CREATE TABLE \`pages_blocks_scramble_hover_locales\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_scramble_hover\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`pages_blocks_scramble_hover_locales_locale_parent_id_unique\` ON \`pages_blocks_scramble_hover_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // --- ScrambleHover block (versions) ---
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_scramble_hover\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_path\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_uuid\` text,
    \`block_name\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_scramble_hover_order_idx\` ON \`_pages_v_blocks_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_scramble_hover_parent_id_idx\` ON \`_pages_v_blocks_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_scramble_hover_path_idx\` ON \`_pages_v_blocks_scramble_hover\` (\`_path\`);`,
  )

  await db.run(sql`CREATE TABLE \`_pages_v_blocks_scramble_hover_locales\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_scramble_hover\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_pages_v_blocks_scramble_hover_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_scramble_hover_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_scramble_hover_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_scramble_hover\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_scramble_hover_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_scramble_hover\`;`)
}
