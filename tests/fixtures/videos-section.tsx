import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

import { VideosSection } from '@/app/(frontend)/_components/videos/videos-section'
import { BootReveal } from '@/app/(frontend)/_components/providers/boot-reveal'
import type { VideoCardView } from '@/app/(frontend)/_lib/types'

const image = {
  id: 1,
  url: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
  alt: 'Fixture video thumbnail',
  width: 640,
  height: 360,
  dominantColor: null,
}

const docs: VideoCardView[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  slug: `fixture-video-${index + 1}`,
  title: index === 0 ? 'Preserved Title Case' : `Fixture Video ${index + 1}`,
  provider: 'youtube',
  sourceUrl: `https://www.youtube.com/watch?v=fixture${index + 1}`,
  youtubeId: `fixture${index + 1}`,
  publishedAt: '2026-01-01T00:00:00.000Z',
  image,
}))

function MarkBootReady({ children }: { children: React.ReactNode }) {
  const { actions } = BootReveal.use()
  useEffect(() => actions.finish(), [actions])
  return children
}

const root = createRoot(document.getElementById('fixture')!)
root.render(
  <ReactLenis root options={{ autoRaf: true, syncTouch: false, respectReducedMotion: false }}>
    <BootReveal.Provider>
      <MarkBootReady>
        <main className="fixture-page">
          <VideosSection
            sectionId="fixture-videos"
            headingId="fixture-videos-heading"
            heading="Recent videos"
            description="Fixture description"
            docs={docs}
            locale="en"
          />
        </main>
      </MarkBootReady>
    </BootReveal.Provider>
  </ReactLenis>,
)
