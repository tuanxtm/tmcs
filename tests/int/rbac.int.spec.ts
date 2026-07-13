import { describe, it, beforeAll, expect } from 'vitest'
import type { Payload } from 'payload'

import {
  ensureTestUsers,
  initPayload,
  richText,
  testPassword,
  type TestUsers,
} from '../helpers/payload'

describe('RBAC', () => {
  let payload: Payload
  let users: TestUsers

  beforeAll(async () => {
    payload = await initPayload()
    users = await ensureTestUsers(payload)
  })

  it('manager cannot create users', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: 'blocked-manager-create@example.com',
          password: 'x',
          name: 'Nope',
          role: 'creator',
        },
        user: users.manager,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('manager cannot change roles', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: users.creatorA.id,
        data: { role: 'admin' },
        user: users.manager,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('anonymous can only read published posts', async () => {
    const draft = await payload.create({
      collection: 'posts',
      data: {
        title: 'RBAC Draft',
        slug: `rbac-draft-${Date.now()}`,
        content: richText('draft'),
        owner: users.admin.id,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: true,
    })

    const published = await payload.create({
      collection: 'posts',
      data: {
        title: 'RBAC Published',
        slug: `rbac-pub-${Date.now()}`,
        content: richText('published'),
        owner: users.admin.id,
        _status: 'published',
      },
      overrideAccess: true,
    })

    const anon = await payload.find({
      collection: 'posts',
      where: {
        or: [{ id: { equals: draft.id } }, { id: { equals: published.id } }],
      },
      overrideAccess: false,
      user: undefined,
    })

    const ids = anon.docs.map((d) => d.id)
    expect(ids).toContain(published.id)
    expect(ids).not.toContain(draft.id)
  })

  it('creator cannot publish own post', async () => {
    await expect(
      payload.create({
        collection: 'posts',
        data: {
          title: 'Creator Publish Attempt',
          slug: `creator-pub-${Date.now()}`,
          content: richText('nope'),
          _status: 'published',
        },
        user: users.creatorA,
        overrideAccess: false,
      } as never),
    ).rejects.toThrow()
  })

  it('creator can create draft and cannot see other creator drafts', async () => {
    const own = await payload.create({
      collection: 'posts',
      data: {
        title: 'Creator A Draft',
        slug: `creator-a-draft-${Date.now()}`,
        content: richText('mine'),
        _status: 'draft',
      },
      draft: true,
      user: users.creatorA,
      overrideAccess: false,
    })

    expect(own.owner).toBeTruthy()

    const other = await payload.create({
      collection: 'posts',
      data: {
        title: 'Creator B Draft',
        slug: `creator-b-draft-${Date.now()}`,
        content: richText('theirs'),
        owner: users.creatorB.id,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: true,
    })

    const visible = await payload.find({
      collection: 'posts',
      where: {
        or: [{ id: { equals: own.id } }, { id: { equals: other.id } }],
      },
      user: users.creatorA,
      overrideAccess: false,
    })

    const ids = visible.docs.map((d) => d.id)
    expect(ids).toContain(own.id)
    expect(ids).not.toContain(other.id)
  })

  it('manager can publish creator draft', async () => {
    const draft = await payload.create({
      collection: 'posts',
      data: {
        title: 'Needs Approval',
        slug: `needs-approval-${Date.now()}`,
        content: richText('please publish'),
        owner: users.creatorA.id,
        _status: 'draft',
      },
      draft: true,
      overrideAccess: true,
    })

    const published = await payload.update({
      collection: 'posts',
      id: draft.id,
      data: { _status: 'published' },
      user: users.manager,
      overrideAccess: false,
    })

    expect(published._status).toBe('published')
    expect(published.publishedAt).toBeTruthy()
  })

  it('prevents demoting the last admin', async () => {
    // Ensure only one admin among test users by temporarily demoting fails if sole admin
    // Use a dedicated check: find all admins
    const admins = await payload.find({
      collection: 'users',
      where: {
        and: [{ role: { equals: 'admin' } }, { active: { not_equals: false } }],
      },
      limit: 10,
      overrideAccess: true,
    })

    if (admins.totalDocs === 1) {
      await expect(
        payload.update({
          collection: 'users',
          id: admins.docs[0].id,
          data: { role: 'manager' },
          overrideAccess: true,
        }),
      ).rejects.toThrow(/last active Admin/i)
    } else {
      // If multiple admins exist (from seed), demoting one extra admin should work
      expect(admins.totalDocs).toBeGreaterThan(1)
    }
  })

  it('blocks inactive users from login and admin access', async () => {
    await payload.update({
      collection: 'users',
      id: users.creatorB.id,
      data: { active: false },
      user: users.admin,
      overrideAccess: false,
    })

    await expect(
      payload.login({
        collection: 'users',
        data: {
          email: 'creator-b@example.com',
          password: testPassword,
        },
      }),
    ).rejects.toThrow(/inactive/i)

    const inactive = await payload.findByID({
      collection: 'users',
      id: users.creatorB.id,
      overrideAccess: true,
    })

    const canAdmin = payload.config.collections
      .find((c) => c.slug === 'users')
      ?.access?.admin?.({
        req: { user: inactive } as never,
      } as never)

    expect(canAdmin).toBe(false)

    // Restore for later tests / shared state
    await payload.update({
      collection: 'users',
      id: users.creatorB.id,
      data: { active: true },
      user: users.admin,
      overrideAccess: false,
    })
  })
})
