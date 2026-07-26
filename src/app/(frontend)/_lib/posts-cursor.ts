export type PostsCursor = {
  publishedAt: string
  id: number
}

const CURSOR_PREFIX = 'p1.'

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

export function encodePostsCursor(cursor: PostsCursor): string {
  return `${CURSOR_PREFIX}${encodeBase64Url(JSON.stringify(cursor))}`
}

export function decodePostsCursor(raw: string | null | undefined): PostsCursor | null {
  if (!raw || typeof raw !== 'string') return null
  if (!raw.startsWith(CURSOR_PREFIX)) return null

  try {
    const parsed = JSON.parse(decodeBase64Url(raw.slice(CURSOR_PREFIX.length))) as unknown
    if (!parsed || typeof parsed !== 'object') return null

    const publishedAt = (parsed as { publishedAt?: unknown }).publishedAt
    const id = (parsed as { id?: unknown }).id

    if (typeof publishedAt !== 'string' || !publishedAt) return null
    if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) return null
    if (Number.isNaN(Date.parse(publishedAt))) return null

    return { publishedAt, id }
  } catch {
    return null
  }
}

/** Opaque cursor for the last item of a page (newest-first, id tie-break). */
export function cursorFromPost(post: {
  id: number
  publishedAt: string | null
}): string | null {
  if (!post.publishedAt) return null
  return encodePostsCursor({ publishedAt: post.publishedAt, id: post.id })
}
