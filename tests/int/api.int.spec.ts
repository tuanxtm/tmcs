import { getPayload, Payload } from 'payload'
import config from '@payload-config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('API smoke', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('initializes payload and lists collections', async () => {
    const slugs = payload.config.collections.map((c) => c.slug)
    expect(slugs).toEqual(
      expect.arrayContaining([
        'users',
        'media',
        'posts',
        'projects',
        'pages',
        'categories',
        'tags',
        'authors',
        'contact-submissions',
      ]),
    )
    expect(slugs).not.toContain('skills')
    expect(slugs).not.toContain('experience')
    expect(slugs).not.toContain('testimonials')
  })

  it('has expected globals', async () => {
    expect(payload.config.globals.map((g) => g.slug)).toEqual(
      expect.arrayContaining(['site-settings', 'navigation', 'footer', 'homepage']),
    )
  })

  it('has en/vi localization', async () => {
    expect(payload.config.localization).toBeTruthy()
    if (payload.config.localization) {
      const codes = payload.config.localization.locales.map((l) =>
        typeof l === 'string' ? l : l.code,
      )
      expect(codes).toEqual(expect.arrayContaining(['en', 'vi']))
      expect(payload.config.localization.defaultLocale).toBe('en')
    }
  })

  it('disables GraphQL', async () => {
    expect(payload.config.graphQL?.disable).toBe(true)
  })

  it('restricts jobs.run to staff or cron', async () => {
    const access = payload.config.jobs?.access?.run
    expect(typeof access).toBe('function')
    if (typeof access !== 'function') return

    const denyCreator = access({
      req: {
        user: { id: 1, role: 'creator', collection: 'users' },
        headers: new Headers(),
      },
    } as never)
    expect(denyCreator).toBe(false)

    const allowManager = access({
      req: {
        user: { id: 2, role: 'manager', collection: 'users' },
        headers: new Headers(),
      },
    } as never)
    expect(allowManager).toBe(true)

    process.env.CRON_SECRET = process.env.CRON_SECRET || 'test-cron-secret'
    const allowCron = access({
      req: {
        user: null,
        headers: new Headers({ 'x-cron-secret': process.env.CRON_SECRET }),
      },
    } as never)
    expect(allowCron).toBe(true)
  })
})
