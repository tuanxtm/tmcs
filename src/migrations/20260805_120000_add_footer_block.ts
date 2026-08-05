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
 * Add the footer page-builder block.
 * Fields: footerText (richText, localized), legalLinks (array), copyright (text, localized).
 * No footerGroups — simplified to avoid nested array table complexity.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ── Footer block (live) ────────────────────────────────────────────────
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_footer\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_path\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`block_name\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_footer_order_idx\` ON \`pages_blocks_footer\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_footer_parent_id_idx\` ON \`pages_blocks_footer\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_footer_path_idx\` ON \`pages_blocks_footer\` (\`_path\`);`,
  )

  // Localized fields: footerText, copyright
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_footer_locales\` (
    \`footer_text\` text,
    \`copyright\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`pages_blocks_footer_locales_locale_parent_id_unique\` ON \`pages_blocks_footer_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // legalLinks — top-level array (uses snake_case like Payload's query generator)
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_footer_legal_links\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`link_type\` text DEFAULT 'internal',
    \`page_id\` integer,
    \`url\` text,
    \`new_tab\` integer DEFAULT false,
    FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_footer_legal_links_order_idx\` ON \`pages_blocks_footer_legal_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_footer_legal_links_parent_id_idx\` ON \`pages_blocks_footer_legal_links\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`pages_blocks_footer_legal_links_page_id_idx\` ON \`pages_blocks_footer_legal_links\` (\`page_id\`);`,
  )

  // legalLinks — localized label
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`pages_blocks_footer_legal_links_locales\` (
    \`label\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` text NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_footer_legal_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`pages_blocks_footer_legal_links_locales_locale_parent_id_unique\` ON \`pages_blocks_footer_legal_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // ── Footer block (versions) ─────────────────────────────────────────────
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_footer\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`_path\` text NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_uuid\` text,
    \`block_name\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_order_idx\` ON \`_pages_v_blocks_footer\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_parent_id_idx\` ON \`_pages_v_blocks_footer\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_path_idx\` ON \`_pages_v_blocks_footer\` (\`_path\`);`,
  )

  // versions — localized fields
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_footer_locales\` (
    \`version_footer_text\` text,
    \`version_copyright\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_footer_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // versions — legalLinks
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_footer_legal_links\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`link_type\` text DEFAULT 'internal',
    \`page_id\` integer,
    \`url\` text,
    \`new_tab\` integer DEFAULT false,
    \`_uuid\` text,
    FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_legal_links_order_idx\` ON \`_pages_v_blocks_footer_legal_links\` (\`_order\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_legal_links_parent_id_idx\` ON \`_pages_v_blocks_footer_legal_links\` (\`_parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_legal_links_page_id_idx\` ON \`_pages_v_blocks_footer_legal_links\` (\`page_id\`);`,
  )

  // versions — legalLinks label
  await db.run(sql`CREATE TABLE IF NOT EXISTS \`_pages_v_blocks_footer_legal_links_locales\` (
    \`label\` text,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`_locale\` text NOT NULL,
    \`_parent_id\` integer NOT NULL,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_footer_legal_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );`)
  await db.run(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS \`_pages_v_blocks_footer_legal_links_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_footer_legal_links_locales\` (\`_locale\`,\`_parent_id\`);`,
  )

  // ── Locked documents relationship column (idempotent) ───────────────────
  if (!(await columnNames(db, 'payload_locked_documents_rels')).has('pages_blocks_footer_id')) {
    await db.run(
      sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`pages_blocks_footer_id\` integer REFERENCES pages_blocks_footer(id);`,
    )
    await db.run(
      sql`CREATE INDEX IF NOT EXISTS \`payload_locked_documents_rels_pages_blocks_footer_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_blocks_footer_id\`);`,
    )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_footer_legal_links_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_footer_legal_links\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_footer_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`_pages_v_blocks_footer\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_footer_legal_links_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_footer_legal_links\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_footer_locales\`;`)
  await db.run(sql`DROP TABLE IF EXISTS \`pages_blocks_footer\`;`)

  // SQLite cannot DROP COLUMN reliably across all environments used here;
  // leave pages_blocks_footer_id column in place on down.
}
