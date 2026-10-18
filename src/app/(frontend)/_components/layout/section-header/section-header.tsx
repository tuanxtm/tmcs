import { cn } from '@/lib/utils'
import styles from './section-header.module.css'
type SectionHeaderProps = {
  id: string
  heading: string
  className?: string
}
export function SectionHeader({ id, heading, className }: SectionHeaderProps) {
  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.layout} data-stuck="false">
        <div className={styles.decoration}>{heading}</div>
        <h2 id={id} className={cn(styles.heading, className)}>
          {heading}
        </h2>
      </div>
    </div>
  )
}
