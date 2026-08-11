import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`things_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`things\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`things_links_order_idx\` ON \`things_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`things_links_parent_id_idx\` ON \`things_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_things_v_version_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_things_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_things_v_version_links_order_idx\` ON \`_things_v_version_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_things_v_version_links_parent_id_idx\` ON \`_things_v_version_links\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`things_locales\` DROP COLUMN \`link_label\`;`)
  await db.run(sql`ALTER TABLE \`_things_v_locales\` DROP COLUMN \`version_link_label\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`things_links\`;`)
  await db.run(sql`DROP TABLE \`_things_v_version_links\`;`)
  await db.run(sql`ALTER TABLE \`things_locales\` ADD \`link_label\` text;`)
  await db.run(sql`ALTER TABLE \`_things_v_locales\` ADD \`version_link_label\` text;`)
}
