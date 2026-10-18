import { effect, frame, init, storage, surface } from 'vgpu'
import shader from './blue-flame.wgsl'

const ROWS = 50
const MAX_COLUMNS = 512
const STEP_MS = 100
const MAX_HEAT = 36

export async function createBlueFlameRenderer(canvas: HTMLCanvasElement) {
  const gpu = await init({ powerPreference: 'low-power' })
  try {
    const screen = surface(gpu, canvas, {
      autoResize: false,
      size: [1, 1],
      alphaMode: 'premultiplied',
      clearColor: [0, 0, 0, 0],
    })
    const previous = storage(gpu, MAX_COLUMNS * ROWS * 4, 'read')
    const current = storage(gpu, MAX_COLUMNS * ROWS * 4, 'read')
    const palette = storage(gpu, 37 * 16, 'read')
    const fire = effect(gpu, shader, {
      label: 'blue-flame',
      set: { previous, current, palette, params: { columns: 1, rows: ROWS, blend: 1 } },
    })
    let columns = 1
    let pixels = new Float32Array(ROWS)
    let before = new Float32Array(ROWS)
    let lastStep = 0
    let disposed = false
    let colorKey = ''
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })

    function propagate() {
      before.set(pixels)
      for (let x = 0; x < columns; x++) {
        for (let y = 0; y < ROWS - 1; y++) {
          const index = y * columns + x
          const decay = Math.floor(Math.random() * 2.6)
          // Wrap within the row instead of writing before the array or into another row.
          const destination = y * columns + ((x - decay + columns) % columns)
          pixels[destination] = Math.max(0, pixels[index + columns] - decay)
        }
      }
    }

    function updatePalette() {
      const styles = getComputedStyle(canvas)
      const color = styles.color
      const background = styles.getPropertyValue('--background').trim() || '#ffffff'
      const key = `${color}:${background}`
      if (key === colorKey || !probe) return
      colorKey = key
      probe.clearRect(0, 0, 1, 1)
      probe.fillStyle = color
      probe.fillRect(0, 0, 1, 1)
      const rgb = probe.getImageData(0, 0, 1, 1).data
      probe.fillStyle = '#ffffff'
      probe.fillStyle = background
      probe.fillRect(0, 0, 1, 1)
      const backdrop = probe.getImageData(0, 0, 1, 1).data
      const brightness = (backdrop[0] * 0.2126 + backdrop[1] * 0.7152 + backdrop[2] * 0.0722) / 255
      const highlight = brightness > 0.6 ? 0.65 : 1
      const tip = [rgb[0] * 0.75, rgb[1] + (rgb[2] - rgb[1]) * 0.35, rgb[2]]
      const colors = new Float32Array(37 * 4)
      for (let i = 0; i <= MAX_HEAT; i++) {
        const heat = i / MAX_HEAT
        for (let channel = 0; channel < 3; channel++) {
          const accent = rgb[channel] / 255
          const cyan = (tip[channel] / 255) * 0.82 + 0.18
          colors[i * 4 + channel] =
            heat <= 0.5
              ? cyan + (accent - cyan) * (heat * 2) ** 0.65
              : accent + (1 - accent) * ((heat - 0.5) * 2) ** 1.6 * highlight
        }
        colors[i * 4 + 3] = Math.min(1, heat * 4)
      }
      palette.write(colors)
    }

    function resize(width: number, height: number) {
      if (disposed || width <= 0 || height <= 0) return
      // One render pixel per CSS pixel, bounded independently of device pixel ratio.
      const scale = Math.min(1, 1920 / width, 1080 / height)
      screen.resize([
        Math.max(1, Math.round(width * scale)),
        Math.max(1, Math.round(height * scale)),
      ])
      const nextColumns = Math.min(MAX_COLUMNS, Math.max(3, Math.round((width / height) * ROWS)))
      if (columns === nextColumns) return
      columns = nextColumns
      pixels = new Float32Array(columns * ROWS)
      before = new Float32Array(pixels.length)
      pixels.fill(MAX_HEAT, columns * (ROWS - 1))
      for (let i = 0; i < ROWS; i++) propagate()
      previous.write(before)
      current.write(pixels)
      lastStep = 0
    }

    function render(now: number, still = false) {
      if (disposed) return
      updatePalette()
      if (!lastStep) lastStep = now
      if (!still && now - lastStep >= STEP_MS) {
        propagate()
        previous.write(before)
        current.write(pixels)
        lastStep = now - ((now - lastStep) % STEP_MS)
      }
      fire.set({ params: { columns, rows: ROWS, blend: still ? 1 : (now - lastStep) / STEP_MS } })
      frame(gpu, (pass) => pass.pass(screen, fire))
    }

    function dispose() {
      if (disposed) return
      disposed = true
      fire.dispose()
      screen.dispose()
      gpu.dispose()
    }

    await fire.compile(screen)
    return { resize, render, dispose, lost: gpu.lost, onError: gpu.onError.bind(gpu) }
  } catch (error) {
    gpu.dispose()
    throw error
  }
}
