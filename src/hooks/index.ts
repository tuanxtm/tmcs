import { APIError } from 'payload'
import type { CollectionBeforeChangeHook } from 'payload'

import { estimateReadingMinutes } from '@/lib/readingTime'
import { getUserId, isAdmin, isAdminOrManager, isCreator, type UserWithRole } from '@/lib/roles'

const asUser = (user: unknown): UserWithRole | null => (user as UserWithRole) ?? null

/**
 * Assign owner on create. Creators cannot reassign ownership.
 */
export const assignOwner: CollectionBeforeChangeHook = ({ data, operation, req, originalDoc }) => {
  const user = asUser(req.user)

  if (operation === 'create') {
    if (!data.owner && user?.id != null) {
      data.owner = getUserId(user)
    }
  }

  if (operation === 'update' && isCreator(user)) {
    const existingOwner =
      typeof originalDoc?.owner === 'object' ? originalDoc?.owner?.id : originalDoc?.owner
    if (
      data.owner != null &&
      existingOwner != null &&
      String(data.owner) !== String(existingOwner)
    ) {
      throw new APIError('Creators cannot reassign ownership', 403)
    }
    // Preserve existing owner
    if (existingOwner != null) {
      data.owner = existingOwner
    }
  }

  return data
}

/**
 * Set publishedAt on first publication without overwriting later edits.
 */
export const setPublishedAt: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (data._status === 'published' && !originalDoc?.publishedAt && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  return data
}

/**
 * Defensive publish guard for Creators (access control is primary).
 */
export const preventCreatorPublish: CollectionBeforeChangeHook = ({ data, originalDoc, req }) => {
  const user = asUser(req.user)
  if (!isCreator(user)) return data

  if (data._status === 'published') {
    throw new APIError('Creators cannot publish content. Ask a Manager or Admin.', 403)
  }

  // Prevent unpublish via status flip if somehow sent
  if (originalDoc?._status === 'published' && data._status === 'draft') {
    throw new APIError('Creators cannot unpublish content.', 403)
  }

  return data
}

/**
 * Calculate reading time from Lexical content.
 */
export const setReadingTime: CollectionBeforeChangeHook = ({ data }) => {
  if (data.content) {
    data.readingTime = estimateReadingMinutes(data.content)
  }
  return data
}

/**
 * Assign uploadedBy on media create.
 */
export const assignUploadedBy: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  const user = asUser(req.user)
  if (operation === 'create' && !data.uploadedBy && user?.id != null) {
    data.uploadedBy = getUserId(user)
  }
  return data
}

/**
 * Prevent demotion/deletion of the last active Admin.
 */
export const protectLastAdmin: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation !== 'update') return data

  const wasAdmin = originalDoc?.role === 'admin' && originalDoc?.active !== false
  const willBeNonAdmin = (data.role && data.role !== 'admin') || data.active === false

  if (!wasAdmin || !willBeNonAdmin) return data

  const admins = await req.payload.find({
    collection: 'users',
    where: {
      and: [{ role: { equals: 'admin' } }, { active: { not_equals: false } }],
    },
    limit: 2,
    depth: 0,
    overrideAccess: true,
    req,
  })

  if (admins.totalDocs <= 1) {
    throw new APIError('Cannot demote or deactivate the last active Admin', 400)
  }

  return data
}

export const preventLastAdminDelete = async ({
  id,
  req,
}: {
  id: number | string
  req: { payload: import('payload').Payload; context?: Record<string, unknown> }
}): Promise<void> => {
  const user = await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
    req: req as never,
  })

  if (user?.role !== 'admin' || user?.active === false) return

  const admins = await req.payload.find({
    collection: 'users',
    where: {
      and: [{ role: { equals: 'admin' } }, { active: { not_equals: false } }],
    },
    limit: 2,
    depth: 0,
    overrideAccess: true,
    req: req as never,
  })

  if (admins.totalDocs <= 1) {
    throw new APIError('Cannot delete the last active Admin', 400)
  }
}

/**
 * Only Admin may change role / active fields (field access is primary).
 */
export const preventSelfRoleEscalation: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
  operation,
}) => {
  const user = asUser(req.user)
  if (isAdmin(user)) return data

  if (operation === 'update') {
    if (data.role != null && data.role !== originalDoc?.role) {
      throw new APIError('Only Admins can change roles', 403)
    }
    if (data.active != null && data.active !== originalDoc?.active) {
      throw new APIError('Only Admins can change account active state', 403)
    }
  }

  return data
}

export const ensureCreatorCannotChangeApproval: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  const user = asUser(req.user)
  if (isAdminOrManager(user)) return data

  if (isCreator(user)) {
    if (data.approved != null && data.approved !== originalDoc?.approved) {
      throw new APIError('Creators cannot change approval state', 403)
    }
  }

  return data
}
