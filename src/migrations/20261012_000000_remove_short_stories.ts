import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`__new_posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_posts_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`posts_rels\` WHERE \`short_stories_id\` IS NULL;`,
  )
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_posts_rels\` RENAME TO \`posts_rels\`;`)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_links_id_idx\` ON \`posts_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(
    sql`CREATE INDEX \`posts_rels_projects_id_idx\` ON \`posts_rels\` (\`projects_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`posts_rels_things_id_idx\` ON \`posts_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_videos_id_idx\` ON \`posts_rels\` (\`videos_id\`);`)
  await db.run(
    sql`CREATE INDEX \`posts_rels_categories_id_idx\` ON \`posts_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`posts_rels_tags_id_idx\` ON \`posts_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__posts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new__posts_v_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`_posts_v_rels\` WHERE \`short_stories_id\` IS NULL;`,
  )
  await db.run(sql`DROP TABLE \`_posts_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__posts_v_rels\` RENAME TO \`_posts_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_order_idx\` ON \`_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_parent_idx\` ON \`_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_path_idx\` ON \`_posts_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_links_id_idx\` ON \`_posts_v_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_posts_id_idx\` ON \`_posts_v_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_projects_id_idx\` ON \`_posts_v_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_things_id_idx\` ON \`_posts_v_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_videos_id_idx\` ON \`_posts_v_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_categories_id_idx\` ON \`_posts_v_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_posts_v_rels_tags_id_idx\` ON \`_posts_v_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_projects_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`projects_rels\` WHERE \`short_stories_id\` IS NULL;`,
  )
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_projects_rels\` RENAME TO \`projects_rels\`;`)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`projects_rels_links_id_idx\` ON \`projects_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_posts_id_idx\` ON \`projects_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_projects_id_idx\` ON \`projects_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_things_id_idx\` ON \`projects_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_videos_id_idx\` ON \`projects_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_categories_id_idx\` ON \`projects_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`projects_rels_tags_id_idx\` ON \`projects_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__projects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new__projects_v_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`_projects_v_rels\` WHERE \`short_stories_id\` IS NULL;`,
  )
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__projects_v_rels\` RENAME TO \`_projects_v_rels\`;`)
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_links_id_idx\` ON \`_projects_v_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_posts_id_idx\` ON \`_projects_v_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_projects_id_idx\` ON \`_projects_v_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_things_id_idx\` ON \`_projects_v_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_videos_id_idx\` ON \`_projects_v_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_categories_id_idx\` ON \`_projects_v_rels\` (\`categories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_tags_id_idx\` ON \`_projects_v_rels\` (\`tags_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`__new_pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_pages_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\` FROM \`pages_rels\` WHERE \`short_stories_id\` IS NULL;`,
  )
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_pages_rels\` RENAME TO \`pages_rels\`;`)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_links_id_idx\` ON \`pages_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`)
  await db.run(
    sql`CREATE INDEX \`pages_rels_projects_id_idx\` ON \`pages_rels\` (\`projects_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`pages_rels_things_id_idx\` ON \`pages_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_videos_id_idx\` ON \`pages_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new__pages_v_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\` FROM \`_pages_v_rels\` WHERE \`short_stories_id\` IS NULL;`,
  )
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new__pages_v_rels\` RENAME TO \`_pages_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_links_id_idx\` ON \`_pages_v_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_posts_id_idx\` ON \`_pages_v_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_projects_id_idx\` ON \`_pages_v_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_things_id_idx\` ON \`_pages_v_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_videos_id_idx\` ON \`_pages_v_rels\` (\`videos_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`inline_images_id\` integer,
  	\`authors_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`pages_id\` integer,
  	\`links_id\` integer,
  	\`contact_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inline_images_id\`) REFERENCES \`inline_images\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`inline_images_id\`, \`authors_id\`, \`categories_id\`, \`tags_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`pages_id\`, \`links_id\`, \`contact_submissions_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`inline_images_id\`, \`authors_id\`, \`categories_id\`, \`tags_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`pages_id\`, \`links_id\`, \`contact_submissions_id\` FROM \`payload_locked_documents_rels\` WHERE \`short_stories_id\` IS NULL;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_inline_images_id_idx\` ON \`payload_locked_documents_rels\` (\`inline_images_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_authors_id_idx\` ON \`payload_locked_documents_rels\` (\`authors_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_things_id_idx\` ON \`payload_locked_documents_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_videos_id_idx\` ON \`payload_locked_documents_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_links_id_idx\` ON \`payload_locked_documents_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`,
  )
  await db.run(sql`DROP TABLE \`posts_blocks_page_typewriter\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_page_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_page_typewriter\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_page_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`short_stories_locales\`;`)
  await db.run(sql`DROP TABLE \`_short_stories_v_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_page_typewriter\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_page_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_page_typewriter\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_page_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_page_typewriter\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_page_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_page_typewriter\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_page_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`_short_stories_v\`;`)
  await db.run(sql`DROP TABLE \`short_stories\`;`)
}

