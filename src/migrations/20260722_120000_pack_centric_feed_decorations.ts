import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

function extractRows<T extends Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[]
  if (result && typeof result === 'object') {
    const record = result as { rows?: unknown; results?: unknown }
    if (Array.isArray(record.rows)) return record.rows as T[]
    if (Array.isArray(record.results)) return record.results as T[]
  }
  return []
}

async function columnNames(db: MigrateUpArgs['db'], table: string): Promise<Set<string>> {
  const result = await db.run(sql.raw(`PRAGMA table_info(${table})`))
  return new Set(extractRows<{ name: string }>(result).map((row) => row.name))
}

async function tableExists(db: MigrateUpArgs['db'], table: string): Promise<boolean> {
  const result = await db.run(
    sql.raw(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '${table.replaceAll("'", "''")}'`,
    ),
  )
  return extractRows<{ name: string }>(result).length > 0
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Drop legacy decoration_svgs upload collection if present.
  if (await tableExists(db, 'decoration_svgs')) {
    await db.run(sql`DROP TABLE \`decoration_svgs\`;`)
  }

  // Rebuild feed_decorations as SVG upload collection (R2 metadata).
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`DROP TABLE IF EXISTS \`feed_decorations_allowed_shapes\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`feed_decorations\`;`)
  await db.run(sql`CREATE TABLE \`feed_decorations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`uploaded_by_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	FOREIGN KEY (\`uploaded_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`CREATE INDEX \`feed_decorations_uploaded_by_idx\` ON \`feed_decorations\` (\`uploaded_by_id\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_updated_at_idx\` ON \`feed_decorations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_created_at_idx\` ON \`feed_decorations\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`feed_decorations_filename_idx\` ON \`feed_decorations\` (\`filename\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  // Pack footer: text row id instead of FK to feed decoration docs.
  const packColumns = await columnNames(db, 'decoration_packs')
  if (!packColumns.has('footer_item')) {
    await db.run(sql`ALTER TABLE \`decoration_packs\` ADD \`footer_item\` text;`)
  }

  if (packColumns.has('footer_decoration_id')) {
    await db.run(sql`PRAGMA foreign_keys=OFF;`)
    await db.run(sql`CREATE TABLE \`__new_decoration_packs\` (
    	\`id\` integer PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`generate_slug\` integer DEFAULT true,
    	\`slug\` text NOT NULL,
    	\`footer_item\` text,
    	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
    );`)
    await db.run(
      sql`INSERT INTO \`__new_decoration_packs\`("id", "title", "generate_slug", "slug", "footer_item", "updated_at", "created_at")
       SELECT "id", "title", "generate_slug", "slug", "footer_item", "updated_at", "created_at" FROM \`decoration_packs\`;`,
    )
    await db.run(sql`DROP TABLE \`decoration_packs\`;`)
    await db.run(sql`ALTER TABLE \`__new_decoration_packs\` RENAME TO \`decoration_packs\`;`)
    await db.run(sql`CREATE UNIQUE INDEX \`decoration_packs_slug_idx\` ON \`decoration_packs\` (\`slug\`);`)
    await db.run(sql`CREATE INDEX \`decoration_packs_updated_at_idx\` ON \`decoration_packs\` (\`updated_at\`);`)
    await db.run(sql`CREATE INDEX \`decoration_packs_created_at_idx\` ON \`decoration_packs\` (\`created_at\`);`)
    await db.run(sql`PRAGMA foreign_keys=ON;`)
  }

  // Pack items array (+ hasMany shapes).
  if (!(await tableExists(db, 'decoration_packs_items'))) {
    await db.run(sql`CREATE TABLE \`decoration_packs_items\` (
    	\`_order\` integer NOT NULL,
    	\`_parent_id\` integer NOT NULL,
    	\`id\` text PRIMARY KEY NOT NULL,
    	\`title\` text NOT NULL,
    	\`file_id\` integer,
    	\`weight\` numeric DEFAULT 1,
    	FOREIGN KEY (\`file_id\`) REFERENCES \`feed_decorations\`(\`id\`) ON UPDATE no action ON DELETE set null,
    	FOREIGN KEY (\`_parent_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE cascade
    );`)
    await db.run(sql`CREATE INDEX \`decoration_packs_items_order_idx\` ON \`decoration_packs_items\` (\`_order\`);`)
    await db.run(sql`CREATE INDEX \`decoration_packs_items_parent_id_idx\` ON \`decoration_packs_items\` (\`_parent_id\`);`)
    await db.run(sql`CREATE INDEX \`decoration_packs_items_file_idx\` ON \`decoration_packs_items\` (\`file_id\`);`)
  }

  if (!(await tableExists(db, 'decoration_packs_items_allowed_shapes'))) {
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

  // Locked docs: drop decoration_svgs_id if present (column may remain unused; ignore if missing).
  const lockedColumns = await columnNames(db, 'payload_locked_documents_rels')
  if (lockedColumns.has('decoration_svgs_id') && !lockedColumns.has('feed_decorations_id')) {
    // feed_decorations_id already added in 20260716; decoration_svgs_id is obsolete.
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`decoration_packs_items_allowed_shapes\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`decoration_packs_items\`;`)

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_feed_decorations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`pack_id\` integer NOT NULL,
  	\`svg_markup\` text NOT NULL,
  	\`weight\` numeric DEFAULT 1,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`pack_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`DROP TABLE IF EXISTS \`feed_decorations\`;`)
  await db.run(sql`ALTER TABLE \`__new_feed_decorations\` RENAME TO \`feed_decorations\`;`)
  await db.run(sql`CREATE INDEX \`feed_decorations_pack_idx\` ON \`feed_decorations\` (\`pack_id\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_updated_at_idx\` ON \`feed_decorations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_created_at_idx\` ON \`feed_decorations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`feed_decorations_allowed_shapes\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`feed_decorations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
