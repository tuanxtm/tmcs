import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`short_stories_allowed_shapes\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`short_stories_allowed_shapes_order_idx\` ON \`short_stories_allowed_shapes\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`short_stories_allowed_shapes_parent_idx\` ON \`short_stories_allowed_shapes\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`short_stories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`variant\` text DEFAULT 'note',
  	\`image_id\` integer,
  	\`link_enabled\` integer DEFAULT false,
  	\`link_link_type\` text DEFAULT 'external',
  	\`link_page_id\` integer,
  	\`link_url\` text,
  	\`link_new_tab\` integer DEFAULT true,
  	\`published_at\` text,
  	\`owner_id\` integer,
  	\`translation_ready_vi\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`short_stories_image_idx\` ON \`short_stories\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`short_stories_link_link_page_idx\` ON \`short_stories\` (\`link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`short_stories_owner_idx\` ON \`short_stories\` (\`owner_id\`);`)
  await db.run(sql`CREATE INDEX \`short_stories_updated_at_idx\` ON \`short_stories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`short_stories_created_at_idx\` ON \`short_stories\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`short_stories__status_idx\` ON \`short_stories\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`short_stories_locales\` (
  	\`title\` text,
  	\`content\` text,
  	\`link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`short_stories_locales_locale_parent_id_unique\` ON \`short_stories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_short_stories_v_version_allowed_shapes\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_short_stories_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_allowed_shapes_order_idx\` ON \`_short_stories_v_version_allowed_shapes\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_allowed_shapes_parent_idx\` ON \`_short_stories_v_version_allowed_shapes\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_short_stories_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_variant\` text DEFAULT 'note',
  	\`version_image_id\` integer,
  	\`version_link_enabled\` integer DEFAULT false,
  	\`version_link_link_type\` text DEFAULT 'external',
  	\`version_link_page_id\` integer,
  	\`version_link_url\` text,
  	\`version_link_new_tab\` integer DEFAULT true,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_short_stories_v_parent_idx\` ON \`_short_stories_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_image_idx\` ON \`_short_stories_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_link_version_link_page_idx\` ON \`_short_stories_v\` (\`version_link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_owner_idx\` ON \`_short_stories_v\` (\`version_owner_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_updated_at_idx\` ON \`_short_stories_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_created_at_idx\` ON \`_short_stories_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version__status_idx\` ON \`_short_stories_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_created_at_idx\` ON \`_short_stories_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_updated_at_idx\` ON \`_short_stories_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_snapshot_idx\` ON \`_short_stories_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_published_locale_idx\` ON \`_short_stories_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_latest_idx\` ON \`_short_stories_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_autosave_idx\` ON \`_short_stories_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_short_stories_v_locales\` (
  	\`version_title\` text,
  	\`version_content\` text,
  	\`version_link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_short_stories_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_short_stories_v_locales_locale_parent_id_unique\` ON \`_short_stories_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`posts\` ADD \`card_size\` text DEFAULT 'auto';`)
  await db.run(sql`ALTER TABLE \`_posts_v\` ADD \`version_card_size\` text DEFAULT 'auto';`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`short_stories_id\` integer REFERENCES short_stories(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_short_stories_id_idx\` ON \`payload_locked_documents_rels\` (\`short_stories_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`short_stories_allowed_shapes\`;`)
  await db.run(sql`DROP TABLE \`short_stories\`;`)
  await db.run(sql`DROP TABLE \`short_stories_locales\`;`)
  await db.run(sql`DROP TABLE \`_short_stories_v_version_allowed_shapes\`;`)
  await db.run(sql`DROP TABLE \`_short_stories_v\`;`)
  await db.run(sql`DROP TABLE \`_short_stories_v_locales\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`authors_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`pages_id\` integer,
  	\`contact_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "authors_id", "categories_id", "tags_id", "posts_id", "projects_id", "pages_id", "contact_submissions_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "authors_id", "categories_id", "tags_id", "posts_id", "projects_id", "pages_id", "contact_submissions_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_authors_id_idx\` ON \`payload_locked_documents_rels\` (\`authors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`)
  await db.run(sql`ALTER TABLE \`posts\` DROP COLUMN \`card_size\`;`)
  await db.run(sql`ALTER TABLE \`_posts_v\` DROP COLUMN \`version_card_size\`;`)
}
