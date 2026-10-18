import { SiteFrame } from '@/app/(frontend)/_components/layout/site-frame'
import { BackToTop } from '@/app/(frontend)/_components/layout/back-to-top'
import { BootSplash } from '@/app/(frontend)/_components/layout/boot-splash'
import { CursorPopup } from '@/app/(frontend)/_components/layout/cursor-popup'
import {
  BootRevealChrome,
  BootRevealContent,
} from '@/app/(frontend)/_components/providers/boot-reveal'
import { LocaleProvider } from '@/app/(frontend)/_components/providers/locale'
import { readActiveLocale } from '@/app/(frontend)/_lib/locale-server'
import styles from './locale-aware-shell.module.css'
export async function LocaleAwareShell({ children }: { children: React.ReactNode }) {
  const locale = await readActiveLocale()
  return (
    <LocaleProvider locale={locale}>
      <BootSplash locale={locale} />
      <BootRevealChrome>
        <SiteFrame />
      </BootRevealChrome>
      <BootRevealContent>
        <div className={styles.shell}>
          <main id="main-content" className={styles.content}>
            {children}
          </main>
        </div>
      </BootRevealContent>
      <CursorPopup />
      <BackToTop />
    </LocaleProvider>
  )
}
