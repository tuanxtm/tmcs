'use client'

/**
 * Small context icon (sidebar, mobile nav). Payload's Icon slot is
 * hard-capped at 16×16, so this renders the animated `Logo` at its
 * `sm` size preset (intrinsic ~11×10 footprint after 30° rotation).
 * The full animated `Logo` component is used in larger contexts
 * like the Login view (default `lg` size).
 */
import Logo from './logo'

export default function Icon() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Logo siteName="tuantm" size="sm" />
    </div>
  )
}
