import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import LenisProvider from 'lenis/react'

import { ThingsCanvas } from '@/app/(frontend)/_components/things/things-canvas'
import type { FeedDecorationView, ThingCardView } from '@/app/(frontend)/_lib/types'
import styles from '@/app/(frontend)/_components/canvas/canvas.module.css'

/** Browser fixture for Things canvas movement and drawer interactions. */
type FixtureOptions = {
  count?: number
  /** Edge scrolling runs through Lenis when true, native scroll otherwise. */
  lenis?: boolean
  reducedMotion?: boolean
  decorations?: boolean
}

const TRANSPARENT_PNG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmIiBmaWx0ZXI9InVybCgjYikiLz48L3N2Zz4='
const OPAQUE_PNG =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzIzYjlmMSIvPjwvc3ZnPg=='

const LONG_TITLES = [
  'Distributed edge runtime with per-region failover and blue-green releases',
  'Workshop control panel',
  'Realtime',
  'Custom CNC fixture plate for the laser cutter',
  'A',
  'Ink-and-paper notebook tooling',
]

function makeThing(index: number): ThingCardView & { detailImage: unknown } {
  const id = index + 1
  // Mixed ratios, missing images, transparent images, and long titles.
  const missing = index % 7 === 3
  const transparent = index % 3 === 1
  const ratio = index % 4
  const width = ratio === 0 ? 800 : ratio === 1 ? 400 : ratio === 2 ? 1200 : 600
  const height = ratio === 0 ? 400 : ratio === 1 ? 900 : ratio === 2 ? 500 : 600

  return {
    id,
    slug: `fixture-thing-${id}`,
    name: LONG_TITLES[index % LONG_TITLES.length],
    description: 'Useful tools for the workshop.',
    links: [],
    primaryUrl: index === 2 ? null : `/buy/fixture-thing-${id}`,
    detailImage: {
      id: 100 + id,
      url: '/secondary-never-render.png',
      alt: 'Secondary',
      width: 800,
      height: 400,
      dominantColor: null,
    },
    publishedAt: '2026-01-01T00:00:00.000Z',
    primaryImage: missing
      ? null
      : {
          id,
          url: transparent ? TRANSPARENT_PNG : OPAQUE_PNG,
          alt: `Fixture thing ${id}`,
          width,
          height,
          dominantColor: null,
        },
  }
}

function makeThings(count: number): ThingCardView[] {
  return Array.from({ length: count }, (_, index) => makeThing(index))
}

const DECORATIONS: FeedDecorationView[] = [
  { id: 1, packId: 1, imageUrl: TRANSPARENT_PNG, allowedShapes: [], weight: 1 },
  { id: 2, packId: 1, imageUrl: OPAQUE_PNG, allowedShapes: [], weight: 1 },
]

const host = document.getElementById('fixture')!
const root = createRoot(host)

declare global {
  interface Window {
    renderThingsFixture: (options?: FixtureOptions) => void
  }
}

window.renderThingsFixture = (options = {}) => {
  const count = options.count ?? 25
  const things = makeThings(count)
  const decorations = options.decorations === false ? undefined : DECORATIONS

  const section = (
    <section id="fixture-things" aria-labelledby="fixture-things-heading">
      <div className={styles.frame}>
        <h2 id="fixture-things-heading" className={styles.heading}>
          things
        </h2>
        <ThingsCanvas
          things={things}
          locale="en"
          description="Drag any thing to rearrange the workshop wall."
          cursorPopupItem="view details"
          decorations={decorations}
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
