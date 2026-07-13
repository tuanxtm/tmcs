import { getPayload } from 'payload'
import config from '@payload-config'

export const testUser = {
  email: 'dev@payloadcms.com',
  password: 'test',
  name: 'E2E Admin',
  role: 'admin' as const,
  active: true,
}

export const managerUser = {
  email: 'e2e-manager@example.com',
  password: 'test',
  name: 'E2E Manager',
  role: 'manager' as const,
  active: true,
}

export const creatorUser = {
  email: 'e2e-creator@example.com',
  password: 'test',
  name: 'E2E Creator',
  role: 'creator' as const,
  active: true,
}

async function upsertUser(data: {
  email: string
  password: string
  name: string
  role: 'admin' | 'manager' | 'creator'
  active: boolean
}) {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: { email: { equals: data.email } },
    overrideAccess: true,
  })

  return payload.create({
    collection: 'users',
    data,
    overrideAccess: true,
  })
}

/**
 * Seeds admin/manager/creator users for e2e admin tests.
 */
export async function seedTestUser(): Promise<void> {
  await upsertUser(testUser)
  await upsertUser(managerUser)
  await upsertUser(creatorUser)
}

/**
 * Cleans up e2e users after tests
 */
export async function cleanupTestUser(): Promise<void> {
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'users',
    where: {
      email: {
        in: [testUser.email, managerUser.email, creatorUser.email],
      },
    },
    overrideAccess: true,
  })
}
