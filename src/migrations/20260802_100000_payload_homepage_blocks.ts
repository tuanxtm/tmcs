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
 * Add homepage page-builder blocks: hero + feedSection.
 * Also adds posts_id to pages_rels for manual post selections.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // --- Hero block (live) ---
  await db.run(sql`CREATE TABLE \`pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`cover_image_id\` integer,
  	\`profile_image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`profile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_cover_image_idx\` ON \`pages_blocks_hero\` (\`cover_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_profile_image_idx\` ON \`pages_blocks_hero\` (\`profile_image_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`pages_blocks_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`pages_blocks_hero_locales_locale_parent_id_unique\` ON \`pages_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`pages_blocks_hero_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'internal',
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_links_order_idx\` ON \`pages_blocks_hero_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_links_parent_id_idx\` ON \`pages_blocks_hero_links\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_hero_links_page_idx\` ON \`pages_blocks_hero_links\` (\`page_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`pages_blocks_hero_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`pages_blocks_hero_links_locales_locale_parent_id_unique\` ON \`pages_blocks_hero_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // --- Feed section block (live) ---
  await db.run(sql`CREATE TABLE \`pages_blocks_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_feed_section_order_idx\` ON \`pages_blocks_feed_section\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_feed_section_parent_id_idx\` ON \`pages_blocks_feed_section\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_feed_section_path_idx\` ON \`pages_blocks_feed_section\` (\`_path\`);`,
  )

  await db.run(sql`CREATE TABLE \`pages_blocks_feed_section_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`pages_blocks_feed_section_locales_locale_parent_id_unique\` ON \`pages_blocks_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // --- Hero block (versions) ---
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cover_image_id\` integer,
  	\`profile_image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`profile_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_order_idx\` ON \`_pages_v_blocks_hero\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_parent_id_idx\` ON \`_pages_v_blocks_hero\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_path_idx\` ON \`_pages_v_blocks_hero\` (\`_path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_cover_image_idx\` ON \`_pages_v_blocks_hero\` (\`cover_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_profile_image_idx\` ON \`_pages_v_blocks_hero\` (\`profile_image_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_pages_v_blocks_hero_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'internal',
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	\`_uuid\` text,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_links_order_idx\` ON \`_pages_v_blocks_hero_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_links_parent_id_idx\` ON \`_pages_v_blocks_hero_links\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_hero_links_page_idx\` ON \`_pages_v_blocks_hero_links\` (\`page_id\`);`,
  )

  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_pages_v_blocks_hero_links_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_hero_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // --- Feed section block (versions) ---
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_feed_section_order_idx\` ON \`_pages_v_blocks_feed_section\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_feed_section_parent_id_idx\` ON \`_pages_v_blocks_feed_section\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_feed_section_path_idx\` ON \`_pages_v_blocks_feed_section\` (\`_path\`);`,
  )

  await db.run(sql`CREATE TABLE \`_pages_v_blocks_feed_section_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`_pages_v_blocks_feed_section_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // Manual post selections on feed sections
  if (!(await columnNames(db, 'pages_rels')).has('posts_id')) {
    await db.run(
      sql`ALTER TABLE \`pages_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`,
    )
  }
  if (!(await columnNames(db, '_pages_v_rels')).has('posts_id')) {
    await db.run(
      sql`ALTER TABLE \`_pages_v_rels\` ADD \`posts_id\` integer REFERENCES posts(id);`,
    )
    await db.run(
      sql`CREATE INDEX \`_pages_v_rels_posts_id_idx\` ON \`_pages_v_rels\` (\`posts_id\`);`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_feed_section\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_hero_links_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_hero_links\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_feed_section\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_hero_links_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_hero_links\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_hero\`;`)

  // SQLite cannot DROP COLUMN reliably across all environments used here;
  // leave posts_id columns in place on down.
}
