import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'creator' NOT NULL,
  	\`active\` integer DEFAULT true,
  	\`avatar_id\` integer,
  	\`internal_notes\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`users_avatar_idx\` ON \`users\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`kind\` text DEFAULT 'image',
  	\`source_url\` text,
  	\`dominant_color\` text,
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
  );
  `)
  await db.run(sql`CREATE INDEX \`media_uploaded_by_idx\` ON \`media\` (\`uploaded_by_id\`);`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`credit\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`authors_social_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`authors_social_links_order_idx\` ON \`authors_social_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`authors_social_links_parent_id_idx\` ON \`authors_social_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`authors_social_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`authors_social_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`authors_social_links_locales_locale_parent_id_unique\` ON \`authors_social_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`authors\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`avatar_id\` integer,
  	\`website\` text,
  	\`user_id\` integer,
  	\`approved\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`authors_avatar_idx\` ON \`authors\` (\`avatar_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`authors_user_idx\` ON \`authors\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`authors_updated_at_idx\` ON \`authors\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`authors_created_at_idx\` ON \`authors\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`authors_locales\` (
  	\`display_name\` text NOT NULL,
  	\`job_title\` text,
  	\`bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`authors_locales_locale_parent_id_unique\` ON \`authors_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`color\` text,
  	\`icon_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`icon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`categories_icon_idx\` ON \`categories\` (\`icon_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`categories_locales\` (
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_locales_locale_parent_id_unique\` ON \`categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tags\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`tags_updated_at_idx\` ON \`tags\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tags_created_at_idx\` ON \`tags\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`tags_locales\` (
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`tags_slug_idx\` ON \`tags_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`tags_locales_locale_parent_id_unique\` ON \`tags_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_hero_order_idx\` ON \`posts_blocks_layout_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_hero_parent_id_idx\` ON \`posts_blocks_layout_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_hero_path_idx\` ON \`posts_blocks_layout_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_hero_hero_image_idx\` ON \`posts_blocks_layout_hero\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_layout_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_blocks_layout_hero_locales_locale_parent_id_unique\` ON \`posts_blocks_layout_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`pagination\` text DEFAULT 'static',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_page_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_feed_section_order_idx\` ON \`posts_blocks_layout_feed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_feed_section_parent_id_idx\` ON \`posts_blocks_layout_feed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_feed_section_path_idx\` ON \`posts_blocks_layout_feed_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_feed_section_view_all_page_idx\` ON \`posts_blocks_layout_feed_section\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_feed_section_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_empty\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_layout_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_blocks_layout_feed_section_locales_locale_parent_id_un\` ON \`posts_blocks_layout_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_rich_text_without_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_rich_text_without_block_order_idx\` ON \`posts_blocks_layout_rich_text_without_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_rich_text_without_block_parent_id_idx\` ON \`posts_blocks_layout_rich_text_without_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_rich_text_without_block_path_idx\` ON \`posts_blocks_layout_rich_text_without_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_rich_text_without_block_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_layout_rich_text_without_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_blocks_layout_rich_text_without_block_locales_locale_p\` ON \`posts_blocks_layout_rich_text_without_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_content_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_media_order_idx\` ON \`posts_blocks_content_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_media_parent_id_idx\` ON \`posts_blocks_content_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_media_path_idx\` ON \`posts_blocks_content_media\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_media_media_idx\` ON \`posts_blocks_content_media\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_content_media_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_content_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_blocks_content_media_locales_locale_parent_id_unique\` ON \`posts_blocks_content_media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_content_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_content_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_gallery_items_order_idx\` ON \`posts_blocks_content_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_gallery_items_parent_id_idx\` ON \`posts_blocks_content_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_gallery_items_image_idx\` ON \`posts_blocks_content_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_content_gallery_items_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_content_gallery_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_blocks_content_gallery_items_locales_locale_parent_id_\` ON \`posts_blocks_content_gallery_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_content_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_gallery_order_idx\` ON \`posts_blocks_content_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_gallery_parent_id_idx\` ON \`posts_blocks_content_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_content_gallery_path_idx\` ON \`posts_blocks_content_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_related_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`collection\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 3,
  	\`show_view_all\` integer DEFAULT false,
  	\`view_all_page_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_related_items_order_idx\` ON \`posts_blocks_layout_related_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_related_items_parent_id_idx\` ON \`posts_blocks_layout_related_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_related_items_path_idx\` ON \`posts_blocks_layout_related_items\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_related_items_view_all_page_idx\` ON \`posts_blocks_layout_related_items\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_related_items_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_layout_related_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_blocks_layout_related_items_locales_locale_parent_id_u\` ON \`posts_blocks_layout_related_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_typewriter_order_idx\` ON \`posts_blocks_layout_typewriter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_typewriter_parent_id_idx\` ON \`posts_blocks_layout_typewriter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_typewriter_path_idx\` ON \`posts_blocks_layout_typewriter\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_scramble_hover_order_idx\` ON \`posts_blocks_layout_scramble_hover\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_scramble_hover_parent_id_idx\` ON \`posts_blocks_layout_scramble_hover\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_scramble_hover_path_idx\` ON \`posts_blocks_layout_scramble_hover\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_blank_space\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT '60vh',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_blank_space_order_idx\` ON \`posts_blocks_layout_blank_space\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_blank_space_parent_id_idx\` ON \`posts_blocks_layout_blank_space\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_blank_space_path_idx\` ON \`posts_blocks_layout_blank_space\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_footer_order_idx\` ON \`posts_blocks_layout_footer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_footer_parent_id_idx\` ON \`posts_blocks_layout_footer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_blocks_layout_footer_path_idx\` ON \`posts_blocks_layout_footer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`posts_blocks_layout_footer_locales\` (
  	\`footer_text\` text,
  	\`copyright\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts_blocks_layout_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_blocks_layout_footer_locales_locale_parent_id_unique\` ON \`posts_blocks_layout_footer_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`featured_image_id\` integer,
  	\`seo_canonical_url\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`seo_no_index\` integer DEFAULT false,
  	\`seo_no_follow\` integer DEFAULT false,
  	\`seo_structured_data_json_ld_override\` text,
  	\`author_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`reading_time\` numeric,
  	\`published_at\` text,
  	\`original_published_at\` text,
  	\`owner_id\` integer,
  	\`translation_ready_vi\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_featured_image_idx\` ON \`posts\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_seo_seo_og_image_idx\` ON \`posts\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_author_idx\` ON \`posts\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_published_at_idx\` ON \`posts\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_owner_idx\` ON \`posts\` (\`owner_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`posts__status_idx\` ON \`posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`posts_locales\` (
  	\`title\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`excerpt\` text,
  	\`content\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_title\` text,
  	\`seo_og_description\` text,
  	\`seo_structured_data_headline\` text,
  	\`seo_structured_data_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_locales_locale_parent_id_unique\` ON \`posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_rels\` (
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
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_links_id_idx\` ON \`posts_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_projects_id_idx\` ON \`posts_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_things_id_idx\` ON \`posts_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_videos_id_idx\` ON \`posts_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_short_stories_id_idx\` ON \`posts_rels\` (\`short_stories_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_categories_id_idx\` ON \`posts_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_tags_id_idx\` ON \`posts_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_hero_order_idx\` ON \`_posts_v_blocks_layout_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_hero_parent_id_idx\` ON \`_posts_v_blocks_layout_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_hero_path_idx\` ON \`_posts_v_blocks_layout_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_hero_hero_image_idx\` ON \`_posts_v_blocks_layout_hero\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_layout_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_blocks_layout_hero_locales_locale_parent_id_unique\` ON \`_posts_v_blocks_layout_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`pagination\` text DEFAULT 'static',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_page_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_feed_section_order_idx\` ON \`_posts_v_blocks_layout_feed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_feed_section_parent_id_idx\` ON \`_posts_v_blocks_layout_feed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_feed_section_path_idx\` ON \`_posts_v_blocks_layout_feed_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_feed_section_view_all_page_idx\` ON \`_posts_v_blocks_layout_feed_section\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_feed_section_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_empty\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_layout_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_blocks_layout_feed_section_locales_locale_parent_id\` ON \`_posts_v_blocks_layout_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_rich_text_without_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_rich_text_without_block_order_idx\` ON \`_posts_v_blocks_layout_rich_text_without_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_rich_text_without_block_parent_id_idx\` ON \`_posts_v_blocks_layout_rich_text_without_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_rich_text_without_block_path_idx\` ON \`_posts_v_blocks_layout_rich_text_without_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_rich_text_without_block_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_layout_rich_text_without_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_blocks_layout_rich_text_without_block_locales_local\` ON \`_posts_v_blocks_layout_rich_text_without_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_content_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_media_order_idx\` ON \`_posts_v_blocks_content_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_media_parent_id_idx\` ON \`_posts_v_blocks_content_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_media_path_idx\` ON \`_posts_v_blocks_content_media\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_media_media_idx\` ON \`_posts_v_blocks_content_media\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_content_media_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_content_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_blocks_content_media_locales_locale_parent_id_uniqu\` ON \`_posts_v_blocks_content_media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_content_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_content_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_gallery_items_order_idx\` ON \`_posts_v_blocks_content_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_gallery_items_parent_id_idx\` ON \`_posts_v_blocks_content_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_gallery_items_image_idx\` ON \`_posts_v_blocks_content_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_content_gallery_items_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_content_gallery_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_blocks_content_gallery_items_locales_locale_parent_\` ON \`_posts_v_blocks_content_gallery_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_content_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_gallery_order_idx\` ON \`_posts_v_blocks_content_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_gallery_parent_id_idx\` ON \`_posts_v_blocks_content_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_content_gallery_path_idx\` ON \`_posts_v_blocks_content_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_related_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`collection\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 3,
  	\`show_view_all\` integer DEFAULT false,
  	\`view_all_page_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_related_items_order_idx\` ON \`_posts_v_blocks_layout_related_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_related_items_parent_id_idx\` ON \`_posts_v_blocks_layout_related_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_related_items_path_idx\` ON \`_posts_v_blocks_layout_related_items\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_related_items_view_all_page_idx\` ON \`_posts_v_blocks_layout_related_items\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_related_items_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_layout_related_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_blocks_layout_related_items_locales_locale_parent_i\` ON \`_posts_v_blocks_layout_related_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_typewriter_order_idx\` ON \`_posts_v_blocks_layout_typewriter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_typewriter_parent_id_idx\` ON \`_posts_v_blocks_layout_typewriter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_typewriter_path_idx\` ON \`_posts_v_blocks_layout_typewriter\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_scramble_hover_order_idx\` ON \`_posts_v_blocks_layout_scramble_hover\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_scramble_hover_parent_id_idx\` ON \`_posts_v_blocks_layout_scramble_hover\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_scramble_hover_path_idx\` ON \`_posts_v_blocks_layout_scramble_hover\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_blank_space\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT '60vh',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_blank_space_order_idx\` ON \`_posts_v_blocks_layout_blank_space\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_blank_space_parent_id_idx\` ON \`_posts_v_blocks_layout_blank_space\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_blank_space_path_idx\` ON \`_posts_v_blocks_layout_blank_space\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_footer_order_idx\` ON \`_posts_v_blocks_layout_footer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_footer_parent_id_idx\` ON \`_posts_v_blocks_layout_footer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_blocks_layout_footer_path_idx\` ON \`_posts_v_blocks_layout_footer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_blocks_layout_footer_locales\` (
  	\`footer_text\` text,
  	\`copyright\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v_blocks_layout_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_blocks_layout_footer_locales_locale_parent_id_uniqu\` ON \`_posts_v_blocks_layout_footer_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_featured_image_id\` integer,
  	\`version_seo_canonical_url\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`version_seo_no_index\` integer DEFAULT false,
  	\`version_seo_no_follow\` integer DEFAULT false,
  	\`version_seo_structured_data_json_ld_override\` text,
  	\`version_author_id\` integer,
  	\`version_featured\` integer DEFAULT false,
  	\`version_reading_time\` numeric,
  	\`version_published_at\` text,
  	\`version_original_published_at\` text,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_author_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_parent_idx\` ON \`_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_featured_image_idx\` ON \`_posts_v\` (\`version_featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_seo_version_seo_og_image_idx\` ON \`_posts_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_author_idx\` ON \`_posts_v\` (\`version_author_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_published_at_idx\` ON \`_posts_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_owner_idx\` ON \`_posts_v\` (\`version_owner_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_updated_at_idx\` ON \`_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_created_at_idx\` ON \`_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version__status_idx\` ON \`_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_created_at_idx\` ON \`_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_updated_at_idx\` ON \`_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_snapshot_idx\` ON \`_posts_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_published_locale_idx\` ON \`_posts_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_latest_idx\` ON \`_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_locales\` (
  	\`version_title\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_excerpt\` text,
  	\`version_content\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_title\` text,
  	\`version_seo_og_description\` text,
  	\`version_seo_structured_data_headline\` text,
  	\`version_seo_structured_data_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_slug_idx\` ON \`_posts_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_posts_v_locales_locale_parent_id_unique\` ON \`_posts_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_rels\` (
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
  await db.run(sql`CREATE INDEX \`_posts_v_rels_order_idx\` ON \`_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_parent_idx\` ON \`_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_path_idx\` ON \`_posts_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_links_id_idx\` ON \`_posts_v_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_posts_id_idx\` ON \`_posts_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_projects_id_idx\` ON \`_posts_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_things_id_idx\` ON \`_posts_v_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_videos_id_idx\` ON \`_posts_v_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_short_stories_id_idx\` ON \`_posts_v_rels\` (\`short_stories_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_categories_id_idx\` ON \`_posts_v_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_tags_id_idx\` ON \`_posts_v_rels\` (\`tags_id\`);`)
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
  await db.run(sql`CREATE INDEX \`short_stories_published_at_idx\` ON \`short_stories\` (\`published_at\`);`)
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
  await db.run(sql`CREATE INDEX \`_short_stories_v_parent_idx\` ON \`_short_stories_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_image_idx\` ON \`_short_stories_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_link_version_link_page_idx\` ON \`_short_stories_v\` (\`version_link_page_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_published_at_idx\` ON \`_short_stories_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_owner_idx\` ON \`_short_stories_v\` (\`version_owner_id\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_updated_at_idx\` ON \`_short_stories_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version_created_at_idx\` ON \`_short_stories_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_version_version__status_idx\` ON \`_short_stories_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_created_at_idx\` ON \`_short_stories_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_updated_at_idx\` ON \`_short_stories_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_snapshot_idx\` ON \`_short_stories_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_published_locale_idx\` ON \`_short_stories_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_short_stories_v_latest_idx\` ON \`_short_stories_v\` (\`latest\`);`)
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
  );
  `)
  await db.run(sql`CREATE INDEX \`feed_decorations_uploaded_by_idx\` ON \`feed_decorations\` (\`uploaded_by_id\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_updated_at_idx\` ON \`feed_decorations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`feed_decorations_created_at_idx\` ON \`feed_decorations\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`feed_decorations_filename_idx\` ON \`feed_decorations\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`decoration_packs_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`file_id\` integer NOT NULL,
  	\`weight\` numeric DEFAULT 1,
  	FOREIGN KEY (\`file_id\`) REFERENCES \`feed_decorations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`decoration_packs_items_order_idx\` ON \`decoration_packs_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`decoration_packs_items_parent_id_idx\` ON \`decoration_packs_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`decoration_packs_items_file_idx\` ON \`decoration_packs_items\` (\`file_id\`);`)
  await db.run(sql`CREATE TABLE \`decoration_packs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`footer_item\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`decoration_packs_slug_idx\` ON \`decoration_packs\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`decoration_packs_updated_at_idx\` ON \`decoration_packs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`decoration_packs_created_at_idx\` ON \`decoration_packs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_hero_order_idx\` ON \`projects_blocks_layout_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_hero_parent_id_idx\` ON \`projects_blocks_layout_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_hero_path_idx\` ON \`projects_blocks_layout_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_hero_hero_image_idx\` ON \`projects_blocks_layout_hero\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_layout_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_layout_hero_locales_locale_parent_id_unique\` ON \`projects_blocks_layout_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`pagination\` text DEFAULT 'static',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_page_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_feed_section_order_idx\` ON \`projects_blocks_layout_feed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_feed_section_parent_id_idx\` ON \`projects_blocks_layout_feed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_feed_section_path_idx\` ON \`projects_blocks_layout_feed_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_feed_section_view_all_page_idx\` ON \`projects_blocks_layout_feed_section\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_feed_section_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_empty\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_layout_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_layout_feed_section_locales_locale_parent_id\` ON \`projects_blocks_layout_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_rich_text_without_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_rich_text_without_block_order_idx\` ON \`projects_blocks_layout_rich_text_without_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_rich_text_without_block_parent_id_idx\` ON \`projects_blocks_layout_rich_text_without_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_rich_text_without_block_path_idx\` ON \`projects_blocks_layout_rich_text_without_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_rich_text_without_block_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_layout_rich_text_without_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_layout_rich_text_without_block_locales_local\` ON \`projects_blocks_layout_rich_text_without_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_content_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_media_order_idx\` ON \`projects_blocks_content_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_media_parent_id_idx\` ON \`projects_blocks_content_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_media_path_idx\` ON \`projects_blocks_content_media\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_media_media_idx\` ON \`projects_blocks_content_media\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_content_media_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_content_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_content_media_locales_locale_parent_id_uniqu\` ON \`projects_blocks_content_media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_content_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_content_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_gallery_items_order_idx\` ON \`projects_blocks_content_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_gallery_items_parent_id_idx\` ON \`projects_blocks_content_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_gallery_items_image_idx\` ON \`projects_blocks_content_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_content_gallery_items_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_content_gallery_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_content_gallery_items_locales_locale_parent_\` ON \`projects_blocks_content_gallery_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_content_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_gallery_order_idx\` ON \`projects_blocks_content_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_gallery_parent_id_idx\` ON \`projects_blocks_content_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_content_gallery_path_idx\` ON \`projects_blocks_content_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_related_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`collection\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 3,
  	\`show_view_all\` integer DEFAULT false,
  	\`view_all_page_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_related_items_order_idx\` ON \`projects_blocks_layout_related_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_related_items_parent_id_idx\` ON \`projects_blocks_layout_related_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_related_items_path_idx\` ON \`projects_blocks_layout_related_items\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_related_items_view_all_page_idx\` ON \`projects_blocks_layout_related_items\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_related_items_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_layout_related_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_layout_related_items_locales_locale_parent_i\` ON \`projects_blocks_layout_related_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_typewriter_order_idx\` ON \`projects_blocks_layout_typewriter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_typewriter_parent_id_idx\` ON \`projects_blocks_layout_typewriter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_typewriter_path_idx\` ON \`projects_blocks_layout_typewriter\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_scramble_hover_order_idx\` ON \`projects_blocks_layout_scramble_hover\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_scramble_hover_parent_id_idx\` ON \`projects_blocks_layout_scramble_hover\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_scramble_hover_path_idx\` ON \`projects_blocks_layout_scramble_hover\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_blank_space\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT '60vh',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_blank_space_order_idx\` ON \`projects_blocks_layout_blank_space\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_blank_space_parent_id_idx\` ON \`projects_blocks_layout_blank_space\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_blank_space_path_idx\` ON \`projects_blocks_layout_blank_space\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_footer_order_idx\` ON \`projects_blocks_layout_footer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_footer_parent_id_idx\` ON \`projects_blocks_layout_footer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_blocks_layout_footer_path_idx\` ON \`projects_blocks_layout_footer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`projects_blocks_layout_footer_locales\` (
  	\`footer_text\` text,
  	\`copyright\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_blocks_layout_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_blocks_layout_footer_locales_locale_parent_id_uniqu\` ON \`projects_blocks_layout_footer_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`featured_image_id\` integer,
  	\`seo_canonical_url\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`seo_no_index\` integer DEFAULT false,
  	\`seo_no_follow\` integer DEFAULT false,
  	\`author_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`published_at\` text,
  	\`owner_id\` integer,
  	\`translation_ready_vi\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_featured_image_idx\` ON \`projects\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_seo_seo_og_image_idx\` ON \`projects\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_author_idx\` ON \`projects\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_published_at_idx\` ON \`projects\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_owner_idx\` ON \`projects\` (\`owner_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`projects__status_idx\` ON \`projects\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`projects_locales\` (
  	\`title\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`summary\` text,
  	\`content\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_title\` text,
  	\`seo_og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_locales_locale_parent_id_unique\` ON \`projects_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_rels\` (
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
  await db.run(sql`CREATE INDEX \`projects_rels_order_idx\` ON \`projects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_parent_idx\` ON \`projects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_path_idx\` ON \`projects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_links_id_idx\` ON \`projects_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_posts_id_idx\` ON \`projects_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_projects_id_idx\` ON \`projects_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_things_id_idx\` ON \`projects_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_videos_id_idx\` ON \`projects_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_short_stories_id_idx\` ON \`projects_rels\` (\`short_stories_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_categories_id_idx\` ON \`projects_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_rels_tags_id_idx\` ON \`projects_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_hero_order_idx\` ON \`_projects_v_blocks_layout_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_hero_parent_id_idx\` ON \`_projects_v_blocks_layout_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_hero_path_idx\` ON \`_projects_v_blocks_layout_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_hero_hero_image_idx\` ON \`_projects_v_blocks_layout_hero\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_layout_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_layout_hero_locales_locale_parent_id_uniq\` ON \`_projects_v_blocks_layout_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`pagination\` text DEFAULT 'static',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_page_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_feed_section_order_idx\` ON \`_projects_v_blocks_layout_feed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_feed_section_parent_id_idx\` ON \`_projects_v_blocks_layout_feed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_feed_section_path_idx\` ON \`_projects_v_blocks_layout_feed_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_feed_section_view_all_page_idx\` ON \`_projects_v_blocks_layout_feed_section\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_feed_section_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_empty\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_layout_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_layout_feed_section_locales_locale_parent\` ON \`_projects_v_blocks_layout_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_rich_text_without_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_rich_text_without_block_order_idx\` ON \`_projects_v_blocks_layout_rich_text_without_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_rich_text_without_block_parent_id_idx\` ON \`_projects_v_blocks_layout_rich_text_without_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_rich_text_without_block_path_idx\` ON \`_projects_v_blocks_layout_rich_text_without_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_rich_text_without_block_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_layout_rich_text_without_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_layout_rich_text_without_block_locales_lo\` ON \`_projects_v_blocks_layout_rich_text_without_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_content_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_media_order_idx\` ON \`_projects_v_blocks_content_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_media_parent_id_idx\` ON \`_projects_v_blocks_content_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_media_path_idx\` ON \`_projects_v_blocks_content_media\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_media_media_idx\` ON \`_projects_v_blocks_content_media\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_content_media_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_content_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_content_media_locales_locale_parent_id_un\` ON \`_projects_v_blocks_content_media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_content_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_content_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_gallery_items_order_idx\` ON \`_projects_v_blocks_content_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_gallery_items_parent_id_idx\` ON \`_projects_v_blocks_content_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_gallery_items_image_idx\` ON \`_projects_v_blocks_content_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_content_gallery_items_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_content_gallery_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_content_gallery_items_locales_locale_pare\` ON \`_projects_v_blocks_content_gallery_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_content_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_gallery_order_idx\` ON \`_projects_v_blocks_content_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_gallery_parent_id_idx\` ON \`_projects_v_blocks_content_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_content_gallery_path_idx\` ON \`_projects_v_blocks_content_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_related_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`collection\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 3,
  	\`show_view_all\` integer DEFAULT false,
  	\`view_all_page_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_related_items_order_idx\` ON \`_projects_v_blocks_layout_related_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_related_items_parent_id_idx\` ON \`_projects_v_blocks_layout_related_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_related_items_path_idx\` ON \`_projects_v_blocks_layout_related_items\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_related_items_view_all_page_idx\` ON \`_projects_v_blocks_layout_related_items\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_related_items_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_layout_related_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_layout_related_items_locales_locale_paren\` ON \`_projects_v_blocks_layout_related_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_typewriter_order_idx\` ON \`_projects_v_blocks_layout_typewriter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_typewriter_parent_id_idx\` ON \`_projects_v_blocks_layout_typewriter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_typewriter_path_idx\` ON \`_projects_v_blocks_layout_typewriter\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_scramble_hover_order_idx\` ON \`_projects_v_blocks_layout_scramble_hover\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_scramble_hover_parent_id_idx\` ON \`_projects_v_blocks_layout_scramble_hover\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_scramble_hover_path_idx\` ON \`_projects_v_blocks_layout_scramble_hover\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_blank_space\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT '60vh',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_blank_space_order_idx\` ON \`_projects_v_blocks_layout_blank_space\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_blank_space_parent_id_idx\` ON \`_projects_v_blocks_layout_blank_space\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_blank_space_path_idx\` ON \`_projects_v_blocks_layout_blank_space\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_footer_order_idx\` ON \`_projects_v_blocks_layout_footer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_footer_parent_id_idx\` ON \`_projects_v_blocks_layout_footer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_blocks_layout_footer_path_idx\` ON \`_projects_v_blocks_layout_footer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_blocks_layout_footer_locales\` (
  	\`footer_text\` text,
  	\`copyright\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_blocks_layout_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_blocks_layout_footer_locales_locale_parent_id_un\` ON \`_projects_v_blocks_layout_footer_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_featured_image_id\` integer,
  	\`version_seo_canonical_url\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`version_seo_no_index\` integer DEFAULT false,
  	\`version_seo_no_follow\` integer DEFAULT false,
  	\`version_author_id\` integer,
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_author_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_parent_idx\` ON \`_projects_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_featured_image_idx\` ON \`_projects_v\` (\`version_featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_seo_version_seo_og_image_idx\` ON \`_projects_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_author_idx\` ON \`_projects_v\` (\`version_author_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_published_at_idx\` ON \`_projects_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_owner_idx\` ON \`_projects_v\` (\`version_owner_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_updated_at_idx\` ON \`_projects_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_created_at_idx\` ON \`_projects_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__status_idx\` ON \`_projects_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_created_at_idx\` ON \`_projects_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_updated_at_idx\` ON \`_projects_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_snapshot_idx\` ON \`_projects_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_published_locale_idx\` ON \`_projects_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_latest_idx\` ON \`_projects_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_locales\` (
  	\`version_title\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_summary\` text,
  	\`version_content\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_title\` text,
  	\`version_seo_og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_slug_idx\` ON \`_projects_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_locales_locale_parent_id_unique\` ON \`_projects_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_rels\` (
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
  await db.run(sql`CREATE INDEX \`_projects_v_rels_order_idx\` ON \`_projects_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_parent_idx\` ON \`_projects_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_path_idx\` ON \`_projects_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_links_id_idx\` ON \`_projects_v_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_posts_id_idx\` ON \`_projects_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_projects_id_idx\` ON \`_projects_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_things_id_idx\` ON \`_projects_v_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_videos_id_idx\` ON \`_projects_v_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_short_stories_id_idx\` ON \`_projects_v_rels\` (\`short_stories_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_categories_id_idx\` ON \`_projects_v_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_rels_tags_id_idx\` ON \`_projects_v_rels\` (\`tags_id\`);`)
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
  );
  `)
  await db.run(sql`CREATE INDEX \`things_primary_image_idx\` ON \`things\` (\`primary_image_id\`);`)
  await db.run(sql`CREATE INDEX \`things_detail_image_idx\` ON \`things\` (\`detail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`things_published_at_idx\` ON \`things\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`things_owner_idx\` ON \`things\` (\`owner_id\`);`)
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
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`things_locales_locale_parent_id_unique\` ON \`things_locales\` (\`_locale\`,\`_parent_id\`);`)
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_primary_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_detail_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_things_v_parent_idx\` ON \`_things_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_version_primary_image_idx\` ON \`_things_v\` (\`version_primary_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_version_detail_image_idx\` ON \`_things_v\` (\`version_detail_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_version_published_at_idx\` ON \`_things_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_version_owner_idx\` ON \`_things_v\` (\`version_owner_id\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_version_updated_at_idx\` ON \`_things_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_version_created_at_idx\` ON \`_things_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_version__status_idx\` ON \`_things_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_created_at_idx\` ON \`_things_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_updated_at_idx\` ON \`_things_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_snapshot_idx\` ON \`_things_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_published_locale_idx\` ON \`_things_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_latest_idx\` ON \`_things_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_things_v_locales\` (
  	\`version_name\` text,
  	\`version_description\` text,
  	\`version_affiliate_url\` text,
  	\`version_link_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_things_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_things_v_locales_locale_parent_id_unique\` ON \`_things_v_locales\` (\`_locale\`,\`_parent_id\`);`)
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
  );
  `)
  await db.run(sql`CREATE INDEX \`videos_thumbnail_idx\` ON \`videos\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`videos_published_at_idx\` ON \`videos\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`videos_owner_idx\` ON \`videos\` (\`owner_id\`);`)
  await db.run(sql`CREATE INDEX \`videos_updated_at_idx\` ON \`videos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`videos_created_at_idx\` ON \`videos\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`videos__status_idx\` ON \`videos\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`videos_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`videos_locales_locale_parent_id_unique\` ON \`videos_locales\` (\`_locale\`,\`_parent_id\`);`)
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
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_videos_v_parent_idx\` ON \`_videos_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_version_version_thumbnail_idx\` ON \`_videos_v\` (\`version_thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_version_version_published_at_idx\` ON \`_videos_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_version_version_owner_idx\` ON \`_videos_v\` (\`version_owner_id\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_version_version_updated_at_idx\` ON \`_videos_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_version_version_created_at_idx\` ON \`_videos_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_version_version__status_idx\` ON \`_videos_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_created_at_idx\` ON \`_videos_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_updated_at_idx\` ON \`_videos_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_snapshot_idx\` ON \`_videos_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_published_locale_idx\` ON \`_videos_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_videos_v_latest_idx\` ON \`_videos_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_videos_v_locales\` (
  	\`version_title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_videos_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_videos_v_locales_locale_parent_id_unique\` ON \`_videos_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_hero_order_idx\` ON \`pages_blocks_layout_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_hero_parent_id_idx\` ON \`pages_blocks_layout_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_hero_path_idx\` ON \`pages_blocks_layout_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_hero_hero_image_idx\` ON \`pages_blocks_layout_hero\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_layout_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_layout_hero_locales_locale_parent_id_unique\` ON \`pages_blocks_layout_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`pagination\` text DEFAULT 'static',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_page_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_feed_section_order_idx\` ON \`pages_blocks_layout_feed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_feed_section_parent_id_idx\` ON \`pages_blocks_layout_feed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_feed_section_path_idx\` ON \`pages_blocks_layout_feed_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_feed_section_view_all_page_idx\` ON \`pages_blocks_layout_feed_section\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_feed_section_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_empty\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_layout_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_layout_feed_section_locales_locale_parent_id_un\` ON \`pages_blocks_layout_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_rich_text_without_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_rich_text_without_block_order_idx\` ON \`pages_blocks_layout_rich_text_without_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_rich_text_without_block_parent_id_idx\` ON \`pages_blocks_layout_rich_text_without_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_rich_text_without_block_path_idx\` ON \`pages_blocks_layout_rich_text_without_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_rich_text_without_block_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_layout_rich_text_without_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_layout_rich_text_without_block_locales_locale_p\` ON \`pages_blocks_layout_rich_text_without_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_media_order_idx\` ON \`pages_blocks_content_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_media_parent_id_idx\` ON \`pages_blocks_content_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_media_path_idx\` ON \`pages_blocks_content_media\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_media_media_idx\` ON \`pages_blocks_content_media\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_media_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_content_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_content_media_locales_locale_parent_id_unique\` ON \`pages_blocks_content_media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_content_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_gallery_items_order_idx\` ON \`pages_blocks_content_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_gallery_items_parent_id_idx\` ON \`pages_blocks_content_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_gallery_items_image_idx\` ON \`pages_blocks_content_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_gallery_items_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_content_gallery_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_content_gallery_items_locales_locale_parent_id_\` ON \`pages_blocks_content_gallery_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_gallery_order_idx\` ON \`pages_blocks_content_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_gallery_parent_id_idx\` ON \`pages_blocks_content_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_gallery_path_idx\` ON \`pages_blocks_content_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_related_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`collection\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 3,
  	\`show_view_all\` integer DEFAULT false,
  	\`view_all_page_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_related_items_order_idx\` ON \`pages_blocks_layout_related_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_related_items_parent_id_idx\` ON \`pages_blocks_layout_related_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_related_items_path_idx\` ON \`pages_blocks_layout_related_items\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_related_items_view_all_page_idx\` ON \`pages_blocks_layout_related_items\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_related_items_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_layout_related_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_layout_related_items_locales_locale_parent_id_u\` ON \`pages_blocks_layout_related_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_typewriter_order_idx\` ON \`pages_blocks_layout_typewriter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_typewriter_parent_id_idx\` ON \`pages_blocks_layout_typewriter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_typewriter_path_idx\` ON \`pages_blocks_layout_typewriter\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_scramble_hover_order_idx\` ON \`pages_blocks_layout_scramble_hover\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_scramble_hover_parent_id_idx\` ON \`pages_blocks_layout_scramble_hover\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_scramble_hover_path_idx\` ON \`pages_blocks_layout_scramble_hover\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_blank_space\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT '60vh',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_blank_space_order_idx\` ON \`pages_blocks_layout_blank_space\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_blank_space_parent_id_idx\` ON \`pages_blocks_layout_blank_space\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_blank_space_path_idx\` ON \`pages_blocks_layout_blank_space\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_footer_order_idx\` ON \`pages_blocks_layout_footer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_footer_parent_id_idx\` ON \`pages_blocks_layout_footer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_layout_footer_path_idx\` ON \`pages_blocks_layout_footer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_layout_footer_locales\` (
  	\`footer_text\` text,
  	\`copyright\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_layout_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_layout_footer_locales_locale_parent_id_unique\` ON \`pages_blocks_layout_footer_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`page_image_id\` integer,
  	\`seo_canonical_url\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`seo_no_index\` integer DEFAULT false,
  	\`seo_no_follow\` integer DEFAULT false,
  	\`template\` text DEFAULT 'generic',
  	\`published_at\` text,
  	\`translation_ready_vi\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`page_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_page_image_idx\` ON \`pages\` (\`page_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_seo_og_image_idx\` ON \`pages\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_published_at_idx\` ON \`pages\` (\`published_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_locales\` (
  	\`title\` text,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text,
  	\`summary\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_title\` text,
  	\`seo_og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_locales_locale_parent_id_unique\` ON \`pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
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
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_links_id_idx\` ON \`pages_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_projects_id_idx\` ON \`pages_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_things_id_idx\` ON \`pages_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_videos_id_idx\` ON \`pages_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_short_stories_id_idx\` ON \`pages_rels\` (\`short_stories_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_hero_order_idx\` ON \`_pages_v_blocks_layout_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_hero_parent_id_idx\` ON \`_pages_v_blocks_layout_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_hero_path_idx\` ON \`_pages_v_blocks_layout_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_hero_hero_image_idx\` ON \`_pages_v_blocks_layout_hero\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_hero_locales\` (
  	\`label\` text,
  	\`title\` text,
  	\`tagline\` text,
  	\`bio\` text,
  	\`cursor_popup\` text DEFAULT 'scroll down',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_layout_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_layout_hero_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_layout_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_feed_section\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feed_type\` text DEFAULT 'posts',
  	\`source\` text DEFAULT 'latest',
  	\`pagination\` text DEFAULT 'static',
  	\`limit\` numeric DEFAULT 11,
  	\`show_view_all\` integer DEFAULT true,
  	\`view_all_page_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_feed_section_order_idx\` ON \`_pages_v_blocks_layout_feed_section\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_feed_section_parent_id_idx\` ON \`_pages_v_blocks_layout_feed_section\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_feed_section_path_idx\` ON \`_pages_v_blocks_layout_feed_section\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_feed_section_view_all_page_idx\` ON \`_pages_v_blocks_layout_feed_section\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_feed_section_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_empty\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_layout_feed_section\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_layout_feed_section_locales_locale_parent_id\` ON \`_pages_v_blocks_layout_feed_section_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_rich_text_without_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_rich_text_without_block_order_idx\` ON \`_pages_v_blocks_layout_rich_text_without_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_rich_text_without_block_parent_id_idx\` ON \`_pages_v_blocks_layout_rich_text_without_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_rich_text_without_block_path_idx\` ON \`_pages_v_blocks_layout_rich_text_without_block\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_rich_text_without_block_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_layout_rich_text_without_block\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_layout_rich_text_without_block_locales_local\` ON \`_pages_v_blocks_layout_rich_text_without_block_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_media\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_media_order_idx\` ON \`_pages_v_blocks_content_media\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_media_parent_id_idx\` ON \`_pages_v_blocks_content_media\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_media_path_idx\` ON \`_pages_v_blocks_content_media\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_media_media_idx\` ON \`_pages_v_blocks_content_media\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_media_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_content_media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_content_media_locales_locale_parent_id_uniqu\` ON \`_pages_v_blocks_content_media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_gallery_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_content_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_gallery_items_order_idx\` ON \`_pages_v_blocks_content_gallery_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_gallery_items_parent_id_idx\` ON \`_pages_v_blocks_content_gallery_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_gallery_items_image_idx\` ON \`_pages_v_blocks_content_gallery_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_gallery_items_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_content_gallery_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_content_gallery_items_locales_locale_parent_\` ON \`_pages_v_blocks_content_gallery_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_gallery_order_idx\` ON \`_pages_v_blocks_content_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_gallery_parent_id_idx\` ON \`_pages_v_blocks_content_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_gallery_path_idx\` ON \`_pages_v_blocks_content_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_related_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`collection\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 3,
  	\`show_view_all\` integer DEFAULT false,
  	\`view_all_page_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`view_all_page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_related_items_order_idx\` ON \`_pages_v_blocks_layout_related_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_related_items_parent_id_idx\` ON \`_pages_v_blocks_layout_related_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_related_items_path_idx\` ON \`_pages_v_blocks_layout_related_items\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_related_items_view_all_page_idx\` ON \`_pages_v_blocks_layout_related_items\` (\`view_all_page_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_related_items_locales\` (
  	\`heading\` text,
  	\`view_all_label\` text,
  	\`cursor_popup\` text,
  	\`cursor_popup_item\` text,
  	\`cursor_popup_view_all\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_layout_related_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_layout_related_items_locales_locale_parent_i\` ON \`_pages_v_blocks_layout_related_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_typewriter\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_typewriter_order_idx\` ON \`_pages_v_blocks_layout_typewriter\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_typewriter_parent_id_idx\` ON \`_pages_v_blocks_layout_typewriter\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_typewriter_path_idx\` ON \`_pages_v_blocks_layout_typewriter\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_scramble_hover\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_scramble_hover_order_idx\` ON \`_pages_v_blocks_layout_scramble_hover\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_scramble_hover_parent_id_idx\` ON \`_pages_v_blocks_layout_scramble_hover\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_scramble_hover_path_idx\` ON \`_pages_v_blocks_layout_scramble_hover\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_blank_space\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`height\` text DEFAULT '60vh',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_blank_space_order_idx\` ON \`_pages_v_blocks_layout_blank_space\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_blank_space_parent_id_idx\` ON \`_pages_v_blocks_layout_blank_space\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_blank_space_path_idx\` ON \`_pages_v_blocks_layout_blank_space\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_footer\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_footer_order_idx\` ON \`_pages_v_blocks_layout_footer\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_footer_parent_id_idx\` ON \`_pages_v_blocks_layout_footer\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_layout_footer_path_idx\` ON \`_pages_v_blocks_layout_footer\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_layout_footer_locales\` (
  	\`footer_text\` text,
  	\`copyright\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_layout_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_layout_footer_locales_locale_parent_id_uniqu\` ON \`_pages_v_blocks_layout_footer_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_page_image_id\` integer,
  	\`version_seo_canonical_url\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`version_seo_no_index\` integer DEFAULT false,
  	\`version_seo_no_follow\` integer DEFAULT false,
  	\`version_template\` text DEFAULT 'generic',
  	\`version_published_at\` text,
  	\`version_translation_ready_vi\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_page_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_page_image_idx\` ON \`_pages_v\` (\`version_page_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_version_seo_og_image_idx\` ON \`_pages_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_published_at_idx\` ON \`_pages_v\` (\`version_published_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_locales\` (
  	\`version_title\` text,
  	\`version_generate_slug\` integer DEFAULT true,
  	\`version_slug\` text,
  	\`version_summary\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_title\` text,
  	\`version_seo_og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_locales_locale_parent_id_unique\` ON \`_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
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
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_links_id_idx\` ON \`_pages_v_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_posts_id_idx\` ON \`_pages_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_projects_id_idx\` ON \`_pages_v_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_things_id_idx\` ON \`_pages_v_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_videos_id_idx\` ON \`_pages_v_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_short_stories_id_idx\` ON \`_pages_v_rels\` (\`short_stories_id\`);`)
  await db.run(sql`CREATE TABLE \`links\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`category\` text DEFAULT 'navigation',
  	\`link_type\` text DEFAULT 'internal' NOT NULL,
  	\`page_id\` integer,
  	\`url\` text,
  	\`new_tab\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`links_page_idx\` ON \`links\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`links_updated_at_idx\` ON \`links\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`links_created_at_idx\` ON \`links\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`links_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`links_locales_locale_parent_id_unique\` ON \`links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`contact_submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`category\` text DEFAULT 'general',
  	\`message\` text NOT NULL,
  	\`locale\` text DEFAULT 'en' NOT NULL,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`assignee_id\` integer,
  	\`internal_notes\` text,
  	\`source_page\` text,
  	\`consent\` integer DEFAULT false NOT NULL,
  	\`abuse_ip_hash\` text,
  	\`abuse_user_agent_hash\` text,
  	\`abuse_honeypot_triggered\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`assignee_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`contact_submissions_email_idx\` ON \`contact_submissions\` (\`email\`);`)
  await db.run(sql`CREATE INDEX \`contact_submissions_assignee_idx\` ON \`contact_submissions\` (\`assignee_id\`);`)
  await db.run(sql`CREATE INDEX \`contact_submissions_abuse_abuse_ip_hash_idx\` ON \`contact_submissions\` (\`abuse_ip_hash\`);`)
  await db.run(sql`CREATE INDEX \`contact_submissions_updated_at_idx\` ON \`contact_submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`contact_submissions_created_at_idx\` ON \`contact_submissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`contact_submissions_locales\` (
  	\`subject\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`contact_submissions_locales_locale_parent_id_unique\` ON \`contact_submissions_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`executed_at\` text NOT NULL,
  	\`completed_at\` text NOT NULL,
  	\`task_slug\` text NOT NULL,
  	\`task_i_d\` text NOT NULL,
  	\`input\` text,
  	\`output\` text,
  	\`state\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_order_idx\` ON \`payload_jobs_log\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_parent_id_idx\` ON \`payload_jobs_log\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`input\` text,
  	\`completed_at\` text,
  	\`total_tried\` numeric DEFAULT 0,
  	\`has_error\` integer DEFAULT false,
  	\`error\` text,
  	\`task_slug\` text,
  	\`queue\` text DEFAULT 'default',
  	\`wait_until\` text,
  	\`processing\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_completed_at_idx\` ON \`payload_jobs\` (\`completed_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_total_tried_idx\` ON \`payload_jobs\` (\`total_tried\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_has_error_idx\` ON \`payload_jobs\` (\`has_error\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_task_slug_idx\` ON \`payload_jobs\` (\`task_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_queue_idx\` ON \`payload_jobs\` (\`queue\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_wait_until_idx\` ON \`payload_jobs\` (\`wait_until\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_processing_idx\` ON \`payload_jobs\` (\`processing\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_updated_at_idx\` ON \`payload_jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_created_at_idx\` ON \`payload_jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  	\`short_stories_id\` integer,
  	\`feed_decorations_id\` integer,
  	\`decoration_packs_id\` integer,
  	\`projects_id\` integer,
  	\`things_id\` integer,
  	\`videos_id\` integer,
  	\`pages_id\` integer,
  	\`links_id\` integer,
  	\`contact_submissions_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`authors_id\`) REFERENCES \`authors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tags_id\`) REFERENCES \`tags\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`short_stories_id\`) REFERENCES \`short_stories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`feed_decorations_id\`) REFERENCES \`feed_decorations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`decoration_packs_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`things_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`videos_id\`) REFERENCES \`videos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contact_submissions_id\`) REFERENCES \`contact_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_authors_id_idx\` ON \`payload_locked_documents_rels\` (\`authors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tags_id_idx\` ON \`payload_locked_documents_rels\` (\`tags_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_short_stories_id_idx\` ON \`payload_locked_documents_rels\` (\`short_stories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_feed_decorations_id_idx\` ON \`payload_locked_documents_rels\` (\`feed_decorations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_decoration_packs_id_idx\` ON \`payload_locked_documents_rels\` (\`decoration_packs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_things_id_idx\` ON \`payload_locked_documents_rels\` (\`things_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_videos_id_idx\` ON \`payload_locked_documents_rels\` (\`videos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_links_id_idx\` ON \`payload_locked_documents_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contact_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`contact_submissions_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_navigation_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_id\` integer NOT NULL,
  	FOREIGN KEY (\`link_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_children_order_idx\` ON \`site_settings_navigation_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_children_parent_id_idx\` ON \`site_settings_navigation_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_children_link_idx\` ON \`site_settings_navigation_children\` (\`link_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_navigation\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_id\` integer NOT NULL,
  	FOREIGN KEY (\`link_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_order_idx\` ON \`site_settings_navigation\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_parent_id_idx\` ON \`site_settings_navigation\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_navigation_link_idx\` ON \`site_settings_navigation\` (\`link_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_url\` text NOT NULL,
  	\`contact_email\` text,
  	\`cover_image_id\` integer,
  	\`active_decoration_pack_id\` integer NOT NULL,
  	\`analytics_provider\` text DEFAULT 'none',
  	\`analytics_site_id\` text,
  	\`default_social_image_id\` integer,
  	\`robots_index_site\` integer DEFAULT true,
  	\`seo_canonical_url\` text,
  	\`seo_og_image_id\` integer,
  	\`seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`seo_no_index\` integer DEFAULT false,
  	\`seo_no_follow\` integer DEFAULT false,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`active_decoration_pack_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_social_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_cover_image_idx\` ON \`site_settings\` (\`cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_active_decoration_pack_idx\` ON \`site_settings\` (\`active_decoration_pack_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_social_image_idx\` ON \`site_settings\` (\`default_social_image_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_seo_seo_og_image_idx\` ON \`site_settings\` (\`seo_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`site_name\` text NOT NULL,
  	\`tagline\` text,
  	\`description\` text,
  	\`bio\` text,
  	\`seo_meta_title\` text,
  	\`seo_meta_description\` text,
  	\`seo_og_title\` text,
  	\`seo_og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_rels_order_idx\` ON \`site_settings_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_rels_parent_idx\` ON \`site_settings_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_rels_path_idx\` ON \`site_settings_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_rels_links_id_idx\` ON \`site_settings_rels\` (\`links_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_navigation_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_id\` integer NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`link_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v_version_navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_navigation_children_order_idx\` ON \`_site_settings_v_version_navigation_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_navigation_children_parent_id_idx\` ON \`_site_settings_v_version_navigation_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_navigation_children_link_idx\` ON \`_site_settings_v_version_navigation_children\` (\`link_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_version_navigation\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_id\` integer NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`link_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_navigation_order_idx\` ON \`_site_settings_v_version_navigation\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_navigation_parent_id_idx\` ON \`_site_settings_v_version_navigation\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_navigation_link_idx\` ON \`_site_settings_v_version_navigation\` (\`link_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_site_url\` text NOT NULL,
  	\`version_contact_email\` text,
  	\`version_cover_image_id\` integer,
  	\`version_active_decoration_pack_id\` integer NOT NULL,
  	\`version_analytics_provider\` text DEFAULT 'none',
  	\`version_analytics_site_id\` text,
  	\`version_default_social_image_id\` integer,
  	\`version_robots_index_site\` integer DEFAULT true,
  	\`version_seo_canonical_url\` text,
  	\`version_seo_og_image_id\` integer,
  	\`version_seo_twitter_card\` text DEFAULT 'summary_large_image',
  	\`version_seo_no_index\` integer DEFAULT false,
  	\`version_seo_no_follow\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_cover_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_active_decoration_pack_id\`) REFERENCES \`decoration_packs\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_default_social_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_cover_image_idx\` ON \`_site_settings_v\` (\`version_cover_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_active_decoration_pack_idx\` ON \`_site_settings_v\` (\`version_active_decoration_pack_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_version_default_social_image_idx\` ON \`_site_settings_v\` (\`version_default_social_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_seo_version_seo_og_image_idx\` ON \`_site_settings_v\` (\`version_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_locales\` (
  	\`version_site_name\` text NOT NULL,
  	\`version_tagline\` text,
  	\`version_description\` text,
  	\`version_bio\` text,
  	\`version_seo_meta_title\` text,
  	\`version_seo_meta_description\` text,
  	\`version_seo_og_title\` text,
  	\`version_seo_og_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_site_settings_v_locales_locale_parent_id_unique\` ON \`_site_settings_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`links_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_site_settings_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`links_id\`) REFERENCES \`links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_rels_order_idx\` ON \`_site_settings_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_rels_parent_idx\` ON \`_site_settings_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_rels_path_idx\` ON \`_site_settings_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_rels_links_id_idx\` ON \`_site_settings_v_rels\` (\`links_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`authors_social_links\`;`)
  await db.run(sql`DROP TABLE \`authors_social_links_locales\`;`)
  await db.run(sql`DROP TABLE \`authors\`;`)
  await db.run(sql`DROP TABLE \`authors_locales\`;`)
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`DROP TABLE \`categories_locales\`;`)
  await db.run(sql`DROP TABLE \`tags\`;`)
  await db.run(sql`DROP TABLE \`tags_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_hero\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_feed_section\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_rich_text_without_block\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_rich_text_without_block_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_content_media\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_content_media_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_content_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_content_gallery_items_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_content_gallery\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_related_items\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_related_items_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_typewriter\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_blank_space\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_footer\`;`)
  await db.run(sql`DROP TABLE \`posts_blocks_layout_footer_locales\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts_locales\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_hero\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_feed_section\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_rich_text_without_block\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_rich_text_without_block_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_content_media\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_content_media_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_content_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_content_gallery_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_content_gallery\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_related_items\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_related_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_typewriter\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_blank_space\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_footer\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_blocks_layout_footer_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`short_stories\`;`)
  await db.run(sql`DROP TABLE \`short_stories_locales\`;`)
  await db.run(sql`DROP TABLE \`_short_stories_v\`;`)
  await db.run(sql`DROP TABLE \`_short_stories_v_locales\`;`)
  await db.run(sql`DROP TABLE \`feed_decorations\`;`)
  await db.run(sql`DROP TABLE \`decoration_packs_items\`;`)
  await db.run(sql`DROP TABLE \`decoration_packs\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_hero\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_feed_section\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_rich_text_without_block\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_rich_text_without_block_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_content_media\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_content_media_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_content_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_content_gallery_items_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_content_gallery\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_related_items\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_related_items_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_typewriter\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_blank_space\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_footer\`;`)
  await db.run(sql`DROP TABLE \`projects_blocks_layout_footer_locales\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_rels\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_hero\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_feed_section\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_rich_text_without_block\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_rich_text_without_block_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_content_media\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_content_media_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_content_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_content_gallery_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_content_gallery\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_related_items\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_related_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_typewriter\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_blank_space\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_footer\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_blocks_layout_footer_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_rels\`;`)
  await db.run(sql`DROP TABLE \`things\`;`)
  await db.run(sql`DROP TABLE \`things_locales\`;`)
  await db.run(sql`DROP TABLE \`_things_v\`;`)
  await db.run(sql`DROP TABLE \`_things_v_locales\`;`)
  await db.run(sql`DROP TABLE \`videos\`;`)
  await db.run(sql`DROP TABLE \`videos_locales\`;`)
  await db.run(sql`DROP TABLE \`_videos_v\`;`)
  await db.run(sql`DROP TABLE \`_videos_v_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_feed_section\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_rich_text_without_block\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_rich_text_without_block_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_media\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_media_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_gallery_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_gallery\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_related_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_related_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_typewriter\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_blank_space\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_footer\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_layout_footer_locales\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_hero\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_feed_section\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_feed_section_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_rich_text_without_block\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_rich_text_without_block_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_media\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_media_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_gallery_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_gallery_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_gallery\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_related_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_related_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_typewriter\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_scramble_hover\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_blank_space\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_footer\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_layout_footer_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`links\`;`)
  await db.run(sql`DROP TABLE \`links_locales\`;`)
  await db.run(sql`DROP TABLE \`contact_submissions\`;`)
  await db.run(sql`DROP TABLE \`contact_submissions_locales\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings_navigation_children\`;`)
  await db.run(sql`DROP TABLE \`site_settings_navigation\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings_rels\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_navigation_children\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_version_navigation\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v_rels\`;`)
}