// Restores schema only. Removed stories and animation blocks are not recoverable.
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`posts_blocks_page_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`posts_blocks_page_typewriter_order_idx\` ON \`posts_blocks_page_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`posts_blocks_page_typewriter_parent_id_idx\` ON \`posts_blocks_page_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`posts_blocks_page_typewriter_path_idx\` ON \`posts_blocks_page_typewriter\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`posts_blocks_page_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`posts_blocks_page_scramble_hover_order_idx\` ON \`posts_blocks_page_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`posts_blocks_page_scramble_hover_parent_id_idx\` ON \`posts_blocks_page_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`posts_blocks_page_scramble_hover_path_idx\` ON \`posts_blocks_page_scramble_hover\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_page_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_posts_v_blocks_page_typewriter_order_idx\` ON \`_posts_v_blocks_page_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_blocks_page_typewriter_parent_id_idx\` ON \`_posts_v_blocks_page_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_blocks_page_typewriter_path_idx\` ON \`_posts_v_blocks_page_typewriter\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_page_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_posts_v_blocks_page_scramble_hover_order_idx\` ON \`_posts_v_blocks_page_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_blocks_page_scramble_hover_parent_id_idx\` ON \`_posts_v_blocks_page_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_blocks_page_scramble_hover_path_idx\` ON \`_posts_v_blocks_page_scramble_hover\` (\`_path\`);`,
  )
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
  await db.run(
    sql`CREATE UNIQUE INDEX \`short_stories_locales_locale_parent_id_unique\` ON \`short_stories_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
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
  await db.run(
    sql`CREATE UNIQUE INDEX \`_short_stories_v_locales_locale_parent_id_unique\` ON \`_short_stories_v_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`projects_blocks_page_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`projects_blocks_page_typewriter_order_idx\` ON \`projects_blocks_page_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_blocks_page_typewriter_parent_id_idx\` ON \`projects_blocks_page_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_blocks_page_typewriter_path_idx\` ON \`projects_blocks_page_typewriter\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`projects_blocks_page_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`projects_blocks_page_scramble_hover_order_idx\` ON \`projects_blocks_page_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_blocks_page_scramble_hover_parent_id_idx\` ON \`projects_blocks_page_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_blocks_page_scramble_hover_path_idx\` ON \`projects_blocks_page_scramble_hover\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_page_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_projects_v_blocks_page_typewriter_order_idx\` ON \`_projects_v_blocks_page_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_blocks_page_typewriter_parent_id_idx\` ON \`_projects_v_blocks_page_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_blocks_page_typewriter_path_idx\` ON \`_projects_v_blocks_page_typewriter\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_page_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_projects_v_blocks_page_scramble_hover_order_idx\` ON \`_projects_v_blocks_page_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_blocks_page_scramble_hover_parent_id_idx\` ON \`_projects_v_blocks_page_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_blocks_page_scramble_hover_path_idx\` ON \`_projects_v_blocks_page_scramble_hover\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`pages_blocks_page_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_page_typewriter_order_idx\` ON \`pages_blocks_page_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_page_typewriter_parent_id_idx\` ON \`pages_blocks_page_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_page_typewriter_path_idx\` ON \`pages_blocks_page_typewriter\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`pages_blocks_page_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`pages_blocks_page_scramble_hover_order_idx\` ON \`pages_blocks_page_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_page_scramble_hover_parent_id_idx\` ON \`pages_blocks_page_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`pages_blocks_page_scramble_hover_path_idx\` ON \`pages_blocks_page_scramble_hover\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_page_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_page_typewriter_order_idx\` ON \`_pages_v_blocks_page_typewriter\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_page_typewriter_parent_id_idx\` ON \`_pages_v_blocks_page_typewriter\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_page_typewriter_path_idx\` ON \`_pages_v_blocks_page_typewriter\` (\`_path\`);`,
  )
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_page_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_page_scramble_hover_order_idx\` ON \`_pages_v_blocks_page_scramble_hover\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_page_scramble_hover_parent_id_idx\` ON \`_pages_v_blocks_page_scramble_hover\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_blocks_page_scramble_hover_path_idx\` ON \`_pages_v_blocks_page_scramble_hover\` (\`_path\`);`,
  )
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_link_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_parent_idx\` ON \`_short_stories_v\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_version_image_idx\` ON \`_short_stories_v\` (\`version_image_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_link_version_link_page_idx\` ON \`_short_stories_v\` (\`version_link_page_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_version_published_at_idx\` ON \`_short_stories_v\` (\`version_published_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_version_owner_idx\` ON \`_short_stories_v\` (\`version_owner_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_version_updated_at_idx\` ON \`_short_stories_v\` (\`version_updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_version_created_at_idx\` ON \`_short_stories_v\` (\`version_created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_version_version__status_idx\` ON \`_short_stories_v\` (\`version__status\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_created_at_idx\` ON \`_short_stories_v\` (\`created_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_updated_at_idx\` ON \`_short_stories_v\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_snapshot_idx\` ON \`_short_stories_v\` (\`snapshot\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_published_locale_idx\` ON \`_short_stories_v\` (\`published_locale\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_short_stories_v_latest_idx\` ON \`_short_stories_v\` (\`latest\`);`,
  )
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
  await db.run(
    sql`CREATE INDEX \`short_stories_link_link_page_idx\` ON \`short_stories\` (\`link_page_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`short_stories_published_at_idx\` ON \`short_stories\` (\`published_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`short_stories_owner_idx\` ON \`short_stories\` (\`owner_id\`);`)
  await db.run(
    sql`CREATE INDEX \`short_stories_updated_at_idx\` ON \`short_stories\` (\`updated_at\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`short_stories_created_at_idx\` ON \`short_stories\` (\`created_at\`);`,
  )
  await db.run(sql`CREATE INDEX \`short_stories__status_idx\` ON \`short_stories\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`__old_posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`short_stories_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__old_posts_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`posts_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`ALTER TABLE \`__old_posts_rels\` RENAME TO \`posts_rels\`;`)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_links_id_idx\` ON \`posts_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(
    sql`CREATE INDEX \`posts_rels_projects_id_idx\` ON \`posts_rels\` (\`projects_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`posts_rels_things_id_idx\` ON \`posts_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_videos_id_idx\` ON \`posts_rels\` (\`videos_id\`);`)
  await db.run(
    sql`CREATE INDEX \`posts_rels_short_stories_id_idx\` ON \`posts_rels\` (\`short_stories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`posts_rels_categories_id_idx\` ON \`posts_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`posts_rels_tags_id_idx\` ON \`posts_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__old__posts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`short_stories_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__old__posts_v_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`_posts_v_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`_posts_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__old__posts_v_rels\` RENAME TO \`_posts_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_order_idx\` ON \`_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_parent_idx\` ON \`_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_path_idx\` ON \`_posts_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_links_id_idx\` ON \`_posts_v_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_posts_id_idx\` ON \`_posts_v_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_projects_id_idx\` ON \`_posts_v_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_things_id_idx\` ON \`_posts_v_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_videos_id_idx\` ON \`_posts_v_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_short_stories_id_idx\` ON \`_posts_v_rels\` (\`short_stories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_posts_v_rels_categories_id_idx\` ON \`_posts_v_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_posts_v_rels_tags_id_idx\` ON \`_posts_v_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__old_projects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`short_stories_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__old_projects_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`projects_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`ALTER TABLE \`__old_projects_rels\` RENAME TO \`projects_rels\`;`)
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`projects_rels_links_id_idx\` ON \`projects_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_posts_id_idx\` ON \`projects_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_projects_id_idx\` ON \`projects_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_things_id_idx\` ON \`projects_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_videos_id_idx\` ON \`projects_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_short_stories_id_idx\` ON \`projects_rels\` (\`short_stories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`projects_rels_categories_id_idx\` ON \`projects_rels\` (\`categories_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`projects_rels_tags_id_idx\` ON \`projects_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`__old__projects_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`short_stories_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__old__projects_v_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`categories_id\`, \`tags_id\` FROM \`_projects_v_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__old__projects_v_rels\` RENAME TO \`_projects_v_rels\`;`)
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_links_id_idx\` ON \`_projects_v_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_posts_id_idx\` ON \`_projects_v_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_projects_id_idx\` ON \`_projects_v_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_things_id_idx\` ON \`_projects_v_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_videos_id_idx\` ON \`_projects_v_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_short_stories_id_idx\` ON \`_projects_v_rels\` (\`short_stories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_categories_id_idx\` ON \`_projects_v_rels\` (\`categories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_projects_v_rels_tags_id_idx\` ON \`_projects_v_rels\` (\`tags_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`__old_pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`short_stories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__old_pages_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\` FROM \`pages_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`ALTER TABLE \`__old_pages_rels\` RENAME TO \`pages_rels\`;`)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_links_id_idx\` ON \`pages_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`)
  await db.run(
    sql`CREATE INDEX \`pages_rels_projects_id_idx\` ON \`pages_rels\` (\`projects_id\`);`,
  )
  await db.run(sql`CREATE INDEX \`pages_rels_things_id_idx\` ON \`pages_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_videos_id_idx\` ON \`pages_rels\` (\`videos_id\`);`)
  await db.run(
    sql`CREATE INDEX \`pages_rels_short_stories_id_idx\` ON \`pages_rels\` (\`short_stories_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`__old__pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	\`posts_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`short_stories_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__old__pages_v_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`links_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\` FROM \`_pages_v_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`ALTER TABLE \`__old__pages_v_rels\` RENAME TO \`_pages_v_rels\`;`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_links_id_idx\` ON \`_pages_v_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_posts_id_idx\` ON \`_pages_v_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_projects_id_idx\` ON \`_pages_v_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_things_id_idx\` ON \`_pages_v_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_videos_id_idx\` ON \`_pages_v_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`_pages_v_rels_short_stories_id_idx\` ON \`_pages_v_rels\` (\`short_stories_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`__old_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`inline_images_id\` integer,
  	\`authors_id\` integer,
  	\`categories_id\` integer,
  	\`tags_id\` integer,
  	\`posts_id\` integer,
  	\`short_stories_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`pages_id\` integer,
  	\`links_id\` integer,
  	\`contact_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inline_images_id\`) REFERENCES \`inline_images\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__old_payload_locked_documents_rels\` (\`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`inline_images_id\`, \`authors_id\`, \`categories_id\`, \`tags_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`pages_id\`, \`links_id\`, \`contact_submissions_id\`) SELECT \`id\`, \`order\`, \`parent_id\`, \`path\`, \`users_id\`, \`media_id\`, \`inline_images_id\`, \`authors_id\`, \`categories_id\`, \`tags_id\`, \`posts_id\`, \`projects_id\`, \`things_id\`, \`videos_id\`, \`pages_id\`, \`links_id\`, \`contact_submissions_id\` FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__old_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_inline_images_id_idx\` ON \`payload_locked_documents_rels\` (\`inline_images_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_authors_id_idx\` ON \`payload_locked_documents_rels\` (\`authors_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_short_stories_id_idx\` ON \`payload_locked_documents_rels\` (\`short_stories_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_things_id_idx\` ON \`payload_locked_documents_rels\` (\`things_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_videos_id_idx\` ON \`payload_locked_documents_rels\` (\`videos_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_links_id_idx\` ON \`payload_locked_documents_rels\` (\`links_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`,
  )
}
