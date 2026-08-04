import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

async function tableExists(db: MigrateUpArgs['db'], table: string): Promise<boolean> {
  const result = await db.run(
    sql.raw(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table.replaceAll("'", "''")}'`,
    ),
  )
  const rows = Array.isArray(result)
    ? result
    : ((result as { rows?: unknown[]; results?: unknown[] }).rows ??
      (result as { results?: unknown[] }).results ??
      [])
  return Array.isArray(rows) && rows.length > 0
}

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
 * Drop packer-only CMS fields: posts.cardSize and allowedShapes on
 * short stories + decoration pack items.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  if ((await columnNames(db, 'posts')).has('card_size')) {
    await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`card_size\`;`)
  }
  if (await tableExists(db, '_posts_v')) {
    if ((await columnNames(db, '_posts_v')).has('version_card_size')) {
      await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_card_size\`;`)
    }
  }

  await db.run(sql`DROP TABLE IF EXISTS \`short_stories_allowed_shapes\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_short_stories_v_version_allowed_shapes\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`decoration_packs_items_allowed_shapes\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Schema-only restore; prior values are not recovered.
  await db.run(sql`ALTER TABLE \`posts\` ADD \`card_size\` text DEFAULT 'auto';`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_card_size\` text DEFAULT 'auto';`)

  await db.run(sql`CREATE TABLE \`short_stories_allowed_shapes\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`short_stories_allowed_shapes_order_idx\` ON \`short_stories_allowed_shapes\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`short_stories_allowed_shapes_parent_idx\` ON \`short_stories_allowed_shapes\` (\`parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`_short_stories_v_version_allowed_shapes\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_short_stories_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_allowed_shapes_order_idx\` ON \`_short_stories_v_version_allowed_shapes\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_allowed_shapes_parent_idx\` ON \`_short_stories_v_version_allowed_shapes\` (\`parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`decoration_packs_items_allowed_shapes\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` text NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`decoration_packs_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`decoration_packs_items_allowed_shapes_order_idx\` ON \`decoration_packs_items_allowed_shapes\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`decoration_packs_items_allowed_shapes_parent_idx\` ON \`decoration_packs_items_allowed_shapes\` (\`parent_id\`);`,
  )
}
