'use client'

import { motion, useReducedMotion } from 'motion/react'

import type { HeroView } from '@/app/(frontend)/_lib/types'
import { CmsImage } from '@/app/(frontend)/_components/media/cms-image'

type HeroProps = {
  hero: HeroView
}

function HeroPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center border border-dashed border-[color:var(--border-dashed)] bg-muted/40 ${className || ''}`}
      aria-hidden="true"
    >
      <span className="page-label">01 / Hero</span>
    </div>
  )
}

export function Hero({ hero }: HeroProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative border-b border-border" aria-labelledby="hero-heading">
      <div className="page-frame">
        <div className="relative overflow-hidden lg:grid lg:min-h-[min(78vh,44rem)] lg:grid-cols-12">
          {/* Image: background on mobile, left column on desktop */}
          <div className="absolute inset-0 lg:relative lg:col-span-6 lg:border-r lg:border-border lg:py-10 lg:pr-8">
            <div className="h-full min-h-[70dvh] lg:min-h-0 lg:aspect-[4/5] lg:overflow-hidden lg:border lg:border-border">
              {hero.image ? (
                <div className="group relative h-full w-full">
                  <CmsImage
                    media={hero.image}
                    fill
                    priority
                    sizes="(min-width: 1024px) 36vw, 100vw"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-500 group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                  />
                </div>
              ) : (
                <HeroPlaceholder className="h-full w-full" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/35 lg:hidden" />
            </div>
          </div>

          {/* Text */}
          <motion.div
            className="relative z-10 flex min-h-[70dvh] flex-col justify-end px-1 pb-10 pt-[max(5rem,env(safe-area-inset-top))] lg:col-span-6 lg:min-h-0 lg:justify-center lg:py-12 lg:pl-8 lg:pt-12"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p className="page-label">01 / Intro</p>
            <h1 id="hero-heading" className="display-title mt-4 max-w-xl lg:mt-5">
              {hero.heading}
            </h1>
            {hero.subheading ? (
              <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/90 lg:mt-6 lg:text-lg lg:text-muted-foreground">
                {hero.subheading}
              </p>
            ) : null}
            {hero.profileSummary ? (
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground lg:mt-4">
                {hero.profileSummary}
              </p>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
