import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Keep FKs off for the whole destructive rebuild. Local/dev DBs may already
  // have partially dropped collection tables from a previous attempt.
  await db.run(sql`PRAGMA foreign_keys=OFF;`)

  // 1) Rebuild relationship tables without skills/experience/testimonials FKs first.
  await db.run(sql`CREATE TABLE \`__new_projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	\`authors_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_projects_rels\`("id", "order", "parent_id", "path", "projects_id", "authors_id") SELECT "id", "order", "parent_id", "path", "projects_id", "authors_id" FROM \`projects_rels\` WHERE \`skills_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects_rels\` RENAME TO \`projects_rels\`;`)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_projects_id_idx\` ON \`projects_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_authors_id_idx\` ON \`projects_rels\` (\`authors_id\`);`)

  await db.run(sql`CREATE TABLE \`__new__projects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	\`authors_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__projects_v_rels\`("id", "order", "parent_id", "path", "projects_id", "authors_id") SELECT "id", "order", "parent_id", "path", "projects_id", "authors_id" FROM \`_projects_v_rels\` WHERE \`skills_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__projects_v_rels\` RENAME TO \`_projects_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_projects_id_idx\` ON \`_projects_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_authors_id_idx\` ON \`_projects_v_rels\` (\`authors_id\`);`)

  await db.run(sql`CREATE TABLE \`__new_pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pages_rels\`("id", "order", "parent_id", "path", "projects_id") SELECT "id", "order", "parent_id", "path", "projects_id" FROM \`pages_rels\` WHERE \`experience_id\` IS NULL AND \`skills_id\` IS NULL AND \`testimonials_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_rels\` RENAME TO \`pages_rels\`;`)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_projects_id_idx\` ON \`pages_rels\` (\`projects_id\`);`)

  await db.run(sql`CREATE TABLE \`__new__pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`projects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pages_v_rels\`("id", "order", "parent_id", "path", "projects_id") SELECT "id", "order", "parent_id", "path", "projects_id" FROM \`_pages_v_rels\` WHERE \`experience_id\` IS NULL AND \`skills_id\` IS NULL AND \`testimonials_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_rels\` RENAME TO \`_pages_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_projects_id_idx\` ON \`_pages_v_rels\` (\`projects_id\`);`)

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
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "authors_id", "categories_id", "tags_id", "posts_id", "projects_id", "pages_id", "contact_submissions_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "authors_id", "categories_id", "tags_id", "posts_id", "projects_id", "pages_id", "contact_submissions_id" FROM \`payload_locked_documents_rels\` WHERE \`skills_id\` IS NULL AND \`experience_id\` IS NULL AND \`testimonials_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
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

  await db.run(sql`CREATE TABLE \`__new_homepage_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_homepage_rels\`("id", "order", "parent_id", "path", "posts_id", "projects_id") SELECT "id", "order", "parent_id", "path", "posts_id", "projects_id" FROM \`homepage_rels\` WHERE \`skills_id\` IS NULL AND \`experience_id\` IS NULL AND \`testimonials_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`homepage_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_homepage_rels\` RENAME TO \`homepage_rels\`;`)
  await db.run(sql`CREATE INDEX \`homepage_rels_order_idx\` ON \`homepage_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_parent_idx\` ON \`homepage_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_path_idx\` ON \`homepage_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_posts_id_idx\` ON \`homepage_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_projects_id_idx\` ON \`homepage_rels\` (\`projects_id\`);`)

  await db.run(sql`CREATE TABLE \`__new__homepage_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__homepage_v_rels\`("id", "order", "parent_id", "path", "posts_id", "projects_id") SELECT "id", "order", "parent_id", "path", "posts_id", "projects_id" FROM \`_homepage_v_rels\` WHERE \`skills_id\` IS NULL AND \`experience_id\` IS NULL AND \`testimonials_id\` IS NULL;`)
  await db.run(sql`DROP TABLE \`_homepage_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__homepage_v_rels\` RENAME TO \`_homepage_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_order_idx\` ON \`_homepage_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_parent_idx\` ON \`_homepage_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_path_idx\` ON \`_homepage_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_posts_id_idx\` ON \`_homepage_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_projects_id_idx\` ON \`_homepage_v_rels\` (\`projects_id\`);`)

  // 2) Drop obsolete page blocks and portfolio collection tables.
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_experience_list_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_experience_list\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_skills_grid_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_skills_grid\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_experience_list_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_experience_list\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_skills_grid_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_skills_grid\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`experience_highlights_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`experience_highlights\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`experience_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`experience_rels\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`experience\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`testimonials_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`testimonials\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`skills_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`skills\`;`)

  await db.run(sql`PRAGMA foreign_keys=ON;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`skills\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`category\` text NOT NULL,
  	\`proficiency\` text,
  	\`icon_id\` integer,
  	\`url\` text,
  	\`featured\` integer DEFAULT false,
  	\`visible\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`skills_icon_idx\` ON \`skills\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX \`skills_updated_at_idx\` ON \`skills\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`skills_created_at_idx\` ON \`skills\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`skills_locales\` (
  	\`name\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`skills_slug_idx\` ON \`skills_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`skills_locales_locale_parent_id_unique\` ON \`skills_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`experience_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`experience\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`experience_highlights_order_idx\` ON \`experience_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`experience_highlights_parent_id_idx\` ON \`experience_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`experience_highlights_locales\` (
  	\`text\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`experience_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`experience_highlights_locales_locale_parent_id_unique\` ON \`experience_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`experience\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`organization_url\` text,
  	\`logo_id\` integer,
  	\`employment_type\` text,
  	\`start_date\` text NOT NULL,
  	\`end_date\` text,
  	\`current\` integer DEFAULT false,
  	\`visible\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`experience_logo_idx\` ON \`experience\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`experience_updated_at_idx\` ON \`experience\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`experience_created_at_idx\` ON \`experience\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`experience_locales\` (
  	\`role\` text NOT NULL,
  	\`organization\` text NOT NULL,
  	\`location\` text,
  	\`summary\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`experience\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`experience_locales_locale_parent_id_unique\` ON \`experience_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`experience_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`skills_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`experience\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`skills_id\`) REFERENCES \`skills\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`experience_rels_order_idx\` ON \`experience_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`experience_rels_parent_idx\` ON \`experience_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`experience_rels_path_idx\` ON \`experience_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`experience_rels_skills_id_idx\` ON \`experience_rels\` (\`skills_id\`);`)
  await db.run(sql`CREATE TABLE \`testimonials\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`avatar_id\` integer,
  	\`source_url\` text,
  	\`consent\` integer DEFAULT false,
  	\`approved\` integer DEFAULT false,
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`testimonials_avatar_idx\` ON \`testimonials\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_updated_at_idx\` ON \`testimonials\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`testimonials_created_at_idx\` ON \`testimonials\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`testimonials_locales\` (
  	\`quote\` text NOT NULL,
  	\`person_name\` text NOT NULL,
  	\`person_title\` text,
  	\`company\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`testimonials_locales_locale_parent_id_unique\` ON \`testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_experience_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_experience_list_order_idx\` ON \`pages_blocks_experience_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_experience_list_parent_id_idx\` ON \`pages_blocks_experience_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_experience_list_path_idx\` ON \`pages_blocks_experience_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_experience_list_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_experience_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_experience_list_locales_locale_parent_id_unique\` ON \`pages_blocks_experience_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_skills_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`featured_only\` integer DEFAULT false,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_skills_grid_order_idx\` ON \`pages_blocks_skills_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_skills_grid_parent_id_idx\` ON \`pages_blocks_skills_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_skills_grid_path_idx\` ON \`pages_blocks_skills_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_skills_grid_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_skills_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_skills_grid_locales_locale_parent_id_unique\` ON \`pages_blocks_skills_grid_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_order_idx\` ON \`pages_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_parent_id_idx\` ON \`pages_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_path_idx\` ON \`pages_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_testimonials_locales_locale_parent_id_unique\` ON \`pages_blocks_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_experience_list\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_experience_list_order_idx\` ON \`_pages_v_blocks_experience_list\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_experience_list_parent_id_idx\` ON \`_pages_v_blocks_experience_list\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_experience_list_path_idx\` ON \`_pages_v_blocks_experience_list\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_experience_list_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_experience_list\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_experience_list_locales_locale_parent_id_uni\` ON \`_pages_v_blocks_experience_list_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_skills_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`featured_only\` integer DEFAULT false,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_skills_grid_order_idx\` ON \`_pages_v_blocks_skills_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_skills_grid_parent_id_idx\` ON \`_pages_v_blocks_skills_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_skills_grid_path_idx\` ON \`_pages_v_blocks_skills_grid\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_skills_grid_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_skills_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_skills_grid_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_skills_grid_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_order_idx\` ON \`_pages_v_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_parent_id_idx\` ON \`_pages_v_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_path_idx\` ON \`_pages_v_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_testimonials_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`projects_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`)
  await db.run(sql`CREATE INDEX \`projects_rels_skills_id_idx\` ON \`projects_rels\` (\`skills_id\`);`)
  await db.run(sql`ALTER TABLE \`_projects_v_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_skills_id_idx\` ON \`_projects_v_rels\` (\`skills_id\`);`)
  await db.run(sql`ALTER TABLE \`pages_rels\` ADD \`experience_id\` integer REFERENCES experience(id);`)
  await db.run(sql`ALTER TABLE \`pages_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`)
  await db.run(sql`ALTER TABLE \`pages_rels\` ADD \`testimonials_id\` integer REFERENCES testimonials(id);`)
  await db.run(sql`CREATE INDEX \`pages_rels_experience_id_idx\` ON \`pages_rels\` (\`experience_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_skills_id_idx\` ON \`pages_rels\` (\`skills_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_testimonials_id_idx\` ON \`pages_rels\` (\`testimonials_id\`);`)
  await db.run(sql`ALTER TABLE \`_pages_v_rels\` ADD \`experience_id\` integer REFERENCES experience(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`)
  await db.run(sql`ALTER TABLE \`_pages_v_rels\` ADD \`testimonials_id\` integer REFERENCES testimonials(id);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_experience_id_idx\` ON \`_pages_v_rels\` (\`experience_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_skills_id_idx\` ON \`_pages_v_rels\` (\`skills_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_testimonials_id_idx\` ON \`_pages_v_rels\` (\`testimonials_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`experience_id\` integer REFERENCES experience(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`testimonials_id\` integer REFERENCES testimonials(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_skills_id_idx\` ON \`payload_locked_documents_rels\` (\`skills_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_experience_id_idx\` ON \`payload_locked_documents_rels\` (\`experience_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_testimonials_id_idx\` ON \`payload_locked_documents_rels\` (\`testimonials_id\`);`)
  await db.run(sql`ALTER TABLE \`homepage_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`)
  await db.run(sql`ALTER TABLE \`homepage_rels\` ADD \`experience_id\` integer REFERENCES experience(id);`)
  await db.run(sql`ALTER TABLE \`homepage_rels\` ADD \`testimonials_id\` integer REFERENCES testimonials(id);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_skills_id_idx\` ON \`homepage_rels\` (\`skills_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_experience_id_idx\` ON \`homepage_rels\` (\`experience_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_testimonials_id_idx\` ON \`homepage_rels\` (\`testimonials_id\`);`)
  await db.run(sql`ALTER TABLE \`_homepage_v_rels\` ADD \`skills_id\` integer REFERENCES skills(id);`)
  await db.run(sql`ALTER TABLE \`_homepage_v_rels\` ADD \`experience_id\` integer REFERENCES experience(id);`)
  await db.run(sql`ALTER TABLE \`_homepage_v_rels\` ADD \`testimonials_id\` integer REFERENCES testimonials(id);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_skills_id_idx\` ON \`_homepage_v_rels\` (\`skills_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_experience_id_idx\` ON \`_homepage_v_rels\` (\`experience_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_testimonials_id_idx\` ON \`_homepage_v_rels\` (\`testimonials_id\`);`)
}
