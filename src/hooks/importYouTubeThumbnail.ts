import type { CollectionBeforeChangeHook, File, PayloadRequest } from 'payload'

import { parseYouTubeVideoId, youtubeThumbnailUrls } from '@/lib/youtube'

type UploadFile = File & { data: Buffer }

function relationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (value && typeof value === 'object' && 'id' in value && typeof (value as { id: unknown }).id === 'number') {
    return (value as { id: number }).id
  }
  return null
}

async function fetchYouTubeThumbnail(videoId: string): Promise<{
  buffer: Buffer
  mimeType: string
  filename: string
} | null> {
  const urls = youtubeThumbnailUrls(videoId)

  for (const url of [urls.max, urls.hq]) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'image/jpeg,image/*;q=0.8' },
        signal: AbortSignal.timeout(12_000),
      })
      if (!response.ok) continue

      const contentType = response.headers.get('content-type') || 'image/jpeg'
      if (!contentType.startsWith('image/')) continue

      const bytes = Buffer.from(await response.arrayBuffer())
      // maxresdefault often returns a tiny placeholder (~1KB) when missing.
      if (bytes.byteLength < 5_000 && url === urls.max) continue
      if (bytes.byteLength < 500) continue

      const ext = contentType.includes('png') ? 'png' : 'jpg'
      return {
        buffer: bytes,
        mimeType: contentType.split(';')[0] || 'image/jpeg',
        filename: `youtube-${videoId}.${ext}`,
      }
    } catch {
      // Try fallback URL
    }
  }

  return null
}

async function createMediaFromBuffer(
  req: PayloadRequest,
  file: { buffer: Buffer; mimeType: string; filename: string },
  alt: string,
  sourceUrl: string,
): Promise<number | null> {
  const upload: UploadFile = {
    data: file.buffer,
    mimetype: file.mimeType,
    name: file.filename,
    size: file.buffer.byteLength,
  }

  try {
    const media = await req.payload.create({
      collection: 'media',
      data: {
        alt,
        kind: 'image',
        sourceUrl,
      },
      file: upload,
      req,
      // Mirror staff upload path; req.user still applies ownership via assignUploadedBy.
      overrideAccess: true,
      context: {
        disableRevalidate: true,
        skipHooks: false,
      },
    })
    return typeof media.id === 'number' ? media.id : null
  } catch (error) {
    req.payload.logger?.warn?.(
      `YouTube thumbnail import failed: ${error instanceof Error ? error.message : String(error)}`,
    )
    return null
  }
}

/**
 * On create/update: if provider is YouTube and thumbnail is empty, fetch once and attach Media.
 * Never overwrites a manually chosen thumbnail. No-op for other providers.
 */
export const importYouTubeThumbnail: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  if (data.provider !== 'youtube' && originalDoc?.provider !== 'youtube') {
    return data
  }

  const provider = data.provider ?? originalDoc?.provider
  if (provider !== 'youtube') return data

  const existingThumb =
    relationId(data.thumbnail) ??
    (operation === 'update' ? relationId(originalDoc?.thumbnail) : null)
  if (existingThumb != null) return data

  const sourceUrl =
    (typeof data.sourceUrl === 'string' && data.sourceUrl) ||
    (typeof originalDoc?.sourceUrl === 'string' ? originalDoc.sourceUrl : '')
  if (!sourceUrl) return data

  const videoId = parseYouTubeVideoId(sourceUrl)
  if (!videoId) return data

  // Avoid re-fetching on every update when a previous attempt already failed and
  // left thumbnail empty — only run when source URL changed or on create.
  if (operation === 'update') {
    const prevUrl = typeof originalDoc?.sourceUrl === 'string' ? originalDoc.sourceUrl : ''
    if (prevUrl === sourceUrl && relationId(originalDoc?.thumbnail) == null) {
      // Allow one retry only when explicitly clearing isn't the case; skip loops.
      // Still attempt if previous doc never had a thumbnail and URL unchanged —
      // editors can re-save after fixing network. Cap via context flag.
      if (req.context?.youtubeThumbAttempted) return data
    }
  }

  req.context.youtubeThumbAttempted = true

  const file = await fetchYouTubeThumbnail(videoId)
  if (!file) return data

  const title =
    (typeof data.title === 'string' && data.title) ||
    (typeof originalDoc?.title === 'string' ? originalDoc.title : 'YouTube video')

  const mediaId = await createMediaFromBuffer(
    req,
    file,
    `Thumbnail for ${title}`,
    youtubeThumbnailUrls(videoId).hq,
  )
  if (mediaId != null) {
    data.thumbnail = mediaId
  }

  return data
}
