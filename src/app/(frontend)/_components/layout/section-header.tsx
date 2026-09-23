import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  id: string
  heading: string
  className?: string
}

export function SectionHeader({ id, heading, className }: SectionHeaderProps) {
  return (
    <div className={cn('bg-background', className)}>
      <div
        className={cn(
        'relative h-(--header-height) bg-transparent',
        'grid items-center',
          'grid-cols-1',
          'gap-x-1 lg:gap-x-2',
        )}
        data-stuck="false"
      >
        <div className="absolute items-start text-[10em] font-bold opacity-5">{heading}</div>
        <h2
          id={id}
          className={cn(
            'text-foreground text-sm leading-none font-medium tracking-tight lowercase md:text-base lg:text-lg',
            className,
          )}
        >
          {heading}
        </h2>
      </div>
    </div>
  )
}
