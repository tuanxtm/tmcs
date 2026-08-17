import React from 'react'

type BarcodeProps = {
  value: string
  lineColor?: string
  quietZoneModules?: number
  className?: string
}

// CODE128 patterns (0-106). Indices 100-106 cover controls (Code B/C, Starts, Stop).
const PATTERNS: number[][] = [
  [2, 1, 2, 2, 2, 2],
  [2, 2, 2, 1, 2, 2],
  [2, 2, 2, 2, 2, 1],
  [1, 2, 1, 2, 2, 3],
  [1, 2, 1, 3, 2, 2],
  [1, 3, 1, 2, 2, 2],
  [1, 2, 2, 2, 1, 3],
  [1, 2, 2, 3, 1, 2],
  [1, 3, 2, 2, 1, 2],
  [2, 2, 1, 2, 1, 3],
  [2, 2, 1, 3, 1, 2],
  [2, 3, 1, 2, 1, 2],
  [1, 1, 2, 2, 3, 2],
  [1, 2, 2, 1, 3, 2],
  [1, 2, 2, 2, 3, 1],
  [1, 1, 3, 2, 2, 2],
  [1, 2, 3, 1, 2, 2],
  [1, 2, 3, 2, 2, 1],
  [2, 2, 3, 2, 1, 1],
  [2, 2, 1, 1, 3, 2],
  [2, 2, 1, 2, 3, 1],
  [2, 1, 3, 2, 1, 2],
  [2, 2, 3, 1, 1, 2],
  [3, 1, 2, 1, 3, 1],
  [3, 1, 1, 2, 2, 2],
  [3, 2, 1, 1, 2, 2],
  [3, 2, 1, 2, 2, 1],
  [3, 1, 2, 2, 1, 2],
  [3, 2, 2, 1, 1, 2],
  [3, 2, 2, 2, 1, 1],
  [2, 1, 2, 1, 2, 3],
  [2, 1, 2, 3, 2, 1],
  [2, 1, 1, 2, 4, 1],
  [1, 1, 1, 3, 2, 3],
  [1, 3, 1, 1, 2, 3],
  [1, 3, 1, 3, 2, 1],
  [1, 1, 2, 3, 1, 3],
  [1, 3, 2, 1, 1, 3],
  [1, 3, 2, 3, 1, 1],
  [2, 1, 1, 3, 1, 3],
  [2, 1, 1, 3, 3, 1],
  [2, 3, 1, 1, 1, 3],
  [2, 3, 1, 3, 1, 1],
  [1, 1, 2, 1, 3, 3],
  [1, 1, 2, 3, 3, 1],
  [1, 3, 2, 1, 3, 1],
  [1, 1, 3, 1, 2, 3],
  [1, 1, 3, 3, 2, 1],
  [1, 3, 3, 1, 2, 1],
  [3, 1, 1, 1, 1, 4],
  [3, 1, 1, 3, 2, 1],
  [3, 1, 3, 1, 1, 2],
  [3, 3, 1, 1, 1, 2],
  [3, 1, 2, 1, 1, 3],
  [3, 1, 2, 1, 3, 1],
  [3, 3, 1, 2, 1, 1],
  [3, 1, 1, 2, 1, 3],
  [3, 1, 1, 2, 3, 1],
  [3, 1, 2, 2, 1, 2],
  [3, 2, 1, 1, 1, 3],
  [3, 2, 1, 1, 2, 2],
  [3, 2, 1, 2, 1, 2],
  [3, 2, 2, 1, 1, 2],
  [2, 1, 2, 1, 1, 4],
  [2, 1, 1, 2, 4, 1],
  [1, 1, 2, 2, 1, 4],
  [1, 2, 2, 1, 1, 3],
  [2, 2, 1, 2, 1, 3],
  [2, 2, 1, 1, 2, 3],
  [1, 1, 2, 3, 2, 1],
  [1, 1, 3, 1, 2, 3],
  [1, 2, 2, 3, 1, 1],
  [2, 1, 1, 2, 1, 4],
  [2, 1, 1, 2, 3, 2],
  [2, 3, 1, 2, 1, 1],
  [2, 1, 2, 2, 2, 2],
  [2, 1, 2, 1, 2, 3],
  [2, 2, 1, 1, 3, 2],
  [2, 2, 1, 3, 1, 2],
  [1, 1, 2, 2, 3, 1],
  [2, 2, 2, 1, 2, 1],
  [1, 2, 1, 1, 3, 3],
  [1, 1, 3, 2, 2, 1],
  [1, 2, 1, 2, 2, 2],
  [3, 1, 1, 2, 2, 2],
  [2, 1, 1, 2, 3, 1],
  [2, 1, 2, 2, 2, 1],
  [2, 2, 2, 2, 1, 1],
  [3, 1, 1, 1, 1, 4],
  [2, 1, 1, 3, 2, 1],
  [1, 1, 1, 4, 2, 2],
  [1, 1, 4, 1, 1, 3],
  [1, 3, 1, 1, 1, 4],
  [1, 1, 1, 3, 1, 4],
  [4, 1, 1, 1, 1, 3],
  [4, 1, 1, 2, 1, 2],
  [1, 2, 2, 1, 2, 1],
  [1, 2, 2, 2, 1, 1],
  [2, 1, 2, 2, 1, 1],
  [2, 1, 1, 2, 2, 1],
  [1, 1, 4, 1, 3, 1], // 100 CODE C / CODE B
  [3, 1, 1, 1, 4, 1], // 101 CODE A
  [4, 1, 1, 1, 3, 1], // 102 FNC1
  [2, 1, 1, 4, 1, 2], // 103 START A
  [2, 1, 1, 2, 1, 4], // 104 START B
  [2, 1, 1, 2, 3, 2], // 105 START C
  [2, 3, 3, 1, 1, 1, 2], // 106 STOP (7 elements)
]

