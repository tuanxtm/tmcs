'use client'
import Link from 'next/link'
import type { LocaleCode } from '@/lib/locales'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import styles from './error-page.module.css'
export function ErrorPage({ locale, reset }: { locale: LocaleCode; reset: () => void }) {
  const heading = locale === 'vi' ? '500. có lỗi xảy ra.' : '500. something went wrong.'
  const description =
    locale === 'vi'
      ? 'không thể tải trang này.\nvui lòng thử lại.'
      : 'the page could not be loaded.\nplease try again.'
  const retryLabel = locale === 'vi' ? 'Thử lại' : 'try again'
  const homeLabel = locale === 'vi' ? 'Trở về trang chủ' : 'back home'
  return (
    <section
      id="error"
      className={styles.root}
      aria-labelledby="error-heading"
      data-cursor-popup={'error'}
    >
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.scroller}>
            <div className={styles.copy}>
              <h1 id="error-heading" className={styles.heading}>
                <span className={styles.code}>500.</span>
                {heading.slice(4)}
              </h1>
              <p className={styles.description}>{description}</p>
              <div className={styles.actions}>
                <button type="button" onClick={reset} className={styles.action}>
                  <span className={styles.actionPrefix}>{'>'}</span>
                  <span className={styles.actionLabel}>{retryLabel}</span>
                </button>
                <Link href={homeHref(locale)} className={styles.action}>
                  <span className={styles.actionPrefix}>{'>'}</span>
                  <span className={styles.actionLabel}>{homeLabel}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.decoration}>
          <div className={styles.decorationFrame} aria-hidden="true">
            <span className={styles.digits}>
              <span className={styles.digit}>5</span>
              <span className={styles.digit}>0</span>
              <span className={styles.digit}>0</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
