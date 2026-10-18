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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Fixture />
  </StrictMode>,
)
