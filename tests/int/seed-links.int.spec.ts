import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'

import { upsertSeedLink } from '../../src/scripts/seed-links'
import { ensureTestUsers, initPayload, type TestUsers } from '../helpers/payload'

describe('Seed links and navigation deletion', () => {
  let payload: Payload
  let users: TestUsers
  const linkIDs = new Set<number>()
  const settingsIDs: number[] = []
  const versionIDs: number[] = []
  const stamp = `seed-link-${Date.now()}`

  beforeAll(async () => {
    payload = await initPayload()
    users = await ensureTestUsers(payload)
  })

  afterAll(async () => {
    for (const id of linkIDs) {
      await payload.delete({
        collection: 'links',
        where: { id: { equals: id } },
        overrideAccess: true,
      })
    }
    const db = payload.db.binding
    for (const id of settingsIDs) {
      await db.prepare('DELETE FROM site_settings WHERE id = ?').bind(id).run()
    }
    for (const id of versionIDs) {
      await db.prepare('DELETE FROM _site_settings_v WHERE id = ?').bind(id).run()
    }
  })

  async function createLink(label: string, locale: 'en' | 'vi' = 'en') {
    const link = await payload.create({
      collection: 'links',
      data: {
        label,
        category: 'social',
        linkType: 'external',
        url: 'https://example.com',
        newTab: true,
      },
      locale,
      overrideAccess: true,
    })
    linkIDs.add(link.id)
    return link
  }

  async function addNavigation(parentLink: number, childLink = parentLink) {
    const db = payload.db.binding
    const settings = await db
      .prepare('INSERT INTO site_settings (site_url) VALUES (?) RETURNING id')
      .bind('https://example.com')
      .first<{ id: number }>()
    const version = await db
      .prepare('INSERT INTO _site_settings_v (version_site_url) VALUES (?) RETURNING id')
      .bind('https://example.com')
      .first<{ id: number }>()
    if (!settings || !version) throw new Error('Failed to create navigation fixtures')
    settingsIDs.push(settings.id)
    versionIDs.push(version.id)
    const navID = `${stamp}-${settings.id}`
    await db
      .prepare(
        'INSERT INTO site_settings_navigation (_order, _parent_id, id, link_id) VALUES (1, ?, ?, ?)',
      )
      .bind(settings.id, navID, parentLink)
      .run()
    await db
      .prepare(
        'INSERT INTO site_settings_navigation_children (_order, _parent_id, id, link_id) VALUES (1, ?, ?, ?)',
      )
      .bind(navID, `${navID}-child`, childLink)
      .run()
    const navVersion = await db
      .prepare(
        'INSERT INTO _site_settings_v_version_navigation (_order, _parent_id, link_id) VALUES (1, ?, ?) RETURNING id',
      )
      .bind(version.id, parentLink)
      .first<{ id: number }>()
    if (!navVersion) throw new Error('Failed to create version fixture')
    await db
      .prepare(
        'INSERT INTO _site_settings_v_version_navigation_children (_order, _parent_id, link_id) VALUES (1, ?, ?)',
      )
      .bind(navVersion.id, childLink)
      .run()
    return { navID, navVersionID: navVersion.id }
  }

  it('merges legacy locale duplicates, preserves references and stays idempotent', async () => {
    const en = await createLink(`${stamp}-en`)
    const vi = await createLink(`${stamp}-vi`, 'vi')
    const navigation = await addNavigation(vi.id)
    const data = {
      label: { en: en.label, vi: vi.label },
      category: 'social' as const,
      linkType: 'external' as const,
      url: 'https://example.com',
      newTab: true,
    }

    expect(await upsertSeedLink(payload, data)).toEqual({ id: en.id })
    expect(await upsertSeedLink(payload, data)).toEqual({ id: en.id })
    const translated = await payload.findByID({
      collection: 'links',
      id: en.id,
      locale: 'vi',
      fallbackLocale: false,
    })
    expect(translated.label).toBe(vi.label)
    expect(
      (await payload.find({ collection: 'links', where: { id: { equals: vi.id } } })).docs,
    ).toHaveLength(0)
    const db = payload.db.binding
    for (const [table, id] of [
      ['site_settings_navigation', navigation.navID],
      ['site_settings_navigation_children', `${navigation.navID}-child`],
      ['_site_settings_v_version_navigation', navigation.navVersionID],
    ] as const) {
      expect(
        await db.prepare(`SELECT link_id FROM "${table}" WHERE id = ?`).bind(id).first(),
      ).toEqual({ link_id: en.id })
    }
    expect(
      await db
        .prepare(
          'SELECT link_id FROM _site_settings_v_version_navigation_children WHERE _parent_id = ?',
        )
        .bind(navigation.navVersionID)
        .first(),
    ).toEqual({ link_id: en.id })
  })

  it('preserves an edited Vietnamese duplicate', async () => {
    const vi = await createLink(`${stamp}-edited-vi`, 'vi')
    await payload.update({
      collection: 'links',
      id: vi.id,
      data: { url: 'https://example.com/edited' },
      locale: 'vi',
      overrideAccess: true,
    })
    const result = await upsertSeedLink(payload, {
      label: { en: `${stamp}-edited-en`, vi: vi.label },
      category: 'social',
      linkType: 'external',
      url: 'https://example.com',
      newTab: true,
    })
    linkIDs.add(result.id)
    expect((await payload.findByID({ collection: 'links', id: vi.id })).url).toBe(
      'https://example.com/edited',
    )
  })

  it('deletes a child link without removing its parent, then bulk-deletes referenced links', async () => {
    const parent = await createLink(`${stamp}-parent`)
    const child = await createLink(`${stamp}-child`, 'vi')
    const second = await createLink(`${stamp}-second`, 'vi')
    const navigation = await addNavigation(parent.id, child.id)
    await addNavigation(second.id)

    await payload.delete({
      collection: 'links',
      id: child.id,
      locale: 'en',
      user: users.admin,
      overrideAccess: false,
    })
    const db = payload.db.binding
    expect(
      await db
        .prepare('SELECT link_id FROM site_settings_navigation WHERE id = ?')
        .bind(navigation.navID)
        .first(),
    ).toEqual({ link_id: parent.id })
    expect(
      await db
        .prepare('SELECT id FROM site_settings_navigation_children WHERE _parent_id = ?')
        .bind(navigation.navID)
        .first(),
    ).toBeNull()
    expect(
      await db
        .prepare('SELECT id FROM _site_settings_v_version_navigation_children WHERE _parent_id = ?')
        .bind(navigation.navVersionID)
        .first(),
    ).toBeNull()

    const result = await payload.delete({
      collection: 'links',
      where: { and: [{ id: { in: [parent.id, second.id] } }] },
      locale: 'en',
      user: users.admin,
      overrideAccess: false,
    })
    expect(result.errors).toEqual([])
    expect(result.docs.map(({ id }) => id).sort()).toEqual([parent.id, second.id].sort())
    expect(
      await db
        .prepare('SELECT id FROM site_settings_navigation WHERE id = ?')
        .bind(navigation.navID)
        .first(),
    ).toBeNull()
    expect(
      await db
        .prepare('SELECT id FROM _site_settings_v_version_navigation WHERE id = ?')
        .bind(navigation.navVersionID)
        .first(),
    ).toBeNull()
  })
})
