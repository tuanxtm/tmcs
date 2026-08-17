import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">404</p>
      <h1 className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.03em] font-medium text-foreground">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This page is unpublished, missing, or the link is outdated.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex min-h-11 items-center border border-foreground px-4 text-xs uppercase tracking-wide text-foreground transition-colors hover:bg-hover-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Back home
      </Link>
    </section>
  )
}