function encodeAutoCODE128(text: string): number[] {
  // Filter ASCII range 32-127
  const chars = Array.from(text).filter((c) => {
    const code = c.charCodeAt(0)
    return code >= 32 && code <= 127
  })

  if (chars.length === 0) return []

  const tokens: number[] = []
  let i = 0
  let mode: 'B' | 'C' = 'B'

  // Start with Code C if string begins with 4+ contiguous digits
  const leadingDigits = chars.join('').match(/^\d+/)
  if (leadingDigits && leadingDigits[0].length >= 4) {
    tokens.push(105) // START C
    mode = 'C'
  } else {
    tokens.push(104) // START B
    mode = 'B'
  }

  while (i < chars.length) {
    if (mode === 'B') {
      let digitCount = 0
      while (i + digitCount < chars.length && /\d/.test(chars[i + digitCount])) {
        digitCount++
      }

      // Dynamic switch to Code C if 4+ digits encountered
      if (digitCount >= 4) {
        tokens.push(100) // CODE C switch
        mode = 'C'
      } else {
        tokens.push(chars[i].charCodeAt(0) - 32)
        i++
      }
    } else {
      // Code C digit-pair encoding
      if (i + 1 < chars.length && /\d/.test(chars[i]) && /\d/.test(chars[i + 1])) {
        tokens.push(parseInt(chars[i] + chars[i + 1], 10))
        i += 2
      } else {
        tokens.push(100) // CODE B switch
        mode = 'B'
      }
    }
  }

  // Calculate Checksum: (START + sum(val_j * j)) % 103
  let checksum = tokens[0]
  for (let j = 1; j < tokens.length; j++) {
    checksum += tokens[j] * j
  }
  tokens.push(checksum % 103)
  tokens.push(106) // STOP

  return tokens
}

export function Barcode({
  value,
  lineColor = 'currentColor',
  quietZoneModules = 10,
  className,
}: BarcodeProps) {
  const height = 100
  const sequence = encodeAutoCODE128(value)

  if (sequence.length === 0) return null

  const modules = sequence.flatMap((val) => PATTERNS[val])

  let currentX = quietZoneModules
  const bars: { x: number; width: number }[] = []
  let isBar = true

  for (const moduleWidth of modules) {
    if (isBar) {
      bars.push({ x: currentX, width: moduleWidth })
    }
    currentX += moduleWidth
    isBar = !isBar
  }

  const totalWidthModules = currentX + quietZoneModules

  return (
    <svg
      viewBox={`0 0 ${totalWidthModules} ${height}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      {bars.map((bar, i) => (
        <rect key={i} x={bar.x} y={0} width={bar.width} height={height} fill={lineColor} />
      ))}
    </svg>
  )
}
