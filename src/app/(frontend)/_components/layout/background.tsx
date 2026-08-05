'use client'

import dynamic from 'next/dynamic'

import { BootReveal, useBootReveal } from '@/app/(frontend)/_components/providers/boot-reveal'

const ColorBends = dynamic(() => import('@/components/ui/color-bends'), {
  ssr: false,
})

function BackgroundEffect() {
  const {
    state: { phase },
  } = useBootReveal()
  // Defer the Three.js chunk until the splash handoff reaches the background beat.
  const loadWebGL = phase === 'background' || phase === 'ready'

  return (
    <BootReveal.Effect>
      {loadWebGL ? (
        <ColorBends
          colors={['#8BA876', '#5A7D4A', '#C5D4A8']}
          bandWidth={4}
          rotation={180}
          speed={0.03}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={0.1}
          noise={0.12}
          parallax={0.25}
          iterations={1}
          intensity={2}
          fontSize={12}
          timeOffset={64}
          gridOpacity={0.2}
          transparent
          autoRotate={0}
        />
      ) : null}
    </BootReveal.Effect>
  )
}

export function Background() {
  // Full-width page frame: rails sit on the page gutters.
  const railInset = 'var(--page-gutter)'

  return (
    <>
      {/* Solid plane always present so splash never reveals emptiness.
          ColorBends loads only after the splash content reveal. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-dvh w-full overflow-hidden bg-background"
      >
        <BackgroundEffect />
      </div>
      {/* Rails above header blur so L/R strokes aren't doubled or buried */}
      <BootReveal.Chrome>
        <div className="pointer-events-none fixed inset-0 z-[45]">
          <span
            className="dash-rail dash-rail-left absolute inset-y-0"
            style={{ left: railInset }}
          />
          <span
            className="dash-rail dash-rail-right absolute inset-y-0"
            style={{ right: railInset }}
          />
        </div>
      </BootReveal.Chrome>
    </>
  )
}
