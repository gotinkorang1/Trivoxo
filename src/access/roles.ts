import type { Access, FieldAccess } from 'payload'

/**
 * Staff roles (§80). `super-admin` implicitly passes every role check.
 * A user may hold several roles (Users.roles is hasMany).
 */
export const ROLES = [
  { label: 'Super Admin', value: 'super-admin' },
  { label: 'Operations Manager', value: 'operations' },
  { label: 'Content Editor', value: 'content-editor' },
  { label: 'Event Manager', value: 'event-manager' },
  { label: 'Finance', value: 'finance' },
  { label: 'Check-in Staff', value: 'checkin' },
] as const

export type Role = (typeof ROLES)[number]['value']

type WithRoles = { roles?: Role[] | null }

function rolesOf(user: unknown): Role[] {
  return ((user as WithRoles | null)?.roles ?? []) as Role[]
}

/** Public — anyone, authenticated or not. */
export const anyone: Access = () => true

/** Any signed-in user (staff). */
export const authenticated: Access = ({ req }) => Boolean(req.user)

/**
 * Collection-level access gated by role. Super Admins always pass.
 * Usage: `access: { update: hasRole('operations') }`
 */
export const hasRole =
  (...allowed: Role[]): Access =>
  ({ req }) => {
    if (!req.user) return false
    const roles = rolesOf(req.user)
    if (roles.includes('super-admin')) return true
    return allowed.some((r) => roles.includes(r))
  }

/** Field-level variant of {@link hasRole}. */
export const fieldHasRole =
  (...allowed: Role[]): FieldAccess =>
  ({ req }) => {
    if (!req.user) return false
    const roles = rolesOf(req.user)
    if (roles.includes('super-admin')) return true
    return allowed.some((r) => roles.includes(r))
  }

/** True only for Super Admins. */
export const isSuperAdmin: Access = ({ req }) => rolesOf(req.user).includes('super-admin')
