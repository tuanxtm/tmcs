import { cn } from '@/lib/utils'

// Inlined SVG paths from /public/logo.svg so `currentColor` resolves from the
// parent text color. The original SVG also embeds a base64 PNG inside <defs>,
// but it's positioned off-canvas and never renders; the 5 paths below are the
// only visible art.
type LogoProps = {
  size?: number
  className?: string
  'aria-label'?: string
}

export function Logo({ size = 20, className, 'aria-label': ariaLabel }: LogoProps) {
  const a11yProps = ariaLabel
    ? { role: 'img' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      {...a11yProps}
    >
      <path d="M235.602,16.002l-18.407,210.396l-26.3,0l18.407,-210.396l26.3,0Z" />
      <path d="M143.553,16.002l-18.407,210.396l-26.3,0l18.407,-210.396l26.3,0Z" />
      <path d="M129.843,171.512l79.459,-155.51l-4.802,54.886l-79.459,155.51l4.802,-54.886Z" />
      <path d="M37.9,171.512l79.459,-155.51l-4.802,54.886l-79.459,155.51l4.802,-54.886Z" />
      <path d="M51.505,16.002l-18.407,210.396l-26.3,0l18.407,-210.396l26.3,0Z" />
    </svg>
  )
}