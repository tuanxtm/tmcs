import { Background } from '@/app/(frontend)/_components/layout/background'
import { BootSplash } from '@/app/(frontend)/_components/layout/boot-splash'
import { CursorPopup } from '@/app/(frontend)/_components/layout/cursor-popup'
import { SiteHeader } from '@/app/(frontend)/_components/layout/site-header'
import {
  BootRevealContent,
} from '@/app/(frontend)/_components/providers/boot-reveal'
import { LocaleProvider } from '@/app/(frontend)/_components/providers/locale'
import { readActiveLocale } from '@/app/(frontend)/_lib/locale-server'
import { getSiteShell } from '@/app/(frontend)/_lib/cms'

/**
 * Body-side chrome that depends on the request-time locale.
 *
 * Wraps all children in `<LocaleProvider>` so client components throughout the
 * tree can read the locale via `useLocale()` (currently used implicitly by
 * components that already accept `locale` as a prop, but the provider is here
 * so future client components do not have to thread locale through props).
 *
 * Reading `headers()` and `getSiteShell(locale)` here (rather than in the
 * layout) keeps the static shell cache-friendly. The parent layout must wrap
 * this component in `<Suspense>` so the shell ships immediately and these
 * dynamic regions stream in.
 *
 * NB: This component assumes the parent has already wrapped it in
 * `MotionProvider > LenisProvider > BootRevealProvider`. `BootSplash` and
 * `BootRevealContent` both consume `BootRevealContext`.
 */
export async function LocaleAwareShell({ children }: { children: React.ReactNode }) {
  const locale = await readActiveLocale()
  const shell = await getSiteShell(locale)

  return (
    <LocaleProvider locale={locale}>
      <Background />
      <BootSplash locale={locale} />
      <BootRevealContent className="page-frame">
        <div className="my-auto flex min-h-dvh w-full flex-col justify-center py-4 md:py-8 lg:py-20">
          <SiteHeader
            siteName={shell.siteName}
            locale={locale}
            navigation={shell.navigation}
          />
          <main id="main-content" className="h-auto min-h-0">
            {children}
          </main>
        </div>
      </BootRevealContent>
      <CursorPopup />
    </LocaleProvider>
  )
}