import styles from './site-frame.module.css'
export function SiteFrame() {
  return <div aria-hidden="true" className={styles.root} data-site-frame />
}
