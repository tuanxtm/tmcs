import { cn } from '@/lib/utils'
import styles from './feed-grid.module.css'
type FeedGridProps = React.ComponentProps<'div'>
export function FeedGrid({ children, className, ...props }: FeedGridProps) {
  return (
    <div data-grid="feed" className={cn(styles.root, className)} {...props}>
      {children}
    </div>
  )
}
