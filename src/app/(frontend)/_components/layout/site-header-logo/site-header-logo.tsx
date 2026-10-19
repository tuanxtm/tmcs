'use client'
import styles from './site-header-logo.module.css'

type SiteHeaderLogoProps = {
  siteName: string
}
export function SiteHeaderLogo({ siteName }: SiteHeaderLogoProps) {
  return (
    <div role="img" className={styles.root} aria-label={siteName}>
      <div className={styles.bars}>
        {[0, 1, 2].map((slot) => (
          <span key={slot} aria-hidden="true" className={styles.bar}>
            <span className={styles.fill} />
          </span>
        ))}
      </div>
    </div>
  )
}
