const PAPER_TEXTURE = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="3" seed="8" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#grain)" opacity="0.12"/></svg>',
)}")`

export function Background() {
  return (
    <div
      aria-hidden="true"
      className="bg-background pointer-events-none fixed inset-0 -z-10"
      style={{ backgroundImage: PAPER_TEXTURE, backgroundSize: '256px 256px' }}
    />
  )
}
