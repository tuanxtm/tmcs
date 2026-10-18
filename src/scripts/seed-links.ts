import type { Payload } from 'payload'

type SeedLink = {
  label: { en: string; vi: string }
  category: 'navigation' | 'social' | 'legal' | 'contact' | 'other'
  linkType: 'internal' | 'external'
  page?: number | null
  url?: string | null
  newTab: boolean
}

async function mergeLinkReferences(payload: Payload, from: number, to: number): Promise<void> {
  const db = payload.db.binding
  const { results: tables } = await db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND sql LIKE '%REFERENCES%links%'",
    )
    .all<{ name: string }>()
  const statements = []

  for (const { name } of tables ?? []) {
    const table = `"${name.replaceAll('"', '""')}"`
    const { results: keys } = await db.prepare(`PRAGMA foreign_key_list(${table})`).all<{
      table: string
      from: string
    }>()
    for (const key of keys ?? []) {
      if (key.table !== 'links' || name === 'links_locales') continue
      const column = `"${key.from.replaceAll('"', '""')}"`
      statements.push(
        db.prepare(`UPDATE ${table} SET ${column} = ? WHERE ${column} = ?`).bind(to, from),
      )
    }
  }

  if (statements.length) await db.batch(statements)
}

export async function upsertSeedLink(payload: Payload, data: SeedLink): Promise<{ id: number }> {
  const existing = await payload.find({
    collection: 'links',
    where: { label: { equals: data.label.en } },
    locale: 'en',
    fallbackLocale: false,
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const shared = {
    ...data,
    label: data.label.en,
    page: data.page ?? null,
    url: data.url ?? null,
  }
  const doc = existing.docs[0]
    ? await payload.update({
        collection: 'links',
        id: existing.docs[0].id,
        data: shared,
        locale: 'en',
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'links',
        data: shared,
        locale: 'en',
        overrideAccess: true,
      })

  await payload.update({
    collection: 'links',
    id: doc.id,
    data: { label: data.label.vi },
    locale: 'vi',
    overrideAccess: true,
  })

  // Merge only unchanged Vietnamese-only rows produced by the old seed.
  const duplicates = await payload.find({
    collection: 'links',
    where: { and: [{ label: { equals: data.label.vi } }, { id: { not_equals: doc.id } }] },
    locale: 'vi',
    fallbackLocale: false,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  for (const duplicate of duplicates.docs) {
    const en = await payload.findByID({
      collection: 'links',
      id: duplicate.id,
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      overrideAccess: true,
    })
    if (
      en.label ||
      duplicate.category !== data.category ||
      duplicate.linkType !== data.linkType ||
      (duplicate.page ?? null) !== shared.page ||
      (duplicate.url ?? null) !== shared.url ||
      Boolean(duplicate.newTab) !== data.newTab
    )
      continue

    await mergeLinkReferences(payload, duplicate.id, doc.id)
    await payload.delete({ collection: 'links', id: duplicate.id, overrideAccess: true })
  }

  return { id: doc.id }
}

export async function seedLinkLibrary(
  payload: Payload,
  pages: { about: number; projects: number; posts: number },
) {
  const seedLinkDefs = [
    {
      key: 'about',
      category: 'navigation' as const,
      en: { label: 'About', linkType: 'internal' as const, page: pages.about },
      vi: { label: 'Giới thiệu', linkType: 'internal' as const, page: pages.about },
      newTab: false,
    },
    {
      key: 'projects',
      category: 'navigation' as const,
      en: { label: 'Projects', linkType: 'internal' as const, page: pages.projects },
      vi: { label: 'Dự án', linkType: 'internal' as const, page: pages.projects },
      newTab: false,
    },
    {
      key: 'posts',
      category: 'navigation' as const,
      en: { label: 'Posts', linkType: 'internal' as const, page: pages.posts },
      vi: { label: 'Bài viết', linkType: 'internal' as const, page: pages.posts },
      newTab: false,
    },
    {
      key: 'instagram',
      category: 'social' as const,
      en: {
        label: 'Instagram',
        linkType: 'external' as const,
        url: 'https://instagram.com/tuantm',
      },
      vi: {
        label: 'Instagram',
        linkType: 'external' as const,
        url: 'https://instagram.com/tuantm',
      },
      newTab: true,
    },
    {
      key: 'youtube',
      category: 'social' as const,
      en: { label: 'YouTube', linkType: 'external' as const, url: 'https://youtube.com/@tuantm' },
      vi: { label: 'YouTube', linkType: 'external' as const, url: 'https://youtube.com/@tuantm' },
      newTab: true,
    },
    {
      key: 'github',
      category: 'social' as const,
      en: { label: 'GitHub', linkType: 'external' as const, url: 'https://github.com/tuantm' },
      vi: { label: 'GitHub', linkType: 'external' as const, url: 'https://github.com/tuantm' },
      newTab: true,
    },
  ] as const

  // Both locales reference the same Link document; only its label is localized.
  const linkIds: Record<string, Record<(typeof seedLinkDefs)[number]['key'], number>> = {
    en: {} as Record<(typeof seedLinkDefs)[number]['key'], number>,
    vi: {} as Record<(typeof seedLinkDefs)[number]['key'], number>,
  }
  for (const def of seedLinkDefs) {
    const link = await upsertSeedLink(payload, {
      label: { en: def.en.label, vi: def.vi.label },
      category: def.category,
      linkType: def.en.linkType,
      page: 'page' in def.en ? def.en.page : undefined,
      url: 'url' in def.en ? def.en.url : undefined,
      newTab: def.newTab,
    })
    linkIds.en[def.key] = link.id
    linkIds.vi[def.key] = link.id
  }

  return linkIds
}
