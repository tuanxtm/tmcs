import { cn } from '@/lib/utils'

type ThingsGridProps = React.ComponentProps<'div'>

export function ThingsGrid({ children, className, ...props }: ThingsGridProps) {
  return (
    <div
      data-grid="things"
      className={cn(
        'relative grid w-full items-stretch gap-x-1 gap-y-1 lg:gap-x-2 lg:gap-y-2',
        'bg-background',
        'grid-cols-2 lg:grid-cols-3',
        'pl-2 md:pl-3 lg:pl-4',
        'py-2 md:py-3 lg:py-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
