import { cn } from '@/lib/utils'

type FeedGridProps = React.ComponentProps<'div'>

/** Feed tile grid. */
export function FeedGrid({ children, className, ...props }: FeedGridProps) {
  return (
    <div
      data-grid="feed"
      className={cn(
        'relative grid w-full items-start gap-x-1 gap-y-4 pb-4 md:gap-y-8 lg:gap-x-2',
        'pl-2 md:pl-3 lg:pl-4',
        'pt-2 md:pt-3 lg:pt-4',
        'bg-background grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
