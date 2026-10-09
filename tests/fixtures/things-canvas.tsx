import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import LenisProvider from 'lenis/react'

import { ThingsCanvas } from '@/app/(frontend)/_components/things/things-canvas'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import styles from '@/app/(frontend)/_components/canvas/canvas.module.css'

/** Browser fixture for Things canvas movement and drawer interactions. */
type DrawerCase = 'default' | 'links' | 'long-copy' | 'empty-copy' | 'broken-image'

type FixtureOptions = {
  count?: number
  /** Edge scrolling runs through Lenis when true, native scroll otherwise. */
  lenis?: boolean
  reducedMotion?: boolean
  locale?: LocaleCode
  drawerCase?: DrawerCase
  /** Force a specific link count on the first thing. */
  linkCount?: number
}

const TRANSPARENT_PNG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWpnaHQ9IjYwIiBmaWxsPSIjZjBmIiBmaWx0ZXI9InVybCgjYikiLz48L3N2Zz4='

const OPAQUE_PNG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIzYjlmMSIvPjwvc3ZnPg=='

// Deterministic SVG image with declared width/height matching its content.
function deterministicPng(width: number, height: number, fill: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${fill}"/></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const LONG_TITLES = [
  'Distributed edge runtime with per-region failover and blue-green releases',
  'Workshop control panel',
  'Realtime',
  'Custom CNC fixture plate for the laser cutter',
  'A',
  'Ink-and-paper notebook tooling',
]

const LONG_DESCRIPTION = `Line one of a long description.\nLine two with more words so the content half scrolls past the heading on mobile.\nLine three keeps going to make sure the inner column never pushes the frame split out of place.`

const PLATFORM_LINKS = [
  { label: 'Amazon', url: 'https://www.amazon.example/dp/B0FIXTURE' },
  { label: 'Shopee', url: 'https://shopee.example/product/123' },
  { label: 'AliExpress', url: 'https://www.aliexpress.example/item/456.html' },
]

const ERROR_IMAGE = '/broken-fixture-image.png'

function makeThing(
  index: number,
  options: FixtureOptions,
): ThingCardView & { detailImage: unknown } {
  const id = index + 1
  // Mixed ratios, missing images, transparent images, and long titles.
  const missing = index % 7 === 3
  const transparent = index % 3 === 1
  const ratio = index % 4
  const width = ratio === 0 ? 800 : ratio === 1 ? 400 : ratio === 2 ? 1200 : 600
  const height = ratio === 0 ? 400 : ratio === 1 ? 900 : ratio === 2 ? 500 : 600

  const isFirst = index === 0
  const caseName = isFirst ? (options.drawerCase ?? 'default') : 'default'

  let name = LONG_TITLES[index % LONG_TITLES.length]
  let description: string | null = 'Useful tools for the workshop.'
  let links: ThingCardView['links'] = []
  let primaryUrl: string | null = index === 2 ? null : `/buy/fixture-thing-${id}`
  let primaryImage = missing
    ? null
    : {
        id,
        url: transparent ? TRANSPARENT_PNG : OPAQUE_PNG,
        alt: `Fixture thing ${id}`,
        width,
        height,
        dominantColor: null,
      }

  switch (caseName) {
    case 'links': {
      const count = options.linkCount ?? 3
      links = PLATFORM_LINKS.slice(0, count)
      if (count === 1) links = [{ label: 'Amazon', url: 'https://www.amazon.example/dp/B0FIXTURE' }]
      if (count === 4)
        links = [...PLATFORM_LINKS, { label: 'Etsy', url: 'https://www.etsy.example/listing/789' }]
      break
    }
    case 'long-copy':
      name =
        'Distributed edge runtime with per-region failover and blue-green releases plus a long descriptive suffix'
      description = LONG_DESCRIPTION
      links = PLATFORM_LINKS
      primaryImage = {
        id,
        url: deterministicPng(800, 1200, '#3b5bdb'),
        alt: `Fixture thing ${id}`,
        width: 800,
        height: 1200,
        dominantColor: null,
      }
      break
    case 'empty-copy':
      description = null
      break
    case 'broken-image':
      links = PLATFORM_LINKS
      primaryImage = {
        id,
        url: ERROR_IMAGE,
        alt: `Broken fixture thing ${id}`,
        width: 800,
        height: 600,
        dominantColor: null,
      }
      primaryUrl = '/buy/fixture-thing-1'
      break
  }

  if (isFirst && options.linkCount === 4 && links.length === 3) {
    links = [...links, { label: 'Etsy', url: 'https://www.etsy.example/listing/789' }]
  }

  return {
    id,
    slug: `fixture-thing-${id}`,
    name,
    description,
    links,
    primaryUrl,
    detailImage: {
      id: 100 + id,
      url: '/secondary-never-render.png',
      alt: 'Secondary',
      width: 800,
      height: 400,
      dominantColor: null,
    },
    publishedAt: '2026-01-01T00:00:00.000Z',
    primaryImage,
  }
}

function makeThings(count: number, options: FixtureOptions): ThingCardView[] {
  return Array.from({ length: count }, (_, index) => makeThing(index, options))
}

const host = document.getElementById('fixture')!
const root = createRoot(host)

declare global {
  interface Window {
    renderThingsFixture: (options?: FixtureOptions) => void
  }
}

window.renderThingsFixture = (options = {}) => {
  const count = options.count ?? 25
  const things = makeThings(count, options)
  const locale = options.locale ?? 'en'

  const section = (
    <section id="fixture-things" aria-labelledby="fixture-things-heading">
      <div className={styles.frame}>
        <h2 id="fixture-things-heading" className={styles.heading}>
          things
        </h2>
        <ThingsCanvas
          things={things}
          locale={locale}
          description="Drag any thing to rearrange the workshop wall."
          cursorPopupItem="view details"
          onMovementChange={(moving) => {
            document.documentElement.dataset.thingMoving = String(moving)
          }}
        />
      </div>
    </section>
  )

  flushSync(() => {
    if (options.lenis === false) {
      root.render(section)
      return
    }
    root.render(
      <LenisProvider root options={{ autoRaf: true, syncTouch: false }}>
        {section}
      </LenisProvider>,
    )
  })

  if (options.reducedMotion !== undefined) {
    document.documentElement.dataset.fixtureReducedMotion = String(options.reducedMotion)
  }
}

window.renderThingsFixture()
