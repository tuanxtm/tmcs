export function Background() {
  const railInset =
    'max(var(--page-gutter), calc((100% - min(100%, var(--content-max))) / 2 + var(--page-gutter)))'

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(267deg,#2c6035_4.2%,#2a422f_98.63%)]" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-soft-light"
          style={{
            backgroundImage: 'url(/noise.svg)',
            backgroundSize: '350px 350px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>
      {/* Rails above header blur so L/R strokes aren't doubled or buried */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[45]">
        <span className="dash-rail dash-rail-left absolute inset-y-0" style={{ left: railInset }} />
        <span className="dash-rail dash-rail-right absolute inset-y-0" style={{ right: railInset }} />
      </div>
    </>
  )
}
