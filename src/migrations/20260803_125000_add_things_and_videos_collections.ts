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

async function tableExists(db: MigrateUpArgs['db'], table: string): Promise<boolean> {
  const result = await db.run(
    sql.raw(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`),
  )
  const rows = Array.isArray(result)
    ? result
    : ((result as { rows?: unknown[]; results?: unknown[] }).rows ??
      (result as { results?: unknown[] }).results ??
      [])
  return rows.length > 0
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
 * Add Things + Videos collections and wire feedSection manual relationships.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (!(await tableExists(db, 'things'))) {
    await db.run(sql`CREATE TABLE \`things\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`primary_image_id\` integer,
  	\`detail_image_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`published_at\` text,
  	\`owner_id\` integer,
  	\`translation_ready_vi\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`primary_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`detail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
    await db.run(sql`CREATE INDEX \`things_primary_image_idx\` ON \`things\` (\`primary_image_id\`);`)
    await db.run(sql`CREATE INDEX \`things_detail_image_idx\` ON \`things\` (\`detail_image_id\`);`)
    await db.run(sql`CREATE INDEX \`things_owner_idx\` ON \`things\` (\`owner_id\`);`)
    await db.run(sql`CREATE INDEX \`things_published_at_idx\` ON \`things\` (\`published_at\`);`)
    await db.run(sql`CREATE INDEX \`things_updated_at_idx\` ON \`things\` (\`updated_at\`);`)
    await db.run(sql`CREATE INDEX \`things_created_at_idx\` ON \`things\` (\`created_at\`);`)
    await db.run(sql`CREATE INDEX \`things__status_idx\` ON \`things\` (\`_status\`);`)

    await db.run(sql`CREATE TABLE \`things_locales\` (
  	\`name\` text,
  	\`description\` text,
  	\`affiliate_url\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`things_locales_locale_parent_id_unique\` ON \`things_locales\` (\`_locale\`, \`_parent_id\`);`,
    )

    await db.run(sql`CREATE TABLE \`_things_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_primary_image_id\` integer,
  	\`version_detail_image_id\` integer,
  	\`version_featured\` integer DEFAULT false,
  	\`version_published_at\` text,
  	\`version_owner_id\` integer,
  	\`version_translation_ready_vi\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_primary_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_detail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
    await db.run(sql`CREATE INDEX \`_things_v_parent_idx\` ON \`_things_v\` (\`parent_id\`);`)
    await db.run(
      sql`CREATE INDEX \`_things_v_version_version_primary_image_idx\` ON \`_things_v\` (\`version_primary_image_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_things_v_version_version_detail_image_idx\` ON \`_things_v\` (\`version_detail_image_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_things_v_version_version_owner_idx\` ON \`_things_v\` (\`version_owner_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_things_v_version_version_published_at_idx\` ON \`_things_v\` (\`version_published_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_things_v_version_version_updated_at_idx\` ON \`_things_v\` (\`version_updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_things_v_version_version_created_at_idx\` ON \`_things_v\` (\`version_created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_things_v_version_version__status_idx\` ON \`_things_v\` (\`version__status\`);`,
    )
    await db.run(sql`CREATE INDEX \`_things_v_created_at_idx\` ON \`_things_v\` (\`created_at\`);`)
    await db.run(sql`CREATE INDEX \`_things_v_updated_at_idx\` ON \`_things_v\` (\`updated_at\`);`)
    await db.run(sql`CREATE INDEX \`_things_v_snapshot_idx\` ON \`_things_v\` (\`snapshot\`);`)
    await db.run(
      sql`CREATE INDEX \`_things_v_published_locale_idx\` ON \`_things_v\` (\`published_locale\`);`,
    )
    await db.run(sql`CREATE INDEX \`_things_v_latest_idx\` ON \`_things_v\` (\`latest\`);`)
    await db.run(sql`CREATE INDEX \`_things_v_autosave_idx\` ON \`_things_v\` (\`autosave\`);`)

    await db.run(sql`CREATE TABLE \`_things_v_locales\` (
  	\`version_name\` text,
  	\`version_description\` text,
  	\`version_affiliate_url\` text,
  	\`version_link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_things_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`_things_v_locales_locale_parent_id_unique\` ON \`_things_v_locales\` (\`_locale\`, \`_parent_id\`);`,
    )
  }

  if (!(await tableExists(db, 'videos'))) {
    await db.run(sql`CREATE TABLE \`videos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`provider\` text DEFAULT 'youtube',
  	\`source_url\` text,
  	\`thumbnail_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`published_at\` text,
  	\`owner_id\` integer,
  	\`translation_ready_vi\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
    await db.run(sql`CREATE INDEX \`videos_thumbnail_idx\` ON \`videos\` (\`thumbnail_id\`);`)
    await db.run(sql`CREATE INDEX \`videos_owner_idx\` ON \`videos\` (\`owner_id\`);`)
    await db.run(sql`CREATE INDEX \`videos_published_at_idx\` ON \`videos\` (\`published_at\`);`)
    await db.run(sql`CREATE INDEX \`videos_updated_at_idx\` ON \`videos\` (\`updated_at\`);`)
    await db.run(sql`CREATE INDEX \`videos_created_at_idx\` ON \`videos\` (\`created_at\`);`)
    await db.run(sql`CREATE INDEX \`videos__status_idx\` ON \`videos\` (\`_status\`);`)

    await db.run(sql`CREATE TABLE \`videos_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`videos_locales_locale_parent_id_unique\` ON \`videos_locales\` (\`_locale\`, \`_parent_id\`);`,
    )

    await db.run(sql`CREATE TABLE \`_videos_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_provider\` text DEFAULT 'youtube',
  	\`version_source_url\` text,
  	\`version_thumbnail_id\` integer,
  	\`version_featured\` integer DEFAULT false,
  	\`version_published_at\` text,
  	\`version_owner_id\` integer,
  	\`version_translation_ready_vi\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
    await db.run(sql`CREATE INDEX \`_videos_v_parent_idx\` ON \`_videos_v\` (\`parent_id\`);`)
    await db.run(
      sql`CREATE INDEX \`_videos_v_version_version_thumbnail_idx\` ON \`_videos_v\` (\`version_thumbnail_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_videos_v_version_version_owner_idx\` ON \`_videos_v\` (\`version_owner_id\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_videos_v_version_version_published_at_idx\` ON \`_videos_v\` (\`version_published_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_videos_v_version_version_updated_at_idx\` ON \`_videos_v\` (\`version_updated_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_videos_v_version_version_created_at_idx\` ON \`_videos_v\` (\`version_created_at\`);`,
    )
    await db.run(
      sql`CREATE INDEX \`_videos_v_version_version__status_idx\` ON \`_videos_v\` (\`version__status\`);`,
    )
    await db.run(sql`CREATE INDEX \`_videos_v_created_at_idx\` ON \`_videos_v\` (\`created_at\`);`)
    await db.run(sql`CREATE INDEX \`_videos_v_updated_at_idx\` ON \`_videos_v\` (\`updated_at\`);`)
    await db.run(sql`CREATE INDEX \`_videos_v_snapshot_idx\` ON \`_videos_v\` (\`snapshot\`);`)
    await db.run(
      sql`CREATE INDEX \`_videos_v_published_locale_idx\` ON \`_videos_v\` (\`published_locale\`);`,
    )
    await db.run(sql`CREATE INDEX \`_videos_v_latest_idx\` ON \`_videos_v\` (\`latest\`);`)
    await db.run(sql`CREATE INDEX \`_videos_v_autosave_idx\` ON \`_videos_v\` (\`autosave\`);`)

    await db.run(sql`CREATE TABLE \`_videos_v_locales\` (
  	\`version_title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_videos_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
    await db.run(
      sql`CREATE UNIQUE INDEX \`_videos_v_locales_locale_parent_id_unique\` ON \`_videos_v_locales\` (\`_locale\`, \`_parent_id\`);`,
    )
  }

  // Manual feedSection relationships
  if (!(await columnNames(db, 'pages_rels')).has('things_id')) {
    await db.run(sql`ALTER TABLE \`pages_rels\` ADD \`things_id\` integer REFERENCES things(id);`)
    await db.run(sql`CREATE INDEX \`pages_rels_things_id_idx\` ON \`pages_rels\` (\`things_id\`);`)
  }
  if (!(await columnNames(db, 'pages_rels')).has('videos_id')) {
    await db.run(sql`ALTER TABLE \`pages_rels\` ADD \`videos_id\` integer REFERENCES videos(id);`)
    await db.run(sql`CREATE INDEX \`pages_rels_videos_id_idx\` ON \`pages_rels\` (\`videos_id\`);`)
  }
  if (!(await columnNames(db, '_pages_v_rels')).has('things_id')) {
    await db.run(
      sql`ALTER TABLE \`_pages_v_rels\` ADD \`things_id\` integer REFERENCES things(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`_pages_v_rels_things_id_idx\` ON \`_pages_v_rels\` (\`things_id\`);`,
    )
  }
  if (!(await columnNames(db, '_pages_v_rels')).has('videos_id')) {
    await db.run(
      sql`ALTER TABLE \`_pages_v_rels\` ADD \`videos_id\` integer REFERENCES videos(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`_pages_v_rels_videos_id_idx\` ON \`_pages_v_rels\` (\`videos_id\`);`,
    )
  }

  // Locked documents + preferences relationship columns
  await addColumnIfMissing(
    db,
    'payload_locked_documents_rels',
    'things_id',
    'integer REFERENCES things(id)',
  )
  await addColumnIfMissing(
    db,
    'payload_locked_documents_rels',
    'videos_id',
    'integer REFERENCES videos(id)',
  )

  if ((await columnNames(db, 'payload_locked_documents_rels')).has('things_id')) {
    try {
      await db.run(
        sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_things_id_idx\` ON \`payload_locked_documents_rels\` (\`things_id\`);`,
      )
    } catch {
      // index may already exist
    }
  }
  if ((await columnNames(db, 'payload_locked_documents_rels')).has('videos_id')) {
    try {
      await db.run(
        sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_videos_id_idx\` ON \`payload_locked_documents_rels\` (\`videos_id\`);`,
      )
    } catch {
      // index may already exist
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // SQLite drops are awkward across local/prod; leave new tables/columns.
  void db
}
