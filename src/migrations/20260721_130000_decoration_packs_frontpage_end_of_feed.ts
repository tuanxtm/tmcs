import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

function toLexicalJson(title: string, message: string | null): string {
  const children = [
    {
      type: 'paragraph',
      children: [{ type: 'text', text: title, format: 0, version: 1 }],
      version: 1,
    },
  ]

  if (message?.trim()) {
    children.push({
      type: 'paragraph',
      children: [{ type: 'text', text: message.trim(), format: 0, version: 1 }],
      version: 1,
    })
  }

  return JSON.stringify({
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  })
}

function extractRows<T extends Record<string, unknown>>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[]
  if (result && typeof result === 'object') {
    const record = result as { rows?: unknown; results?: unknown }
    if (Array.isArray(record.rows)) return record.rows as T[]
    if (Array.isArray(record.results)) return record.results as T[]
  }
  return []
}

async function migrateEndOfFeedLocales({
  db,
  table,
  titleColumn,
  messageColumn,
  textColumn,
}: {
  db: MigrateUpArgs['db']
  table: 'frontpage_locales' | '_frontpage_v_locales'
  titleColumn: 'end_of_feed_title' | 'version_end_of_feed_title'
  messageColumn: 'end_of_feed_message' | 'version_end_of_feed_message'
  textColumn: 'end_of_feed_text' | 'version_end_of_feed_text'
}): Promise<void> {
  const result = await db.run(
    sql.raw(`SELECT id, "${titleColumn}" AS title, "${messageColumn}" AS message FROM "${table}"`),
  )

  for (const row of extractRows<{ id: number; title: string | null; message: string | null }>(result)) {
    const title = row.title?.trim() || 'Thanks for reading'
    const escaped = toLexicalJson(title, row.message).replaceAll("'", "''")
    await db.run(sql.raw(`UPDATE "${table}" SET "${textColumn}" = '${escaped}' WHERE id = ${Number(row.id)}`))
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`decoration_packs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`footer_decoration_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );`)
  await db.run(sql`CREATE UNIQUE INDEX \`decoration_packs_slug_idx\` ON \`decoration_packs\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`decoration_packs_updated_at_idx\` ON \`decoration_packs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`decoration_packs_created_at_idx\` ON \`decoration_packs\` (\`created_at\`);`)

  await db.run(
    sql`INSERT INTO \`decoration_packs\` (\`title\`, \`slug\`, \`generate_slug\`) VALUES ('Plant', 'plant', 1), ('New Year', 'new-year', 1), ('Christmas', 'christmas', 1);`,
  )

  await db.run(sql`ALTER TABLE \`feed_decorations\` ADD \`pack_id\` integer REFERENCES decoration_packs(id);`)
  await db.run(
    sql`UPDATE \`feed_decorations\` SET \`pack_id\` = (SELECT \`id\` FROM \`decoration_packs\` WHERE \`slug\` = \`feed_decorations\`.\`pack\` LIMIT 1);`,
  )
  await db.run(
    sql`UPDATE \`feed_decorations\` SET \`pack_id\` = (SELECT \`id\` FROM \`decoration_packs\` WHERE \`slug\` = 'plant' LIMIT 1) WHERE \`pack_id\` IS NULL;`,
  )

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
  await db.run(
    sql`INSERT INTO \`__new_feed_decorations\`("id", "title", "pack_id", "svg_markup", "weight", "updated_at", "created_at") SELECT "id", "title", "pack_id", "svg_markup", "weight", "updated_at", "created_at" FROM \`feed_decorations\`;`,
  )
  await db.run(sql`DROP TABLE \`feed_decorations\`;`)
  await db.run(sql`ALTER TABLE \`__new_feed_decorations\` RENAME TO \`feed_decorations\`;`)
  await db.run(sql`CREATE INDEX \`feed_decorations_pack_idx\` ON \`feed_decorations\` (\`pack_id\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_updated_at_idx\` ON \`feed_decorations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_created_at_idx\` ON \`feed_decorations\` (\`created_at\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  await db.run(
    sql`UPDATE \`decoration_packs\` SET \`footer_decoration_id\` = (SELECT \`id\` FROM \`feed_decorations\` ORDER BY \`id\` ASC LIMIT 1) WHERE \`slug\` = 'plant';`,
  )
  await db.run(
    sql`CREATE INDEX \`decoration_packs_footer_decoration_idx\` ON \`decoration_packs\` (\`footer_decoration_id\`);`,
  )

  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`decoration_packs_id\` integer REFERENCES decoration_packs(id);`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_decoration_packs_id_idx\` ON \`payload_locked_documents_rels\` (\`decoration_packs_id\`);`,
  )

  await db.run(sql`ALTER TABLE \`homepage\` RENAME TO \`frontpage\`;`)
  await db.run(sql`ALTER TABLE \`homepage_locales\` RENAME TO \`frontpage_locales\`;`)
  await db.run(sql`ALTER TABLE \`homepage_rels\` RENAME TO \`frontpage_rels\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v\` RENAME TO \`_frontpage_v\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v_locales\` RENAME TO \`_frontpage_v_locales\`;`)
  await db.run(sql`ALTER TABLE \`_homepage_v_rels\` RENAME TO \`_frontpage_v_rels\`;`)

  await db.run(
    sql`ALTER TABLE \`frontpage\` ADD \`active_decoration_pack_id\` integer REFERENCES decoration_packs(id);`,
  )
  await db.run(
    sql`UPDATE \`frontpage\` SET \`active_decoration_pack_id\` = (SELECT \`id\` FROM \`decoration_packs\` WHERE \`slug\` = COALESCE(\`active_decoration_pack\`, 'plant') LIMIT 1);`,
  )

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_frontpage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`end_of_feed_enabled\` integer DEFAULT true,
  	\`end_of_feed_preferred_shape\` text DEFAULT '2x1',
  	\`active_decoration_pack_id\` integer NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`active_decoration_pack_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(
    sql`INSERT INTO \`__new_frontpage\`("id", "hero_image_id", "end_of_feed_enabled", "end_of_feed_preferred_shape", "active_decoration_pack_id", "updated_at", "created_at") SELECT "id", "hero_image_id", "end_of_feed_enabled", "end_of_feed_preferred_shape", "active_decoration_pack_id", "updated_at", "created_at" FROM \`frontpage\`;`,
  )
  await db.run(sql`DROP TABLE \`frontpage\`;`)
  await db.run(sql`ALTER TABLE \`__new_frontpage\` RENAME TO \`frontpage\`;`)
  await db.run(sql`CREATE INDEX \`frontpage_hero_image_idx\` ON \`frontpage\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`frontpage_active_decoration_pack_idx\` ON \`frontpage\` (\`active_decoration_pack_id\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  await db.run(sql`ALTER TABLE \`frontpage_locales\` ADD \`end_of_feed_text\` text;`)
  await migrateEndOfFeedLocales({
    db,
    table: 'frontpage_locales',
    titleColumn: 'end_of_feed_title',
    messageColumn: 'end_of_feed_message',
    textColumn: 'end_of_feed_text',
  })

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_frontpage_locales\` (
  	\`hero_heading\` text NOT NULL,
  	\`hero_subheading\` text,
  	\`profile_summary\` text,
  	\`end_of_feed_text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`frontpage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`INSERT INTO \`__new_frontpage_locales\`("hero_heading", "hero_subheading", "profile_summary", "end_of_feed_text", "id", "_locale", "_parent_id") SELECT "hero_heading", "hero_subheading", "profile_summary", "end_of_feed_text", "id", "_locale", "_parent_id" FROM \`frontpage_locales\`;`,
  )
  await db.run(sql`DROP TABLE \`frontpage_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new_frontpage_locales\` RENAME TO \`frontpage_locales\`;`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`frontpage_locales_locale_parent_id_unique\` ON \`frontpage_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  await db.run(
    sql`ALTER TABLE \`_frontpage_v\` ADD \`version_active_decoration_pack_id\` integer REFERENCES decoration_packs(id);`,
  )
  await db.run(
    sql`UPDATE \`_frontpage_v\` SET \`version_active_decoration_pack_id\` = (SELECT \`id\` FROM \`decoration_packs\` WHERE \`slug\` = COALESCE(\`version_active_decoration_pack\`, 'plant') LIMIT 1);`,
  )

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new__frontpage_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_image_id\` integer,
  	\`version_end_of_feed_enabled\` integer DEFAULT true,
  	\`version_end_of_feed_preferred_shape\` text DEFAULT '2x1',
  	\`version_active_decoration_pack_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_active_decoration_pack_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(
    sql`INSERT INTO \`__new__frontpage_v\`("id", "version_hero_image_id", "version_end_of_feed_enabled", "version_end_of_feed_preferred_shape", "version_active_decoration_pack_id", "version_updated_at", "version_created_at", "created_at", "updated_at") SELECT "id", "version_hero_image_id", "version_end_of_feed_enabled", "version_end_of_feed_preferred_shape", "version_active_decoration_pack_id", "version_updated_at", "version_created_at", "created_at", "updated_at" FROM \`_frontpage_v\`;`,
  )
  await db.run(sql`DROP TABLE \`_frontpage_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__frontpage_v\` RENAME TO \`_frontpage_v\`;`)
  await db.run(
    sql`CREATE INDEX \`_frontpage_v_version_version_hero_image_idx\` ON \`_frontpage_v\` (\`version_hero_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_frontpage_v_version_active_decoration_pack_idx\` ON \`_frontpage_v\` (\`version_active_decoration_pack_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_frontpage_v_created_at_idx\` ON \`_frontpage_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_frontpage_v_updated_at_idx\` ON \`_frontpage_v\` (\`updated_at\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)

  await db.run(sql`ALTER TABLE \`_frontpage_v_locales\` ADD \`version_end_of_feed_text\` text;`)
  await migrateEndOfFeedLocales({
    db,
    table: '_frontpage_v_locales',
    titleColumn: 'version_end_of_feed_title',
    messageColumn: 'version_end_of_feed_message',
    textColumn: 'version_end_of_feed_text',
  })

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new__frontpage_v_locales\` (
  	\`version_hero_heading\` text NOT NULL,
  	\`version_hero_subheading\` text,
  	\`version_profile_summary\` text,
  	\`version_end_of_feed_text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_frontpage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`INSERT INTO \`__new__frontpage_v_locales\`("version_hero_heading", "version_hero_subheading", "version_profile_summary", "version_end_of_feed_text", "id", "_locale", "_parent_id") SELECT "version_hero_heading", "version_hero_subheading", "version_profile_summary", "version_end_of_feed_text", "id", "_locale", "_parent_id" FROM \`_frontpage_v_locales\`;`,
  )
  await db.run(sql`DROP TABLE \`_frontpage_v_locales\`;`)
  await db.run(sql`ALTER TABLE \`__new__frontpage_v_locales\` RENAME TO \`_frontpage_v_locales\`;`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_frontpage_v_locales_locale_parent_id_unique\` ON \`_frontpage_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Irreversible: pack relationships, homepage rename, and lexical end-of-feed text cannot be restored safely.
}
