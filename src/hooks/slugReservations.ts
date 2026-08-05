import type { Payload } from 'payload'

// payload.db is the Drizzle DatabaseAdapter; the raw D1 binding (with
// .prepare()) is at payload.db.binding. Set at adapter construction time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any

type Locale = 'en' | 'vi'

function getD1(payload: Payload): D1Database {
  return payload.db.binding
}

/**
 * Upsert slug_reservations rows for a document's localized slugs.
 * Called in afterChange hooks.
 */
export async function upsertSlugReservations(
  payload: Payload,
  collection: 'pages' | 'posts',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: { id: number; slug?: any },
): Promise<void> {
  const db = getD1(payload)

  const slugValue = doc.slug

  const locales: Locale[] = ['en', 'vi']
  for (const locale of locales) {
    const slug = typeof slugValue === 'object' ? (slugValue as Record<string, string>)?.[locale] : slugValue
    if (!slug) continue

    const stmt = db
      .prepare(
        `INSERT INTO slug_reservations (locale, slug, collection, content_id)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(collection, locale, slug) DO UPDATE SET content_id = excluded.content_id`,
      )
      .bind(locale, slug, collection, doc.id)
    await stmt.run()
  }
}

/**
 * Delete slug_reservations rows for a deleted document.
 * Called in afterDelete hooks.
 */
export async function deleteSlugReservations(
  payload: Payload,
  collection: 'pages' | 'posts',
  doc: { id: number },
): Promise<void> {
  const db = getD1(payload)
  const stmt = db
    .prepare('DELETE FROM slug_reservations WHERE collection = ? AND content_id = ?')
    .bind(collection, doc.id)
  await stmt.run()
}

/**
 * Check if a proposed slug is already reserved by another collection.
 * Returns the conflicting collection name, or null if free.
 */
export async function checkSlugReservationConflict(
  payload: Payload,
  locale: Locale,
  slug: string,
  selfCollection: 'pages' | 'posts',
  selfId?: number,
): Promise<string | null> {
  const db = getD1(payload)

  let stmt
  if (selfId) {
    stmt = db
      .prepare(
        `SELECT collection FROM slug_reservations
         WHERE locale = ? AND slug = ? AND collection != ? AND content_id != ?
         LIMIT 1`,
      )
      .bind(locale, slug, selfCollection, selfId)
  } else {
    stmt = db
      .prepare(
        `SELECT collection FROM slug_reservations
         WHERE locale = ? AND slug = ? AND collection != ?
         LIMIT 1`,
      )
      .bind(locale, slug, selfCollection)
  }

  const result = (await stmt.first()) as { collection: string } | null
  return result?.collection ?? null
}
