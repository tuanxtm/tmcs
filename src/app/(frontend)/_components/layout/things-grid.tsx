import { cn } from '@/lib/utils'

type ThingsGridProps = React.ComponentProps<'div'>

/** Things tile grid. */
export function ThingsGrid({ children, className, ...props }: ThingsGridProps) {
  return (
    <div
      data-grid="things"
      className={cn(
        'relative grid w-full grid-cols-2 items-stretch gap-x-0 gap-y-6 pb-6',
        'max-sm:gap-y-1 max-sm:pb-1',
        'lg:grid-cols-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
