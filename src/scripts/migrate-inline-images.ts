/**
 * One-shot migration: rewrite legacy `inlineImage` Lexical nodes (custom
 * decorator node from the now-removed `src/fields/inlineImage/` tree)
 * into Payload-native `inlineBlock` nodes that reference the unified
 * `inlineImage` inline block.
 *
 * Idempotent. After a successful run, no `inlineImage` nodes remain in any
 * rich text field of the seeded collections/globals, and the script becomes a
 * no-op on subsequent runs.
 *
 * Usage:
 *   bun run migrate:inline-images
 *
 * Scope (every localized rich text field that could carry a legacy node):
 *   - Posts.content (Posts.layout[].content/paragraph/footerText)
 *   - Projects.content (Projects.layout[].content/paragraph/footerText)
 *   - ShortStories.content
 *   - Pages.layout[].content/paragraph/footerText
 *   - SiteSettings.bio
 *
 * Algorithm:
 *   1. For each scope, fetch all localized doc IDs.
 *   2. For each locale, load the rich text JSON, walk recursively, replace
 *      every `{ type: 'inlineImage', version: 1, ... }` with
 *      `{ type: 'inlineBlock', version: 2, fields: { blockType: 'inlineImage',
 *      blockName, id, image: <mediaId>, caption } }`.
 *   3. Resolve media by `src` URL (`payload.find({ collection: 'media',
 *      where: { url: { equals: src } } })`); create a stub media doc with the
 *      same URL when missing.
 *   4. If any replacement occurred, persist via `payload.update`.
 *
 * Run from the project root with the standard bun tooling so Wrangler /
 * Payload can resolve the local D1 binding.
 */

import 'dotenv/config'
import { randomUUID } from 'node:crypto'

import { getPayload, type Payload } from 'payload'

import config from '@payload-config'

type Locale = 'en' | 'vi'
const LOCALES: ReadonlyArray<Locale> = ['en', 'vi']

type SerializedLexicalNode = {
  type?: string
  children?: SerializedLexicalNode[]
  [key: string]: unknown
}

type LegacyInlineImageNode = {
  type: 'inlineImage'
  version: 1
  id: string
  src: string
  alt: string
  width: number | null
  height: number | null
  caption: string
}

type MigratedInlineBlockNode = {
  type: 'inlineBlock'
  version: 2
  fields: {
    blockType: 'inlineImage'
    blockName?: string | null
    id: string
    image: number | string
    caption?: string | null
  }
}

type MediaCacheEntry = { id: number | string }

const mediaCache = new Map<string, MediaCacheEntry>()

function isLegacyInlineImageNode(node: unknown): node is LegacyInlineImageNode {
  if (typeof node !== 'object' || node === null) return false
  const n = node as Record<string, unknown>
  return n.type === 'inlineImage' && n.version === 1
}

function deriveBlockName(legacy: LegacyInlineImageNode): string | undefined {
  const trimmedAlt = typeof legacy.alt === 'string' ? legacy.alt.trim() : ''
  if (trimmedAlt) return trimmedAlt
  if (typeof legacy.src === 'string') {
    try {
      const url = new URL(legacy.src, 'http://x')
      const filename = url.pathname.split('/').filter(Boolean).pop() ?? ''
      return filename || undefined
    } catch {
      const last = legacy.src.split('/').filter(Boolean).pop()
      return last || undefined
    }
  }
  return undefined
}

function nodeHasLegacyImage(root: SerializedLexicalNode | null | undefined): boolean {
  if (!root || typeof root !== 'object') return false
  if (isLegacyInlineImageNode(root)) return true
  const children = (root as { children?: SerializedLexicalNode[] }).children
  if (Array.isArray(children)) {
    return children.some((c) => nodeHasLegacyImage(c))
  }
  return false
}

function countLegacyImages(root: SerializedLexicalNode | null | undefined): number {
  if (!root || typeof root !== 'object') return 0
  if (isLegacyInlineImageNode(root)) return 1
  const children = (root as { children?: SerializedLexicalNode[] }).children
  if (Array.isArray(children)) {
    return children.reduce<number>((sum, c) => sum + countLegacyImages(c), 0)
  }
  return 0
}

