import type { VideoCardView, VideoProvider } from '@/app/(frontend)/_lib/types'

/**
 * Shared provider constants and helpers for the Videos section.
 *
 * Lives next to the existing per-feed modules (projects-feed, things-feed)
 * so the rest of the codebase keeps importing from `_lib/`.
 */

/** Fixed display order for provider rows in the Videos section. */
export const VIDEOS_PROVIDER_ORDER: VideoProvider[] = [
  'youtube',
  'instagram',
  'tiktok',
  'other',
]

/** English labels rendered in the provider heading (h3). */
export const VIDEOS_PROVIDER_LABEL: Record<VideoProvider, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  other: 'Other',
}

/** Per-provider cap. Plan §2.1 keeps this hard-coded; the block-level limit
 *  is normalized separately and capped at this ceiling. */
export const VIDEOS_PROVIDER_LIMIT = 10

/**
 * Normalize a stored block-level limit to a per-provider cap.
 *
 * | Input                       | Per-provider cap |
 * | Missing or non-finite      | 10              |
 * | Below 1                    | 1               |
 * | Fractional                 | floor, then clamp |
 * | 1 through 10               | saved value     |
 * | Above 10                   | 10              |
 */
export function normalizeVideoProviderLimit(limit: number | null | undefined): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return VIDEOS_PROVIDER_LIMIT
  const floored = Math.floor(limit)
  return Math.min(VIDEOS_PROVIDER_LIMIT, Math.max(1, floored))
}

/**
 * Group already-flat, already-capped preview cards by provider while
 * preserving the order they arrived in within that provider.
 *
 * Empty providers are omitted entirely so the renderer can simply skip
 * them. The iteration is stable: callers can use `Object.entries(...)` to
 * render rows in the canonical provider order.
 */
export function groupVideosByProvider(
  cards: readonly VideoCardView[],
): Record<VideoProvider, VideoCardView[]> {
  const grouped: Record<VideoProvider, VideoCardView[]> = {
    youtube: [],
    instagram: [],
    tiktok: [],
    other: [],
  }
  for (const card of cards) {
    grouped[card.provider].push(card)
  }
  return grouped
}