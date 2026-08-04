import { cn } from '@/lib/utils'

type FeedGridProps = React.ComponentProps<'div'>

/** Feed tile grid with sketch outer edges + full-height column rules. */
export function FeedGrid({ children, className, ...props }: FeedGridProps) {
  return (
    <div className={cn('feed-grid dash-t dash-b', className)} {...props}>
      <div className="feed-grid-rules" aria-hidden="true">
        <span className="feed-grid-rule" />
        <span className="feed-grid-rule" />
        <span className="feed-grid-rule" />
      </div>
      {children}
    </div>
  )
}
