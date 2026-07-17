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
      className={`flex items-center justify-center bg-muted/40 ${className || ''}`}
      aria-hidden="true"
    >
      <span className="page-label">01 / Hero</span>
    </div>
  )
}

export function Hero({ hero }: HeroProps) {
  const reduceMotion = useReducedMotion()

  return (
    <section className="relative dash-b" aria-labelledby="hero-heading">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Square image panel */}
        <div className="aspect-square p-2">
          <div className="relative h-full w-full overflow-hidden">
            {hero.image ? (
              <div className="group relative h-full w-full">
                <CmsImage
                  media={hero.image}
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="h-full w-full"
                  imgClassName="object-contain transition-transform duration-500 group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
                />
              </div>
            ) : (
              <HeroPlaceholder className="h-full w-full" />
            )}
          </div>
        </div>

        {/* Square text panel */}
        <motion.div
          className="relative flex aspect-square flex-col justify-center p-2"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <p className="page-label">01 / Intro</p>
          <h1 id="hero-heading" className="display-title mt-4 max-w-xl">
            {hero.heading}
          </h1>
          {hero.subheading ? (
            <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/90 lg:text-lg lg:text-muted-foreground">
              {hero.subheading}
            </p>
          ) : null}
          {hero.profileSummary ? (
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {hero.profileSummary}
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}
