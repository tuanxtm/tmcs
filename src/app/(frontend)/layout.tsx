import { Geist, Geist_Mono } from 'next/font/google'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

import { getSiteShell } from '@/app/(frontend)/_lib/cms'
import { parseLocale, SITE_LOCALE_HEADER } from '@/app/(frontend)/_lib/locale'
import { SiteFooter } from '@/app/(frontend)/_components/layout/site-footer'
import { SiteHeader } from '@/app/(frontend)/_components/layout/site-header'
import { MotionProvider } from '@/app/(frontend)/_components/providers/motion-provider'

import './styles.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
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
  const shell = await getSiteShell(locale)

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-background text-foreground">
        <MotionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <SiteHeader locale={locale} siteName={shell.siteName} navigation={shell.navigation} />
          <main id="main-content">{children}</main>
          <SiteFooter shell={shell} />
        </MotionProvider>
      </body>
    </html>
  )
}
