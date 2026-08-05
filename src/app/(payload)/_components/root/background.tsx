'use client'

import ColorBends from '@/components/ui/color-bends'

export default function Background() {
  return (
    <ColorBends
      colors={['#8BA876', '#5A7D4A', '#C5D4A8']}
      bandWidth={4}
      rotation={180}
      speed={0.03}
      scale={1}
      frequency={1}
      warpStrength={1}
      mouseInfluence={0.1}
      noise={0.12}
      parallax={0.25}
      iterations={1}
      intensity={2}
      fontSize={12}
      timeOffset={64}
      gridOpacity={0.2}
      transparent
      autoRotate={0}
    />
  )
}
