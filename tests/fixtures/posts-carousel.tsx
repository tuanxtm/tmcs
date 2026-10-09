import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

import { PostsCarousel } from '@/app/(frontend)/_components/posts/posts-carousel'
import { BootReveal } from '@/app/(frontend)/_components/providers/boot-reveal'
import type { PostCardView } from '@/app/(frontend)/_lib/types'

function rasterPngUrl(color: string, width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable in the browser fixture')
  context.fillStyle = color
  context.fillRect(0, 0, width, height)
  return canvas.toDataURL('image/png')
}

const portraitImage = {
  id: 1,
  url: rasterPngUrl('#6464c8', 600, 900),
  alt: 'Portrait',
  width: 600,
  height: 900,
  dominantColor: null,
}
const squareImage = {
  id: 2,
  url: rasterPngUrl('#64c864', 700, 700),
  alt: 'Square',
  width: 700,
  height: 700,
  dominantColor: null,
}
const landscapeImage = {
  id: 3,
  url: rasterPngUrl('#c86464', 1200, 600),
  alt: 'Landscape',
  width: 1200,
  height: 600,
  dominantColor: null,
}

const basePosts: PostCardView[] = [
  {
    id: 1,
    slug: 'portrait',
    title: 'Portrait Post',
    href: '/posts/portrait',
    publishedAt: '2026-01-02T00:00:00.000Z',
    image: portraitImage,
  },
  {
    id: 2,
    slug: 'square',
    title: 'Square Post',
    href: '/posts/square',
    publishedAt: '2026-01-03T00:00:00.000Z',
    image: squareImage,
  },
  {
    id: 3,
    slug: 'landscape',
    title: 'Landscape Post',
    href: '/posts/landscape',
    publishedAt: '2026-01-04T00:00:00.000Z',
    image: landscapeImage,
  },
  {
    id: 4,
    slug: 'no-image',
    title: 'No image post',
    href: null,
    publishedAt: '2026-01-05T00:00:00.000Z',
    image: null,
  },
  {
    id: 5,
    slug: 'duplicate-src',
    title: 'Duplicate src post',
    href: '/posts/duplicate',
    publishedAt: '2026-01-06T00:00:00.000Z',
    image: { ...portraitImage, id: 99 },
  },
  {
    id: 6,
    slug: 'long',
    title: 'A very long post title that should not break the layout even on mobile devices',
    href: '/posts/long',
    publishedAt: '2026-01-07T00:00:00.000Z',
    image: landscapeImage,
  },
  {
    id: 7,
    slug: 'no-link',
    title: 'No link post',
    href: null,
    publishedAt: '2026-01-08T00:00:00.000Z',
    image: squareImage,
  },
]

function buildDocs(caseId: 'mixed' | 'empty' | 'missing' | 'broken'): PostCardView[] {
  if (caseId === 'empty') return []
  if (caseId === 'missing') {
    // All posts have null image; the adapter falls back to the neutral raster.
    return basePosts.map((post) => ({ ...post, image: null }))
  }
  if (caseId === 'broken') {
    // Replace image URLs with URLs that 404. Carousel still mounts and the
    // link remains usable.
    return basePosts.map((post, i) => ({
      ...post,
      image: post.image ? { ...post.image, url: `http://broken.invalid/${i}.png` } : null,
    }))
  }
  return basePosts
}

function MarkBootReady({ children }: { children: React.ReactNode }) {
  const { actions } = BootReveal.use()
  useEffect(() => actions.finish(), [actions])
  return children
}

function getCaseFromUrl(): 'mixed' | 'empty' | 'missing' | 'broken' {
  const params = new URLSearchParams(window.location.search)
  const value = params.get('case')
  if (value === 'empty' || value === 'missing' || value === 'broken') return value
  return 'mixed'
}

const docs = buildDocs(getCaseFromUrl())

const root = createRoot(document.getElementById('fixture')!)
root.render(
  <ReactLenis root options={{ autoRaf: true, syncTouch: false, respectReducedMotion: false }}>
    <BootReveal.Provider>
      <MarkBootReady>
        <main className="fixture-page" data-case={getCaseFromUrl()}>
          <section
            id="fixture-posts"
            data-feed-type="posts"
            data-cursor-popup="view details"
            className="canvas-section"
          >
            <div className="canvas-frame">
              <h2 id="fixture-posts-heading" className="canvas-heading">
                Posts
              </h2>
              <PostsCarousel docs={docs} locale="en" />
            </div>
          </section>
        </main>
      </MarkBootReady>
    </BootReveal.Provider>
  </ReactLenis>,
)
