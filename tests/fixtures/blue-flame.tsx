import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BlueFlame } from '@/components/ui/blue-flame'

function Fixture() {
  const [mounted, setMounted] = useState(true)
  return (
    <>
      <div className="fire">{mounted ? <BlueFlame /> : null}</div>
      <button onClick={() => setMounted((value) => !value)}>Toggle fire</button>
    </>
  )
}

if (new URLSearchParams(window.location.search).has('physics')) {
  void import('./blue-flame-physics').then(async ({ measureFlamePhysics }) => {
    const result = await measureFlamePhysics()
    ;(window as unknown as { flamePhysics: typeof result }).flamePhysics = result
  })
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Fixture />
    </StrictMode>,
  )
}
