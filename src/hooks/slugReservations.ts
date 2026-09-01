import type { Payload } from 'payload'
import { revalidateTag } from 'next/cache'

import { CACHE_TAGS } from '@/lib/cache-tags'

// payload.db is the Drizzle DatabaseAdapter; the raw D1 binding (with
// .prepare()) is at payload.db.binding. Set at adapter construction time.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D1Database = any

export type ReservedCollection =
  | 'pages'
  | 'posts'
  | 'projects'
  | 'tags'
  | 'categories'
  | 'decoration-packs'
  | 'things'

type Locale = 'en' | 'vi'

const LOCALES: Locale[] = ['en', 'vi']

function getD1(payload: Payload): D1Database {
  return payload.db.binding
}

/**
 * Best-effort cache invalidation for the slug_reservations data-cache entry.
 * Wrapped in try/catch because Payload hooks also run outside an active
 * Next.js request (seed scripts, vitest, local CLI commands) where
 * `revalidateTag` throws because no cache scope exists.
 */
function revalidateSlugReservations(): void {
  try {
    revalidateTag(CACHE_TAGS.slugReservations, 'max')
  } catch {
    // Non-request context (seed/vitest/CLI) - nothing to invalidate.
  }
}

/**
 * Pull every localized slug string out of a doc's `slug` field. Handles both
 * the localized shape (`{ en, vi }`) and the plain string shape used by
 * non-localized collections like `decoration-packs`. Empty / missing values
 * are skipped.
 */
function collectLocales(slugValue: unknown): Array<{ locale: Locale; slug: string }> {
  if (typeof slugValue === 'string' && slugValue.length > 0) {
    // Non-localized slug - register under both locales so the cross-collection
    // lookup shape stays uniform. The reservation is keyed by (collection,
    // locale, slug), so this does not collide with anything.
    return LOCALES.map((locale) => ({ locale, slug: slugValue }))
  }
  if (slugValue && typeof slugValue === 'object') {
    const out: Array<{ locale: Locale; slug: string }> = []
    for (const locale of LOCALES) {
      const value = (slugValue as Record<string, unknown>)[locale]
      if (typeof value === 'string' && value.length > 0) {
        out.push({ locale, slug: value })
      }
    }
    return out
  }
  return []
}

/**
 * Upsert slug_reservations rows for a document's localized slugs.
 * Called in afterChange hooks.
 */
export async function upsertSlugReservations(
  payload: Payload,
  collection: ReservedCollection,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: { id: number; slug?: any },
): Promise<void> {
  const db = getD1(payload)

  const entries = collectLocales(doc.slug)
  if (entries.length === 0) return

  const stmt = db.prepare(
    `INSERT INTO slug_reservations (locale, slug, collection, content_id)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(collection, locale, slug) DO UPDATE SET content_id = excluded.content_id`,
  )

  for (const { locale, slug } of entries) {
    await stmt.bind(locale, slug, collection, doc.id).run()
  }

  // At least one row changed - the data-cache entry for `slug_reservations`
  // is now stale, so invalidate it before the next request hits the route.
  revalidateSlugReservations()
}

/**
 * Delete slug_reservations rows for a deleted document.
 * Called in afterDelete hooks.
 */
export async function deleteSlugReservations(
  payload: Payload,
  collection: ReservedCollection,
  doc: { id: number },
): Promise<void> {
  const db = getD1(payload)
  const stmt = db
    .prepare('DELETE FROM slug_reservations WHERE collection = ? AND content_id = ?')
    .bind(collection, doc.id)
  await stmt.run()

  // Reservations moved or vanished - invalidate the data-cache entry so the
  // next request can re-resolve from D1.
  revalidateSlugReservations()
}

/**
 * Check if a proposed slug is already reserved by another collection in the
 * given locale. Returns the conflicting collection name, or null if free.
 *
 * `selfId` is supplied on the `update` operation so that an existing row's
 * own reservation doesn't count as a conflict against itself.
 */
export async function checkSlugReservationConflict(
  payload: Payload,
  locale: Locale,
  slug: string,
  selfCollection: ReservedCollection,
  selfId?: number,
): Promise<ReservedCollection | null> {
  const db = getD1(payload)

  const stmt = selfId
    ? db
        .prepare(
          `SELECT collection FROM slug_reservations
           WHERE locale = ? AND slug = ? AND collection != ? AND content_id != ?
           LIMIT 1`,
        )
        .bind(locale, slug, selfCollection, selfId)
    : db
        .prepare(
          `SELECT collection FROM slug_reservations
           WHERE locale = ? AND slug = ? AND collection != ?
           LIMIT 1`,
        )
        .bind(locale, slug, selfCollection)

  const result = (await stmt.first()) as { collection: string } | null
  if (!result) return null
  return result.collection as ReservedCollection
}
