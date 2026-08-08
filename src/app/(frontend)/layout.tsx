import { Fanwood_Text, Geist, Geist_Mono } from 'next/font/google'
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

const geistSans = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const fanwoodText = Fanwood_Text({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-fanwood',
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
      className={`${geistSans.variable} ${geistMono.variable} ${fanwoodText.variable}`}
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
