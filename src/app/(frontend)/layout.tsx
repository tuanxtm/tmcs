import { Fanwood_Text, Inter } from 'next/font/google'
import localFont from 'next/font/local'
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { LocaleAwareShell } from '@/app/(frontend)/_components/layout/locale-aware-shell'
import { LocaleMeta } from '@/app/(frontend)/_components/layout/locale-meta'
import { LenisProvider } from '@/app/(frontend)/_components/providers/lenis-provider'
import { MotionProvider } from '@/app/(frontend)/_components/providers/motion-provider'
import {
  BootRevealProvider,
} from '@/app/(frontend)/_components/providers/boot-reveal'

import './styles.css'

// Cache Components requires `generateMetadata()` to be prerenderable when the
// rest of the route is. Reading `headers()` here would make every route fail
// `blocking-prerender-metadata-runtime`, so the layout-level metadata only
// depends on the EN shell (which is fully cached via `'use cache'`).
// The per-request locale is consumed by `LocaleMeta` (for `<html lang>`) and
// `LocaleAwareShell` (for the chrome), both wrapped in `<Suspense>` so the
// static shell ships without blocking on request-time data. Per-page
// `generateMetadata()` overrides these defaults with locale-aware OG/Twitter
// metadata of its own.

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const fanwoodText = Fanwood_Text({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-fanwood',
})

const departureMono = localFont({
  src: '../../assets/fonts/DepartureMono.woff2',
  variable: '--font-departure-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  // Read only the cached EN shell here. Reading `headers()` would block
  // prerender (`blocking-prerender-metadata-runtime`) on every route because
  // Cache Components requires `generateMetadata()` to be prerenderable when
  // the rest of the route is. The per-request locale is consumed by
  // `LocaleMeta` below for `<html lang>` and by each page's own
  // `generateMetadata()` for OG/Twitter/canonical data.
  const shell = await getSiteShell('en')

  return {
    title: {
      default: shell.seo.metaTitle || shell.siteName,
      template: `%s · ${shell.siteName}`,
    },
    description: shell.seo.metaDescription || shell.description || undefined,
    metadataBase: new URL(shell.siteUrl),
    robots: shell.robotsIndex
      ? undefined
      : {
          index: false,
          follow: false,
        },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Static shell: no `headers()` is read here, so Cache Components can prerender
  // this render tree. `<html lang>` defaults to `en`; the inline script in
  // `<LocaleMeta />` updates it to the request-time locale before paint.
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fanwoodText.variable} ${departureMono.variable}`}
    >
      <head>
        {/* Suspense fallback intentionally empty - if `headers()` blocks,
            the static shell still ships with the default lang and the script
            just never runs. */}
        <Suspense>
          <LocaleMeta />
        </Suspense>
      </head>
      <body className="text-foreground relative min-h-dvh">
        <MotionProvider>
          <LenisProvider>
            <BootRevealProvider>
              {/* Suspense fallback intentionally empty - the page is server-
                  rendered into the static shell regardless. The fallback only
                  matters if streaming is slow, in which case chrome streams in
                  once `headers()` resolves. */}
              <Suspense>
                <LocaleAwareShell>{children}</LocaleAwareShell>
              </Suspense>
            </BootRevealProvider>
          </LenisProvider>
        </MotionProvider>
      </body>
    </html>
  )
}