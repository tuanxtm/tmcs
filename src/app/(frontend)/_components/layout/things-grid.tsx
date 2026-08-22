import { cn } from '@/lib/utils'

type ThingsGridProps = React.ComponentProps<'div'>

/** Things tile grid. */
export function ThingsGrid({ children, className, ...props }: ThingsGridProps) {
  return (
    <div
      data-grid="things"
      className={cn(
        'relative grid w-full items-stretch gap-x-0 gap-y-2 pb-6',
        'bg-background',
        'max-sm:gap-y-1 max-sm:pb-1',
        'grid-cols-2 lg:grid-cols-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
