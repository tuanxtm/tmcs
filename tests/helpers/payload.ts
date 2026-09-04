/**
 * Shared helpers for integration tests.
 */

import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import type { User } from '@payload-types'

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

  // Subsequent upserts may flip `active`; pass an admin so beforeChange hooks allow it.
  async function upsertAsAdmin(
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
        user: admin,
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
      user: admin,
    })
  }

  const manager = await upsertAsAdmin({
    email: 'manager-test@example.com',
    name: 'Manager Test',
    role: 'manager',
  })
  const creatorA = await upsertAsAdmin({
    email: 'creator-a@example.com',
    name: 'Creator A',
    role: 'creator',
  })
  const creatorB = await upsertAsAdmin({
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

export const testPassword = password

/**
 * Ensure the two template Pages exist and return their IDs. Tests that create
 * Posts or Projects need to point at one of these (the `templatePage` field is
 * required on both collections).
 *
 * Idempotent - safe to call from every `beforeAll` block.
 */
export async function ensureTemplatePages(
  payload: Payload,
): Promise<{ postTemplatePageId: number; projectTemplatePageId: number }> {
  const upsertPage = async (
    slug: string,
    layout: { id: string; blockType: 'detailPost' | 'detailProject' }[],
  ): Promise<number> => {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs[0]) {
      // Make sure the layout is current even on a reused page.
      const id = existing.docs[0].id
      await payload.update({
        collection: 'pages',
        id,
        data: { layout },
        overrideAccess: true,
      })
      return id
    }
    const created = await payload.create({
      collection: 'pages',
      data: {
        title: slug,
        slug,
        template: 'generic',
        layout,
        _status: 'published',
        translationReady: { vi: true },
      },
      locale: 'en',
      overrideAccess: true,
    })
    // Mirror the same layout into the `vi` locale so vi-locale tests work.
    await payload.update({
      collection: 'pages',
      id: created.id,
      data: { layout },
      locale: 'vi',
      overrideAccess: true,
    })
    return created.id
  }

  const postTemplatePageId = await upsertPage('post-detail-default', [
    { id: 'seed-post-template-detail', blockType: 'detailPost' },
  ])
  const projectTemplatePageId = await upsertPage('project-detail-default', [
    { id: 'seed-project-template-detail', blockType: 'detailProject' },
  ])

  return { postTemplatePageId, projectTemplatePageId }
}
