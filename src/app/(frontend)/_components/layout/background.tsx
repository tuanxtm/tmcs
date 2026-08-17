'use client'

export function Background() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-dvh w-full overflow-hidden bg-secondary-background"
      ></div>
    </>
  )
}
