/**
 * Role constants and helpers for RBAC.
 *
 * Roles (one per user):
 * - admin: full access including user/role management
 * - manager: editorial + site content; cannot manage users/roles
 * - creator: own Posts/Projects drafts only; cannot publish
 */

export const ROLES = ['admin', 'manager', 'creator'] as const

export type Role = (typeof ROLES)[number]

export type UserWithRole = {
  id: number | string
  role?: Role | null
  active?: boolean | null
}

export const isAdmin = (user?: UserWithRole | null): boolean => user?.role === 'admin'

export const isManager = (user?: UserWithRole | null): boolean => user?.role === 'manager'

export const isCreator = (user?: UserWithRole | null): boolean => user?.role === 'creator'

export const isAdminOrManager = (user?: UserWithRole | null): boolean =>
  Boolean(user && (user.role === 'admin' || user.role === 'manager'))

export const isStaff = (user?: UserWithRole | null): boolean =>
  Boolean(user && ROLES.includes(user.role as Role))

export const getUserId = (user?: UserWithRole | null): number | string | undefined => user?.id
