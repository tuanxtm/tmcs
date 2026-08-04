'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

type ColorBendsProps = {
  className?: string
  style?: React.CSSProperties
  rotation?: number
  speed?: number
  colors?: string[]
  transparent?: boolean
  autoRotate?: number
  scale?: number
  frequency?: number
  warpStrength?: number
  mouseInfluence?: number
  parallax?: number
  noise?: number
  iterations?: number
  intensity?: number
  bandWidth?: number
  /** Glyph cell height in CSS pixels */
  fontSize?: number
  /** Seconds to skip into the animation on load (shifts band phase). */
  timeOffset?: number
  /** Opacity of horizontal rules under each ASCII row (0 = off). */
  gridOpacity?: number
}

const MAX_COLORS = 8 as const
const ASCII_CHARS = '.:-=+*1#0%@'

const createAsciiAtlas = (chars = ASCII_CHARS) => {
  const cellW = 40
  const cellH = 64
  const count = chars.length
  const canvas = document.createElement('canvas')
  canvas.width = cellW * count
  canvas.height = cellH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context not available')
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const rootStyle = getComputedStyle(document.documentElement)
  const mono =
    rootStyle.getPropertyValue('--font-geist-mono').trim() ||
    'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
  // If bold is needed, use `bold ${Math.floor(cellH * 1.05)}px ${mono}`
  ctx.font = `${Math.floor(cellH * 1.05)}px ${mono}`
  for (let i = 0; i < count; i++) {
    ctx.fillText(chars[i], cellW * (i + 0.5), cellH * 0.52)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return { texture, count }
}

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer;
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
uniform float uFontSize;
uniform sampler2D uAsciiAtlas;
uniform float uAsciiCount;
uniform float uGridOpacity;

void main() {
  // Monospace glyph cells — color sampled per cell, then masked by atlas glyph
  vec2 cellSize = vec2(uFontSize * 0.58, uFontSize);
  vec2 asciiId = floor(gl_FragCoord.xy / cellSize);
  vec2 asciiUV = fract(gl_FragCoord.xy / cellSize);
  vec2 cellCenter = (asciiId + 0.5) * cellSize;
  vec2 cellUv = cellCenter / max(uCanvas, vec2(1.0));

  float t = uTime * uSpeed;
  vec2 p = cellUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

  for (int j = 0; j < 5; j++) {
    if (j >= uIterations - 1) break;
    vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
    q += (rr - q) * 0.15;
  }

  vec3 col = vec3(0.0);
  float a = 1.0;

  if (uColorCount > 0) {
    vec2 s = q;
    vec3 sumCol = vec3(0.0);
    float sumW = 0.0;
    float cover = 0.0;
    for (int i = 0; i < MAX_COLORS; ++i) {
      if (i >= uColorCount) break;
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
      float m = mix(m0, m1, kMix);
      float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
      // Weighted mix (not additive) so overlaps stay in-palette instead of blowing to white
      sumCol += uColors[i] * w;
      sumW += w;
      cover = max(cover, w);
    }
    col = sumW > 0.0001 ? clamp(sumCol / sumW, 0.0, 1.0) : vec3(0.0);
    a = uTransparent > 0 ? cover : 1.0;
  } else {
    vec2 s = q;
    for (int k = 0; k < 3; ++k) {
      s -= 0.01;
      vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
      float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float kBelow = clamp(uWarpStrength, 0.0, 1.0);
      float kMix = pow(kBelow, 0.3);
      float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
      vec2 disp = (r - s) * kBelow;
      vec2 warped = s + disp * gain;
      float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
      float m = mix(m0, m1, kMix);
      col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
    }
    a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
  }

  col *= uIntensity;

  // Soft luminance cap — keep green readable on light backgrounds when bands stack
  float hot = dot(col, vec3(0.299, 0.587, 0.114));
  col *= mix(1.0, 0.72 / max(hot, 0.001), smoothstep(0.45, 0.95, hot));
  col = clamp(col, 0.0, 1.0);

  if (uNoise > 0.0001) {
    float n = fract(sin(dot(asciiId + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
    col += (n - 0.5) * uNoise;
    col = clamp(col, 0.0, 1.0);
  }
  // Legacy:
  // Density ramp → glyph; luminance drives which character
  // float lum = dot(col, vec3(0.299, 0.587, 0.114));
  // float idx = floor(clamp(max(lum, a), 0.0, 1.0) * (uAsciiCount - 0.001));

  // Density ramp → glyph. Exponent between old (≈1 / sat high) and thin (2.0).
  float density = pow(clamp(a, 0.0, 1.0), 1.5);
  float idx = floor(clamp(density, 0.0, 1.0) * (uAsciiCount - 0.001));
  float u0 = idx / uAsciiCount;
  float u1 = (idx + 1.0) / uAsciiCount;
  vec2 atlasUV = vec2(mix(u0, u1, asciiUV.x), asciiUV.y);
  float glyph = texture2D(uAsciiAtlas, atlasUV).r;

  float cover = a * glyph;
  vec3 rgb = (uTransparent > 0) ? col * cover : col * glyph;

  // Horizontal rule under each glyph row (1px, locked to cell height)
  float rule = 1.0 - smoothstep(0.0, 1.25 / max(cellSize.y, 1.0), asciiUV.y);
  float ruleA = rule * uGridOpacity;
  vec3 ruleCol = uColorCount > 0 ? uColors[0] : vec3(0.55);
  // Premultiplied: glyphs over faint ruled lines
  vec3 outRgb = rgb + ruleCol * ruleA * (1.0 - cover);
  float outA = cover + ruleA * (1.0 - cover);
  gl_FragColor = vec4(outRgb, outA);
}
`

const vert = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`

export default function ColorBends({
  className,
  style,
  rotation = 90,
  speed = 0.2,
  colors = [],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.15,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
  fontSize = 12,
  timeOffset = 0,
  gridOpacity = 0.18,
}: ColorBendsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const rafRef = useRef<number | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const asciiAtlasRef = useRef<THREE.CanvasTexture | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const rotationRef = useRef<number>(rotation)
  const autoRotateRef = useRef<number>(autoRotate)
  const fontSizeRef = useRef<number>(fontSize)
  const timeOffsetRef = useRef<number>(timeOffset)
  const pointerTargetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
  const pointerCurrentRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0))
  const pointerSmoothRef = useRef<number>(8)

  useEffect(() => {
    const container = containerRef.current!
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0))
    const asciiAtlas = createAsciiAtlas()
    asciiAtlasRef.current = asciiAtlas.texture

    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uCanvas: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uRot: { value: new THREE.Vector2(1, 0) },
        uColorCount: { value: 0 },
        uColors: { value: uColorsArray },
        uTransparent: { value: transparent ? 1 : 0 },
        uScale: { value: scale },
        uFrequency: { value: frequency },
        uWarpStrength: { value: warpStrength },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uMouseInfluence: { value: mouseInfluence },
        uParallax: { value: parallax },
        uNoise: { value: noise },
        uIterations: { value: iterations },
        uIntensity: { value: intensity },
        uBandWidth: { value: bandWidth },
        uFontSize: { value: fontSize },
        uAsciiAtlas: { value: asciiAtlas.texture },
        uAsciiCount: { value: asciiAtlas.count },
        uGridOpacity: { value: gridOpacity },
      },
      premultipliedAlpha: true,
      transparent: true,
    })
    materialRef.current = material

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      alpha: true,
    })
    rendererRef.current = renderer
    ;(renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace
    // Cap DPR on large/desktop displays — full 2× is expensive for a full-viewport shader.
    const dprCap = Math.max(window.innerWidth, window.innerHeight) >= 1024 ? 1.5 : 2
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
    renderer.setClearColor(0x000000, transparent ? 0 : 1)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    const clock = new THREE.Clock()
    let running = document.visibilityState !== 'hidden'

    const handleResize = () => {
      const w = container.clientWidth || 1
      const h = container.clientHeight || 1
      renderer.setSize(w, h, false)
      ;(material.uniforms.uCanvas.value as THREE.Vector2).set(
        renderer.domElement.width,
        renderer.domElement.height,
      )
      material.uniforms.uFontSize.value = fontSizeRef.current * renderer.getPixelRatio()
    }

    handleResize()

    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(handleResize)
      ro.observe(container)
      resizeObserverRef.current = ro
    } else {
      ;(window as Window).addEventListener('resize', handleResize)
    }

    const loop = () => {
      if (!running) {
        rafRef.current = null
        return
      }

      const dt = clock.getDelta()
      const elapsed = clock.elapsedTime + timeOffsetRef.current
      material.uniforms.uTime.value = elapsed

      const deg = (rotationRef.current % 360) + autoRotateRef.current * elapsed
      const rad = (deg * Math.PI) / 180
      const c = Math.cos(rad)
      const s = Math.sin(rad)
      ;(material.uniforms.uRot.value as THREE.Vector2).set(c, s)

      const cur = pointerCurrentRef.current
      const tgt = pointerTargetRef.current
      const amt = Math.min(1, dt * pointerSmoothRef.current)
      cur.lerp(tgt, amt)
      ;(material.uniforms.uPointer.value as THREE.Vector2).copy(cur)
      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(loop)
    }

    const startLoop = () => {
      if (rafRef.current !== null) return
      clock.getDelta()
      rafRef.current = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      running = document.visibilityState !== 'hidden'
      if (running) startLoop()
      else if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    if (running) startLoop()

    return () => {
      running = false
      document.removeEventListener('visibilitychange', onVisibility)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect()
      else (window as Window).removeEventListener('resize', handleResize)
      geometry.dispose()
      asciiAtlas.texture.dispose()
      asciiAtlasRef.current = null
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement && renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  useEffect(() => {
    const material = materialRef.current
    const renderer = rendererRef.current
    if (!material) return

    rotationRef.current = rotation
    autoRotateRef.current = autoRotate
    fontSizeRef.current = fontSize
    timeOffsetRef.current = timeOffset
    material.uniforms.uSpeed.value = speed
    material.uniforms.uScale.value = scale
    material.uniforms.uFrequency.value = frequency
    material.uniforms.uWarpStrength.value = warpStrength
    material.uniforms.uMouseInfluence.value = mouseInfluence
    material.uniforms.uParallax.value = parallax
    material.uniforms.uNoise.value = noise
    material.uniforms.uIterations.value = iterations
    material.uniforms.uIntensity.value = intensity
    material.uniforms.uBandWidth.value = bandWidth
    material.uniforms.uFontSize.value = fontSize * (renderer?.getPixelRatio() ?? 1)
    material.uniforms.uGridOpacity.value = gridOpacity

    const toVec3 = (hex: string) => {
      const h = hex.replace('#', '').trim()
      const full = h.length === 8 ? h.slice(0, 6) : h
      const v =
        full.length === 3
          ? [parseInt(full[0] + full[0], 16), parseInt(full[1] + full[1], 16), parseInt(full[2] + full[2], 16)]
          : [
              parseInt(full.slice(0, 2), 16),
              parseInt(full.slice(2, 4), 16),
              parseInt(full.slice(4, 6), 16),
            ]
      return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255)
    }

    const arr = (colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3)
    for (let i = 0; i < MAX_COLORS; i++) {
      const vec = (material.uniforms.uColors.value as THREE.Vector3[])[i]
      if (i < arr.length) vec.copy(arr[i])
      else vec.set(0, 0, 0)
    }
    material.uniforms.uColorCount.value = arr.length

    material.uniforms.uTransparent.value = transparent ? 1 : 0
    if (renderer) renderer.setClearColor(0x000000, transparent ? 0 : 1)
  }, [
    rotation,
    autoRotate,
    speed,
    scale,
    frequency,
    warpStrength,
    mouseInfluence,
    parallax,
    noise,
    iterations,
    intensity,
    bandWidth,
    colors,
    transparent,
    fontSize,
    timeOffset,
    gridOpacity,
  ])

  useEffect(() => {
    const material = materialRef.current
    const container = containerRef.current
    if (!material || !container) return

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1)
      pointerTargetRef.current.set(x, y)
    }

    container.addEventListener('pointermove', handlePointerMove)
    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className ?? ''}`}
      style={style}
      aria-label="ColorBends ascii background"
    />
  )
}
