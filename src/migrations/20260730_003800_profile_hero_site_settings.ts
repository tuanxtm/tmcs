import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-d1-sqlite'

function toLexicalJson(plain: string): string {
  return JSON.stringify({
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: plain, version: 1 }],
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  })
}

function extractRows(result: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(result)) return result as Array<Record<string, unknown>>
  if (result && typeof result === 'object') {
    const record = result as { rows?: unknown; results?: unknown }
    if (Array.isArray(record.rows)) return record.rows as Array<Record<string, unknown>>
    if (Array.isArray(record.results)) return record.results as Array<Record<string, unknown>>
  }
  return []
}

/**
 * Move profile hero fields onto site-settings; slim frontpage to curation + decoration pack.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // --- site-settings: profile columns ---
  await db.run(
    sql`ALTER TABLE \`site_settings\` ADD \`profile_image_id\` integer REFERENCES media(id);`,
  )
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`profile_stats_posts\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`profile_stats_followers\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`profile_stats_following\` numeric DEFAULT 0;`)
  await db.run(
    sql`CREATE INDEX \`site_settings_profile_profile_image_idx\` ON \`site_settings\` (\`profile_image_id\`);`,
  )

  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`profile_bio\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`owner_summary\`;`)

  await db.run(
    sql`ALTER TABLE \`_site_settings_v\` ADD \`version_profile_image_id\` integer REFERENCES media(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`_site_settings_v\` ADD \`version_profile_stats_posts\` numeric DEFAULT 0;`,
  )
  await db.run(
    sql`ALTER TABLE \`_site_settings_v\` ADD \`version_profile_stats_followers\` numeric DEFAULT 0;`,
  )
  await db.run(
    sql`ALTER TABLE \`_site_settings_v\` ADD \`version_profile_stats_following\` numeric DEFAULT 0;`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_version_profile_version_profile_image_idx\` ON \`_site_settings_v\` (\`version_profile_image_id\`);`,
  )

  await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` ADD \`version_profile_bio\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` DROP COLUMN \`version_owner_summary\`;`)

  // Profile links arrays
  await db.run(sql`CREATE TABLE \`site_settings_profile_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'internal' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`site_settings_profile_links_order_idx\` ON \`site_settings_profile_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`site_settings_profile_links_parent_id_idx\` ON \`site_settings_profile_links\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`site_settings_profile_links_page_idx\` ON \`site_settings_profile_links\` (\`page_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`site_settings_profile_links_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_profile_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`site_settings_profile_links_locales_locale_parent_id_unique\` ON \`site_settings_profile_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`_site_settings_v_version_profile_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'internal' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_version_profile_links_order_idx\` ON \`_site_settings_v_version_profile_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_version_profile_links_parent_id_idx\` ON \`_site_settings_v_version_profile_links\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_site_settings_v_version_profile_links_page_idx\` ON \`_site_settings_v_version_profile_links\` (\`page_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_profile_links_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_profile_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_site_settings_v_version_profile_links_locales_locale_parent_id_uniq\` ON \`_site_settings_v_version_profile_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // Copy hero image → profile image
  await db.run(sql`
    UPDATE \`site_settings\`
    SET \`profile_image_id\` = (
      SELECT \`hero_image_id\` FROM \`frontpage\` WHERE \`hero_image_id\` IS NOT NULL LIMIT 1
    )
    WHERE \`profile_image_id\` IS NULL
  `)

  // Migrate profile_summary → profile_bio (Lexical)
  const summaryResult = await db.run(
    sql.raw(
      `SELECT ssl.id AS locale_id, fl.profile_summary AS summary
       FROM site_settings_locales ssl
       LEFT JOIN frontpage_locales fl ON fl._locale = ssl._locale
       WHERE fl.profile_summary IS NOT NULL AND TRIM(fl.profile_summary) != ''`,
    ),
  )

  for (const row of extractRows(summaryResult)) {
    const localeId = Number(row.locale_id)
    const summary = row.summary
    if (!Number.isFinite(localeId) || typeof summary !== 'string') continue
    const escaped = toLexicalJson(summary).replaceAll("'", "''")
    await db.run(
      sql.raw(`UPDATE "site_settings_locales" SET "profile_bio" = '${escaped}' WHERE id = ${localeId}`),
    )
  }

  // --- frontpage: drop hero fields (no localized columns remain) ---
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`DROP TABLE \`frontpage_locales\`;`)
  await db.run(sql`DROP TABLE \`_frontpage_v_locales\`;`)

  await db.run(sql`CREATE TABLE \`__new_frontpage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`active_decoration_pack_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`active_decoration_pack_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`
    INSERT INTO \`__new_frontpage\`("id", "active_decoration_pack_id", "updated_at", "created_at")
    SELECT "id", "active_decoration_pack_id", "updated_at", "created_at" FROM \`frontpage\`;
  `)
  await db.run(sql`DROP TABLE \`frontpage\`;`)
  await db.run(sql`ALTER TABLE \`__new_frontpage\` RENAME TO \`frontpage\`;`)
  await db.run(
    sql`CREATE INDEX \`frontpage_active_decoration_pack_idx\` ON \`frontpage\` (\`active_decoration_pack_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`__new__frontpage_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_active_decoration_pack_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_active_decoration_pack_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );`)
  await db.run(sql`
    INSERT INTO \`__new__frontpage_v\`("id", "version_active_decoration_pack_id", "version_updated_at", "version_created_at", "created_at", "updated_at")
    SELECT "id", "version_active_decoration_pack_id", "version_updated_at", "version_created_at", "created_at", "updated_at" FROM \`_frontpage_v\`;
  `)
  await db.run(sql`DROP TABLE \`_frontpage_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__frontpage_v\` RENAME TO \`_frontpage_v\`;`)
  await db.run(
    sql`CREATE INDEX \`_frontpage_v_version_active_decoration_pack_idx\` ON \`_frontpage_v\` (\`version_active_decoration_pack_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_frontpage_v_created_at_idx\` ON \`_frontpage_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_frontpage_v_updated_at_idx\` ON \`_frontpage_v\` (\`updated_at\`);`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore frontpage locales + hero columns (content not restored)
  await db.run(sql`CREATE TABLE \`frontpage_locales\` (
  	\`hero_heading\` text NOT NULL DEFAULT '',
  	\`hero_subheading\` text,
  	\`profile_summary\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`frontpage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`frontpage_locales_locale_parent_id_unique\` ON \`frontpage_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`_frontpage_v_locales\` (
  	\`version_hero_heading\` text NOT NULL DEFAULT '',
  	\`version_hero_subheading\` text,
  	\`version_profile_summary\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_frontpage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_frontpage_v_locales_locale_parent_id_unique\` ON \`_frontpage_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`ALTER TABLE \`frontpage\` ADD \`hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`frontpage_hero_image_idx\` ON \`frontpage\` (\`hero_image_id\`);`)
  await db.run(
    sql`ALTER TABLE \`_frontpage_v\` ADD \`version_hero_image_id\` integer REFERENCES media(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`_frontpage_v_version_version_hero_image_idx\` ON \`_frontpage_v\` (\`version_hero_image_id\`);`,
  )

  await db.run(sql`DROP TABLE \`_site_settings_v_version_profile_links_locales\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_profile_links\`;`)
  await db.run(sql`DROP TABLE \`site_settings_profile_links_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_profile_links\`;`)

  await db.run(sql`ALTER TABLE \`site_settings_locales\` ADD \`owner_summary\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings_locales\` DROP COLUMN \`profile_bio\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` ADD \`version_owner_summary\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v_locales\` DROP COLUMN \`version_profile_bio\`;`)

  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`profile_image_id\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`profile_stats_posts\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`profile_stats_followers\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`profile_stats_following\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_profile_image_id\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_profile_stats_posts\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_profile_stats_followers\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_profile_stats_following\`;`)
}
