import { Background } from '@/app/(frontend)/_components/layout/background'
import { BootSplash } from '@/app/(frontend)/_components/layout/boot-splash'
import { CursorPopup } from '@/app/(frontend)/_components/layout/cursor-popup'
import { BootRevealContent } from '@/app/(frontend)/_components/providers/boot-reveal'
import { LocaleProvider } from '@/app/(frontend)/_components/providers/locale'
import { readActiveLocale } from '@/app/(frontend)/_lib/locale-server'

export async function LocaleAwareShell({ children }: { children: React.ReactNode }) {
  const locale = await readActiveLocale()

  return (
    <LocaleProvider locale={locale}>
      <Background />
      <BootSplash locale={locale} />
      <BootRevealContent>
        <div className="my-auto flex min-h-dvh w-full flex-col justify-center">
          <main id="main-content" className="h-auto min-h-0">
            {children}
          </main>
        </div>
      </BootRevealContent>
      <CursorPopup />
    </LocaleProvider>
  )
}