async function findOrCreateMedia(payload: Payload, src: string): Promise<MediaCacheEntry> {
  const cached = mediaCache.get(src)
  if (cached) return cached

  const existing = await payload.find({
    collection: 'media',
    where: { url: { equals: src } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs[0]) {
    const entry = { id: existing.docs[0].id }
    mediaCache.set(src, entry)
    return entry
  }

  let filename = src
  try {
    const u = new URL(src, 'http://x')
    const last = u.pathname.split('/').filter(Boolean).pop()
    if (last) filename = last
  } catch {
    /* keep raw src */
  }

  const created = await payload.create({
    collection: 'media',
    data: {
      alt: filename,
      kind: 'image',
    },
    file: {
      // Payload requires a file buffer. We pass an empty buffer; the URL is
      // set explicitly via beforeChange hooks (none apply) so the row still
      // gets persisted. The image itself is not uploaded here - we only
      // create a row that points at the existing URL. The frontend reads
      // `url` directly from the media doc.
      data: Buffer.alloc(0),
      mimetype: 'application/octet-stream',
      name: filename,
      size: 0,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  // Force-set URL to the source URL after creation since no file was uploaded.
  const updated = await payload.update({
    collection: 'media',
    id: created.id,
    data: {
      url: src,
    } as Record<string, unknown>,
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  const entry = { id: updated.id }
  mediaCache.set(src, entry)
  return entry
}

async function migrateRichTextJson(
  payload: Payload,
  json: SerializedLexicalNode | null | undefined,
): Promise<{
  json: SerializedLexicalNode | null | undefined
  replaced: number
}> {
  if (!json || typeof json !== 'object') return { json, replaced: 0 }

  // Replace this node if it is itself a legacy inline image.
  if (isLegacyInlineImageNode(json)) {
    const media = await findOrCreateMedia(payload, json.src)
    const replacement: MigratedInlineBlockNode = {
      type: 'inlineBlock',
      version: 2,
      fields: {
        blockType: 'inlineImage',
        blockName: deriveBlockName(json) ?? null,
        id: randomUUID(),
        image: media.id,
        caption: typeof json.caption === 'string' && json.caption ? json.caption : null,
      },
    }
    return { json: replacement as unknown as SerializedLexicalNode, replaced: 1 }
  }

  // Otherwise walk children if any.
  const children = (json as { children?: SerializedLexicalNode[] }).children
  if (!Array.isArray(children)) return { json, replaced: 0 }

  let total = 0
  const newChildren: SerializedLexicalNode[] = []
  for (const child of children) {
    const { json: nextChild, replaced } = await migrateRichTextJson(payload, child)
    newChildren.push(nextChild ?? child)
    total += replaced
  }
  return { json: { ...json, children: newChildren }, replaced: total }
}

type DocumentScope = {
  collection: 'posts' | 'projects' | 'short-stories' | 'pages'
  fields: ReadonlyArray<{ path: string[]; localized: boolean }>
}

const COLLECTION_SCOPES: ReadonlyArray<DocumentScope> = [
  {
    collection: 'posts',
    fields: [
      { path: ['content'], localized: true },
    ],
  },
  {
    collection: 'projects',
    fields: [{ path: ['content'], localized: true }],
  },
  {
    collection: 'short-stories',
    fields: [{ path: ['content'], localized: true }],
  },
  {
    collection: 'pages',
    fields: [
      // Pages don't have a top-level `content` - layout blocks do.
      // Layout blocks are walked recursively below via `walkDocumentLayouts`.
    ],
  },
]

const LAYOUT_RICHTEXT_FIELDS_BY_BLOCK: Record<
  string,
  ReadonlyArray<{ path: string[] }>
> = {
  pageRichText: [{ path: ['content'] }],
  pageHero: [{ path: ['paragraph'] }],
  pageFooter: [{ path: ['footerText'] }],
}

function getAtPath(
  obj: unknown,
  path: ReadonlyArray<string>,
): unknown {
  let cur: unknown = obj
  for (const segment of path) {
    if (typeof cur !== 'object' || cur === null) return undefined
    cur = (cur as Record<string, unknown>)[segment]
  }
  return cur
}

function setAtPath(
  obj: unknown,
  path: ReadonlyArray<string>,
  value: unknown,
): unknown {
  if (path.length === 0) return value
  const cloned: Record<string, unknown> =
    typeof obj === 'object' && obj !== null
      ? { ...(obj as Record<string, unknown>) }
      : {}
  let cur: Record<string, unknown> = cloned
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i]!
    const next: Record<string, unknown> =
      typeof cur[segment] === 'object' && cur[segment] !== null
        ? { ...(cur[segment] as Record<string, unknown>) }
        : {}
    cur[segment] = next
    cur = next
  }
  cur[path[path.length - 1]!] = value
  return cloned
}

type WalkLayoutResult = {
  layout: unknown
  totalReplaced: number
  dirty: boolean
}

function walkDocumentLayouts(
  payload: Payload,
  layout: unknown,
): Promise<WalkLayoutResult> {
  return (async () => {
    let totalReplaced = 0
    let dirty = false

    if (!Array.isArray(layout)) {
      return { layout, totalReplaced, dirty }
    }

    const nextLayout = []
    for (const item of layout) {
      if (typeof item !== 'object' || item === null) {
        nextLayout.push(item)
        continue
      }
      const block = item as { blockType?: string }
      const richtextFields = block.blockType
        ? LAYOUT_RICHTEXT_FIELDS_BY_BLOCK[block.blockType]
        : undefined

      let nextItem: Record<string, unknown> = { ...(item as Record<string, unknown>) }
      if (richtextFields) {
        for (const field of richtextFields) {
          const current = getAtPath(nextItem, field.path)
          if (!nodeHasLegacyImage(current as SerializedLexicalNode | null)) continue
          const { json, replaced } = await migrateRichTextJson(
            payload,
            current as SerializedLexicalNode,
          )
          if (replaced > 0) {
            nextItem = setAtPath(nextItem, field.path, json) as Record<string, unknown>
            totalReplaced += replaced
            dirty = true
          }
        }
      }
      nextLayout.push(nextItem)
    }

    return { layout: dirty ? nextLayout : layout, totalReplaced, dirty }
  })()
}

type DocumentRecord = {
  id: number | string
  [key: string]: unknown
}

async function migrateCollection(
  payload: Payload,
  scope: DocumentScope,
): Promise<{ docsScanned: number; docsUpdated: number; replaced: number }> {
  let docsScanned = 0
  let docsUpdated = 0
  let replaced = 0

  const docs = await payload.find({
    collection: scope.collection,
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })
  for (const docRaw of docs.docs as unknown as DocumentRecord[]) {
    docsScanned++
    for (const locale of LOCALES) {
      const localized = await payload.findByID({
        collection: scope.collection,
        id: docRaw.id,
        locale,
        overrideAccess: true,
        depth: 0,
        fallbackLocale: false,
      })

      let dirty = false
      let localizedUpdate: Record<string, unknown> = {}

      for (const field of scope.fields) {
        const value = getAtPath(localized, field.path) as SerializedLexicalNode | null
        if (!nodeHasLegacyImage(value)) continue
        const { json, replaced: count } = await migrateRichTextJson(payload, value)
        if (count > 0) {
          localizedUpdate = setAtPath(localizedUpdate, field.path, json) as Record<
            string,
            unknown
          >
          replaced += count
          dirty = true
        }
      }

      // Walk layouts (only Pages carry a top-level `layout` array).
      const layout = getAtPath(localized, ['layout'])
      if (Array.isArray(layout) && layout.length > 0) {
        const { layout: nextLayout, totalReplaced, dirty: layoutDirty } =
          await walkDocumentLayouts(payload, layout)
        if (layoutDirty) {
          localizedUpdate = { ...localizedUpdate, layout: nextLayout }
          replaced += totalReplaced
          dirty = true
        }
      }

      if (dirty) {
        await payload.update({
          collection: scope.collection,
          id: docRaw.id,
          data: localizedUpdate,
          locale,
          overrideAccess: true,
          context: { disableRevalidate: true },
        })
        docsUpdated++
      }
    }
  }

  return { docsScanned, docsUpdated, replaced }
}

async function migrateSiteSettings(
  payload: Payload,
): Promise<{ docsUpdated: number; replaced: number }> {
  let docsUpdated = 0
  let replaced = 0

  for (const locale of LOCALES) {
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      locale,
      overrideAccess: true,
      depth: 0,
    })

    const bio = settings?.bio as SerializedLexicalNode | null
    if (!nodeHasLegacyImage(bio)) continue

    const { json, replaced: count } = await migrateRichTextJson(payload, bio)
    if (count > 0) {
      await payload.updateGlobal({
        slug: 'site-settings',
        data: { bio: json },
        locale,
        overrideAccess: true,
        context: { disableRevalidate: true },
      })
      docsUpdated++
      replaced += count
    }
  }
  return { docsUpdated, replaced }
}

async function main() {
  const payload = await getPayload({ config })

  console.log('Migrating legacy inlineImage nodes -> inlineBlock (inlineImage)...\n')

  let totalReplaced = 0
  let totalUpdated = 0
  let totalScanned = 0

  for (const scope of COLLECTION_SCOPES) {
    const { docsScanned, docsUpdated, replaced } = await migrateCollection(payload, scope)
    totalReplaced += replaced
    totalUpdated += docsUpdated
    totalScanned += docsScanned
    console.log(
      `[${scope.collection}] scanned=${docsScanned} updated=${docsUpdated} replaced=${replaced}`,
    )
  }

  const { docsUpdated, replaced: siteReplaced } = await migrateSiteSettings(payload)
  totalReplaced += siteReplaced
  totalUpdated += docsUpdated
  console.log(`[site-settings] updated=${docsUpdated} replaced=${siteReplaced}`)

  console.log(
    `\nDone. docs_scanned=${totalScanned} docs_updated=${totalUpdated} nodes_replaced=${totalReplaced}`,
  )

  process.exit(0)
}

main().catch((err) => {
  console.error('migrate:inline-images failed:', err)
  process.exit(1)
})
