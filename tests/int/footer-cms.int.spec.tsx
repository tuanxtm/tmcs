import { beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { renderToStaticMarkup } from 'react-dom/server'
import { CmsRichText } from '@/app/(frontend)/_components/cms/rich-text'
import { resolvePageBlocks } from '@/app/(frontend)/_lib/page-data'
import { ensureTestUsers, initPayload, richText, type TestUsers } from '../helpers/payload'

describe('Footer inline images', () => {
  let payload: Payload
  let users: TestUsers
  let imageId: number

  beforeAll(async () => {
    payload = await initPayload()
    users = await ensureTestUsers(payload)
    // Seed image metadata directly; binary R2 uploads are outside this footer test.
    const image = await payload.db.create({
      collection: 'inline-images',
      data: {
        alt: { en: 'Footer inline sample', vi: 'Ảnh nội tuyến chân trang' },
        filename: `footer-inline-fixture-${Date.now()}.webp`,
        mimeType: 'image/webp',
        width: 100,
        height: 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    imageId = image.id
  })

  it.each(['en', 'vi'] as const)(
    'saves and renders a %s footer through the CMS and page resolver',
    async (locale) => {
      const text = richText(locale === 'vi' ? 'Cùng sáng tạo.' : 'Let’s create something.')
      const footerText = {
        ...text,
        root: {
          ...text.root,
          children: [
            {
              ...text.root.children[0],
              children: [
                ...text.root.children[0].children,
                {
                  type: 'inlineBlock',
                  version: 2,
                  fields: {
                    id: `footer-image-${locale}`,
                    blockType: 'heroInlineImage',
                    image: imageId,
                    scale: 1.5,
                    align: 'text-bottom',
                  },
                },
              ],
            },
          ],
        },
      }
      const page = await payload.create({
        collection: 'pages',
        locale,
        data: {
          title: `Footer CMS ${locale}`,
          slug: `footer-cms-${locale}-${Date.now()}`,
          template: 'generic',
          _status: 'published',
          layout: [{ blockType: 'pageFooter', footerText }],
        },
        user: users.admin,
        overrideAccess: false,
        context: { disableRevalidate: true },
      })
      const read = await payload.findByID({
        collection: 'pages',
        id: page.id,
        locale,
        depth: 2,
        overrideAccess: false,
      })
      const [block] = await resolvePageBlocks(read.layout, locale)
      expect(block.blockType).toBe('pageFooter')
      if (block.blockType !== 'pageFooter' || !block.footerText) throw new Error('Missing footer')
      const markup = renderToStaticMarkup(
        <CmsRichText data={block.footerText} lineSpacing="uniform" />,
      )
      expect(markup).toContain(locale === 'vi' ? 'Cùng sáng tạo.' : 'Let’s create something.')
      expect(markup).toContain(
        locale === 'vi' ? 'Ảnh nội tuyến chân trang' : 'Footer inline sample',
      )
      expect(markup).toContain('<img')
      expect(markup).toContain('data-inline-image-uniform="true"')
    },
  )
})
