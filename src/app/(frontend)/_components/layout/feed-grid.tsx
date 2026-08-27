import { cn } from '@/lib/utils'

type FeedGridProps = React.ComponentProps<'div'>

export function FeedGrid({ children, className, ...props }: FeedGridProps) {
  return (
    <div
      data-grid="feed"
      className={cn(
        'relative grid w-full items-start gap-x-1 gap-y-4 md:gap-y-8 lg:gap-x-2',
        'pl-2 md:pl-3 lg:pl-4',
        'py-2 md:py-3 lg:py-4',
        'bg-background grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
