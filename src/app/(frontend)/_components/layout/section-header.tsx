import { cn } from '@/lib/utils'
import { Barcode } from '@/components/ui/barcode'

type SectionHeaderProps = {
  id: string
  heading: string
  description?: string | null
  className?: string
}

export function SectionHeader({ id, heading, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('bg-background', className)}>
      <div
        className={cn(
          'h-(--header-height) bg-transparent',
          'ml-2 grid items-center md:ml-3 lg:ml-4',
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          'gap-x-1 lg:gap-x-2',
          'dash-line-b [--dash-gap:2px] [--dash-length:3px] [--dash-width:1px]',
        )}
        data-stuck="false"
      >
        <h2
          id={id}
          className={cn(
            'text-foreground text-sm leading-none font-medium tracking-tight lowercase md:text-base lg:text-lg',
            'col-span-1',
            className,
          )}
        >
          {heading}
        </h2>
        <div className="h-[1em] w-full md:col-start-3 md:col-end-4 lg:col-start-4 lg:col-end-5">
          <Barcode
            value={'latest ' + heading}
            lineColor="var(--primary)"
            quietZoneModules={0}
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  )
}
