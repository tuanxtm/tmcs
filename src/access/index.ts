import type { Access, AccessArgs, FieldAccess, Where } from 'payload'

import {
  getUserId,
  isAdmin,
  isAdminOrManager,
  isCreator,
  isStaff,
  type UserWithRole,
} from '@/lib/roles'

type AccessUser = UserWithRole | null | undefined

const asUser = (user: AccessArgs['req']['user']): AccessUser => user as AccessUser

export const anyone: Access = () => true

export const adminOrManager: Access = ({ req: { user } }) => isAdminOrManager(asUser(user))

export const staffOnly: Access = ({ req: { user } }) => isStaff(asUser(user))

/** Public reads published docs; staff reads all. Creators read only their own. */
export const publishedOrOwned: Access = ({ req: { user } }): boolean | Where => {
  const current = asUser(user)

  if (!current) {
    return {
      _status: {
        equals: 'published',
      },
    }
  }

  if (isAdminOrManager(current)) {
    return true
  }

  if (isCreator(current)) {
    return {
      owner: {
        equals: getUserId(current),
      },
    }
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}

/** Public reads published docs; Admin/Manager read all; others get published only. */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (isAdminOrManager(asUser(user))) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}

export const approvedOrStaff: Access = ({ req: { user } }) => {
  if (isAdminOrManager(asUser(user))) return true

  return {
    approved: {
      equals: true,
    },
  }
}

/**
 * Creators may create drafts only.
 * Admin/Manager may create published or draft docs.
 */
export const canCreateOwnedContent: Access = ({ req: { user }, data }) => {
  const current = asUser(user)
  if (!current) return false

  if (isAdminOrManager(current)) return true

  if (isCreator(current)) {
    // Reject publish attempts at create time (also hides Publish in Admin UI).
    if (data?._status === 'published') return false
    return true
  }

  return false
}

/**
 * Admin/Manager: full update.
 * Creators: own docs only, and cannot publish/unpublish via `_status: 'published'`.
 */
export const canUpdateOwnedContent: Access = ({ req: { user }, data }) => {
  const current = asUser(user)
  if (!current) return false

  if (isAdminOrManager(current)) return true

  if (isCreator(current)) {
    if (data?._status === 'published') return false

    return {
      owner: {
        equals: getUserId(current),
      },
    } as Where
  }

  return false
}

export const canDeleteOwnedContent: Access = ({ req: { user } }) => {
  const current = asUser(user)
  if (!current) return false

  if (isAdminOrManager(current)) return true

  if (isCreator(current)) {
    return {
      owner: {
        equals: getUserId(current),
      },
    }
  }

  return false
}

export const canReadOwnVersions: Access = ({ req: { user } }) => {
  const current = asUser(user)
  if (!current) return false
  if (isAdminOrManager(current)) return true

  if (isCreator(current)) {
    return {
      owner: {
        equals: getUserId(current),
      },
    }
  }

  return false
}

/** Media: public read; Admin/Manager write all; Creator write own. */
export const canUpdateOwnMedia: Access = ({ req: { user } }) => {
  const current = asUser(user)
  if (!current) return false
  if (isAdminOrManager(current)) return true

  if (isCreator(current)) {
    return {
      uploadedBy: {
        equals: getUserId(current),
      },
    }
  }

  return false
}

export const canDeleteOwnMedia: Access = canUpdateOwnMedia

/** Contact submissions: Admin/Manager only. */
export const contactStaffOnly: Access = ({ req: { user } }) => isAdminOrManager(asUser(user))

export const fieldAdminOnly: FieldAccess = ({ req: { user } }) => isAdmin(asUser(user))

export const fieldAdminOrManager: FieldAccess = ({ req: { user } }) =>
  isAdminOrManager(asUser(user))

/** Users collection access — Admin only for create/delete/unlock. */
export const usersAdminAccess: Access = ({ req: { user } }) => isAdmin(asUser(user))

export const usersReadAccess: Access = ({ req: { user } }) => {
  const current = asUser(user)
  if (!current) return false
  if (isAdmin(current)) return true

  // Authenticated users can read themselves only (for account UI).
  return {
    id: {
      equals: getUserId(current),
    },
  }
}

export const usersUpdateAccess: Access = ({ req: { user } }) => {
  const current = asUser(user)
  if (!current) return false
  if (isAdmin(current)) return true

  return {
    id: {
      equals: getUserId(current),
    },
  }
}
