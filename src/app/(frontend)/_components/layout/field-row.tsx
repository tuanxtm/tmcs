import { cn } from '@/lib/utils'

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
    <div className={cn('flex flex-col', className)}>
      {label ? (
        <p className="text-primary/90 font-mono text-[0.625rem] tracking-tight uppercase md:text-xs">
          {label}
        </p>
      ) : null}
      <div className="text-foreground text-base lowercase">{children}</div>
    </div>
  )
}
