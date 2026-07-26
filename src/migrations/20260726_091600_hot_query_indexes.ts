import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

/**
 * Composite indexes for hot public listing queries:
 *   WHERE _status = 'published' ORDER BY published_at DESC, id DESC
 * Plus contact abuse dedupe predicate.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`posts_status_published_at_id_idx\` ON \`posts\` (\`_status\`, \`published_at\`, \`id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`short_stories_status_published_at_id_idx\` ON \`short_stories\` (\`_status\`, \`published_at\`, \`id\`);`,
  )
  await db.run(
    sql`CREATE INDEX IF NOT EXISTS \`contact_submissions_email_ip_created_idx\` ON \`contact_submissions\` (\`email\`, \`abuse_ip_hash\`, \`created_at\`);`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`posts_status_published_at_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`short_stories_status_published_at_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`contact_submissions_email_ip_created_idx\`;`)
}
