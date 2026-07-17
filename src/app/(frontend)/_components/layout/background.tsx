export function Background() {
  const railInset =
    'max(var(--page-gutter), calc((100% - min(100%, var(--content-max))) / 2 + var(--page-gutter)))'

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(268deg,#295d32_4.2%,#273f2c_98.63%)]" />
      </div>
      {/* Rails above header blur so L/R strokes aren't doubled or buried */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45]">
        <span className="dash-rail dash-rail-left absolute inset-y-0" style={{ left: railInset }} />
        <span className="dash-rail dash-rail-right absolute inset-y-0" style={{ right: railInset }} />
      </div>
    </>
  )
}
