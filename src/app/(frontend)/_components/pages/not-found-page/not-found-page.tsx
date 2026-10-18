import Link from 'next/link'
import type { LocaleCode } from '@/lib/locales'
import { homeHref } from '@/app/(frontend)/_lib/locale'
import styles from './not-found-page.module.css'
export function NotFoundPage({ locale }: { locale: LocaleCode }) {
  const heading =
    locale === 'vi' ? '404. trang này không tồn tại.' : "404. this page doesn't exist."
  const description =
    locale === 'vi'
      ? 'bạn có biết thứ gì khác tồn tại không ?\nnhững ý tưởng tuyệt vời,\nnhững dự án lớn,\nnhững thứ mà bạn luôn muốn làm,\nvề trang chủ nhé,\nmong rằng bạn sẽ tìm thấy thứ bạn cần tìm.'
      : "but you know what does ?\nthat brilliant idea floating in your mind,\nthe next big project in your head,\nthe thing you've always wanted to build,\nlet's go back,\nand find what you're looking for."
  const backLabel = locale === 'vi' ? 'Trở về trang chủ' : 'Go back home'
  return (
    <section
      id="not-found"
      className={styles.root}
      aria-labelledby="not-found-heading"
      data-cursor-popup={'not-found'}
    >
      <Link href={homeHref(locale)} className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.scroller}>
            <div className={styles.copy}>
              <h1 id="not-found-heading" className={styles.heading}>
                <span className={styles.code}>404.</span>
                {heading.slice(4)}
              </h1>
              <p className={styles.description}>{description}</p>
              <div data-cursor-popup={''} className={styles.action}>
                <span className={styles.actionPrefix}>{'>'}</span>
                <span className={styles.actionLabel}>{backLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.decoration}>
          <div className={styles.decorationFrame} aria-hidden="true">
            <span className={styles.digits}>
              <span className={styles.digit}>4</span>
              <span className={styles.digit}>0</span>
              <span className={styles.digit}>4</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
