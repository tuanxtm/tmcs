import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getFileKey } from '@payloadcms/plugin-cloud-storage/utilities'
import type { Payload } from 'payload'
import { getPlatformProxy } from 'wrangler'

type UpsertFeedDecorationOptions = {
  title: string
  /** Basename under public/, e.g. plant-1.webp */
  filename: string
}

async function getPlatformEnv() {
  const { env } = await getPlatformProxy({
    environment: process.env.CLOUDFLARE_ENV,
    remoteBindings: process.env.NODE_ENV === 'production',
  })

  return env as unknown as CloudflareEnv
}

async function ensureFeedDecorationRow(
  payload: Payload,
  title: string,
  filename: string,
  filesize: number,
): Promise<number> {
  const existing = await payload.find({
    collection: 'feed-decorations',
    where: {
      filename: {
        equals: filename,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    return existing.docs[0].id
  }

  const env = await getPlatformEnv()
  const result = await env.D1.prepare(
    `INSERT INTO feed_decorations (alt, filename, mime_type, filesize)
     VALUES (?, ?, 'image/webp', ?)`,
  )
    .bind(title, filename, filesize)
    .run()

  const rowId = Number(result.meta.last_row_id)
  if (rowId > 0) {
    return rowId
  }

  const created = await payload.find({
    collection: 'feed-decorations',
    where: {
      filename: {
        equals: filename,
      },
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (!created.docs[0]) {
    throw new Error(`Failed to create feed decoration row for ${filename}`)
  }

  return created.docs[0].id
}

/** Create or replace a feed-decorations upload from a public/ WebP file. */
export async function upsertFeedDecorationFile(
  payload: Payload,
  { title, filename }: UpsertFeedDecorationOptions,
): Promise<number> {
  if (!filename.endsWith('.webp')) {
    throw new Error(`Feed decorations must be WebP (got ${filename})`)
  }

  const localPath = path.join(process.cwd(), 'public', filename)
  const buffer = await readFile(localPath)
  // Plain Uint8Array - Node Buffer fails Miniflare/devalue over getPlatformProxy.
  const bytes = new Uint8Array(buffer)
  const filesize = bytes.byteLength
  // Match r2Storage default: no collection prefix → key is just the filename.
  const { fileKey } = getFileKey({ filename })

  const env = await getPlatformEnv()
  // Blob body works around Miniflare R2 put quirks (same as @payloadcms/storage-r2).
  const body = process.env.NODE_ENV === 'development' ? new Blob([bytes]) : bytes
  await env.R2.put(fileKey, body, {
    httpMetadata: {
      contentType: 'image/webp',
    },
  })

  const id = await ensureFeedDecorationRow(payload, title, filename, filesize)

  await payload.update({
    collection: 'feed-decorations',
    id,
    data: {
      alt: title,
      filename,
      mimeType: 'image/webp',
      filesize,
    },
    overrideAccess: true,
  })

  return id
}
