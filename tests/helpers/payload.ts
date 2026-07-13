/**
 * Shared helpers for integration tests.
 */

import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { User } from '@/payload-types'

export type TestUsers = {
  admin: User
  manager: User
  creatorA: User
  creatorB: User
}

const password = 'TestPassword123!'

export async function initPayload(): Promise<Payload> {
  const payloadConfig = await config
  return getPayload({ config: payloadConfig })
}

async function upsertUser(
  payload: Payload,
  data: { email: string; name: string; role: 'admin' | 'manager' | 'creator' },
): Promise<User> {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: data.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    return payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        name: data.name,
        role: data.role,
        active: true,
        password,
      },
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'users',
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      active: true,
      password,
    },
    overrideAccess: true,
  })
}

export async function ensureTestUsers(payload: Payload): Promise<TestUsers> {
  const admin = await upsertUser(payload, {
    email: 'admin-test@example.com',
    name: 'Admin Test',
    role: 'admin',
  })
  const manager = await upsertUser(payload, {
    email: 'manager-test@example.com',
    name: 'Manager Test',
    role: 'manager',
  })
  const creatorA = await upsertUser(payload, {
    email: 'creator-a@example.com',
    name: 'Creator A',
    role: 'creator',
  })
  const creatorB = await upsertUser(payload, {
    email: 'creator-b@example.com',
    name: 'Creator B',
    role: 'creator',
  })

  return { admin, manager, creatorA, creatorB }
}

export const richText = (text: string) => ({
  root: {
    type: 'root' as const,
    children: [
      {
        type: 'paragraph' as const,
        children: [{ type: 'text' as const, text, version: 1 as const }],
        version: 1 as const,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0 as const,
    version: 1 as const,
  },
})

export { password as testPassword }
