import { cn } from '@/lib/utils'
import styles from './field-row.module.css'
/**
 * Labeled row used inside the home Hero and the detail page sections.
 *
 * Renders a small uppercase mono label above a lowercase value slot. Used to
 * present structured metadata (title, tagline, bio, links, author, dates)
 * inside the chrome shared between the home page and detail pages so the two
 * sections stay visually in lockstep.
 */
export type FieldRowProps = {
  label: string | null
  className?: string
  children: React.ReactNode
}
export function FieldRow({ label, className, children }: FieldRowProps) {
  return (
    <div className={cn(styles.root, className)}>
      {label ? <p className={styles.label}>{label}</p> : null}
      <div className={styles.value}>{children}</div>
    </div>
  )
}
