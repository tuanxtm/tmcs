import { createRoot } from 'react-dom/client'
import { FooterBlock } from '@/app/(frontend)/_components/blocks/footer/footer'
import { CursorPopup } from '@/app/(frontend)/_components/layout/cursor-popup'
import type { PageFooterBlockView } from '@/app/(frontend)/_lib/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import '@/app/(frontend)/styles.css'
import pageStyles from '@/app/(frontend)/_components/blocks/page-blocks/page-blocks.module.css'
import headerStyles from '@/app/(frontend)/_components/layout/_styles/site-header.module.css'

const params = new URLSearchParams(location.search)
const locale = params.get('locale') === 'vi' ? 'vi' : 'en'
document.documentElement.lang = locale
document.documentElement.style.setProperty('--font-jetbrains-mono', 'monospace')
document.documentElement.classList.toggle('dark', params.has('dark'))
const text = locale === 'vi' ? 'Cùng làm nên điều thú vị. ' : 'Let’s build something that clicks. '
const paragraph = {
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: [
      {
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        children: [
          { type: 'text', text: text.repeat(params.has('long') ? 15 : 1), version: 1 },
          {
            type: 'inlineBlock',
            version: 2,
            fields: {
              blockType: 'heroInlineImage',
              id: 'footer-inline',
              scale: 1.5,
              align: 'text-bottom',
              image: {
                id: 1,
                url: '/src/assets/images/beam_1x1.webp',
                width: 100,
                height: 100,
                alt: 'Footer inline image',
              },
            },
          },
          {
            type: 'text',
            text: locale === 'vi' ? ' Để lại dấu ấn.' : ' Make your mark.',
            version: 1,
          },
        ],
      },
    ],
  },
} as DefaultTypedEditorState

const links = Array.from({ length: 5 }, (_, index) => ({
  id: String(index),
  label: ['Website', 'GitHub', 'Instagram', 'LinkedIn', 'YouTube'][index],
  href: `https://example.com/${index}`,
  newTab: index === 0,
  external: true,
}))
const block: PageFooterBlockView = {
  blockType: 'pageFooter',
  id: 'footer-fixture',
  footerText: paragraph,
  labelSocialLinks: locale === 'vi' ? 'Mạng xã hội' : 'Social',
  socialLinks: params.has('empty') ? [] : links,
  labelOtherLinks: locale === 'vi' ? 'Khám phá' : 'Explore',
  otherLinks: params.has('empty') ? [] : links.slice(0, 3),
  cursorPopup: null,
  copyright: '© {{year}} TMCS. All rights reserved.',
}

createRoot(document.getElementById('root')!).render(
  <div
    style={{
      padding:
        'var(--site-frame-top) var(--site-frame-right) var(--site-frame-bottom) var(--site-frame-left)',
    }}
  >
    <div className={pageStyles.root}>
      <header className={headerStyles.header} data-fixture-header>
        <span className={headerStyles.navigation} data-fixture-nav-item>
          NAV ITEM
        </span>
      </header>
      <section
        style={{ height: 96, flexShrink: 0 }}
        data-fixture-previous
        data-cursor-popup="previous section"
      >
        Previous section
      </section>
      {await FooterBlock({ block, siteName: 'TMCS', locale })}
    </div>
    <CursorPopup />
  </div>,
)
