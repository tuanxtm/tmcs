import { Fanwood_Text, Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { parseLocale, SITE_LOCALE_HEADER } from '@/app/(frontend)/_lib/locale'
import { Background } from '@/app/(frontend)/_components/layout/background'
import { BootSplash } from '@/app/(frontend)/_components/layout/boot-splash'
import { CursorPopup } from '@/app/(frontend)/_components/layout/cursor-popup'
import {
  BootRevealContent,
  BootRevealProvider,
} from '@/app/(frontend)/_components/providers/boot-reveal'
import { LenisProvider } from '@/app/(frontend)/_components/providers/lenis-provider'
import { MotionProvider } from '@/app/(frontend)/_components/providers/motion-provider'

import './styles.css'

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
  const headerList = await headers()
  const locale = parseLocale(headerList.get(SITE_LOCALE_HEADER))
  const shell = await getSiteShell(locale)

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers()
  const locale = parseLocale(headerList.get(SITE_LOCALE_HEADER))

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${fanwoodText.variable} ${departureMono.variable}`}
    >
      <body className="relative min-h-dvh text-foreground">
        <MotionProvider>
          <LenisProvider>
            <BootRevealProvider>
              <Background />
              <BootSplash locale={locale} />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
              >
                Skip to content
              </a>
              <BootRevealContent className="page-frame">
                <main id="main-content">{children}</main>
              </BootRevealContent>
              <CursorPopup />
            </BootRevealProvider>
          </LenisProvider>
        </MotionProvider>
      </body>
    </html>
  )
}
