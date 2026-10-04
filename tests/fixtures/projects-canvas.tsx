import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import LenisProvider from 'lenis/react'

import { ProjectsCanvas } from '@/app/(frontend)/_components/projects/projects-canvas'
import type { FeedDecorationView, ProjectCardView } from '@/app/(frontend)/_lib/types'
import styles from '@/app/(frontend)/_components/projects/projects.module.css'

/**
 * Canvas-focused browser fixture. It renders ProjectsCanvas directly instead of
 * ProjectsSection so the Payload-backed pagination action never enters the
 * browser bundle. Pagination state is covered by the mocked component tests.
 */
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

function makeProject(index: number): ProjectCardView {
  const id = index + 1
  // Mixed ratios, missing images, transparent images, and long titles.
  const missing = index % 7 === 3
  const transparent = index % 3 === 1
  const ratio = index % 4
  const width = ratio === 0 ? 800 : ratio === 1 ? 400 : ratio === 2 ? 1200 : 600
  const height = ratio === 0 ? 400 : ratio === 1 ? 900 : ratio === 2 ? 500 : 600

  return {
    id,
    slug: `fixture-project-${id}`,
    title: LONG_TITLES[index % LONG_TITLES.length],
    href: `/projects/fixture-project-${id}`,
    publishedAt: '2026-01-01T00:00:00.000Z',
    image: missing
      ? null
      : {
          id,
          url: transparent ? TRANSPARENT_PNG : OPAQUE_PNG,
          alt: `Fixture project ${id}`,
          width,
          height,
          dominantColor: null,
        },
  }
}

function makeProjects(count: number): ProjectCardView[] {
  return Array.from({ length: count }, (_, index) => makeProject(index))
}

const DECORATIONS: FeedDecorationView[] = [
  { id: 1, packId: 1, imageUrl: TRANSPARENT_PNG, allowedShapes: [], weight: 1 },
  { id: 2, packId: 1, imageUrl: OPAQUE_PNG, allowedShapes: [], weight: 1 },
]

const host = document.getElementById('fixture')!
const root = createRoot(host)

declare global {
  interface Window {
    renderProjectsFixture: (options?: FixtureOptions) => void
  }
}

window.renderProjectsFixture = (options = {}) => {
  const count = options.count ?? 25
  const projects = makeProjects(count)
  const decorations = options.decorations === false ? undefined : DECORATIONS

  const section = (
    <section id="fixture-projects" aria-labelledby="fixture-projects-heading">
      <div className={styles.frame}>
        <h2 id="fixture-projects-heading" className={styles.heading}>
          projects
        </h2>
        <ProjectsCanvas
          projects={projects}
          description="Drag any project to rearrange the workshop wall."
          cursorPopupItem="view details"
          decorations={decorations}
          onMovementChange={(moving) => {
            document.documentElement.dataset.projectMoving = String(moving)
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

window.renderProjectsFixture()
