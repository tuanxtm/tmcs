import type { Where } from 'payload'

/** Shared published-status filter for public Local API reads and access control. */
export const publishedStatusWhere: Where = {
  _status: {
    equals: 'published',
  },
}
