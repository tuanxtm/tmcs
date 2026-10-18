import { compute, effect, frame, init, pingPongStorage, storage, surface } from 'vgpu'
import shader from './blue-flame.wgsl'
import simulationShader from './blue-flame-simulation.wgsl'
import { createFlameWind } from './blue-flame-wind'

const ROWS = 50
const MAX_COLUMNS = 512
const STEP_SECONDS = 1 / 60
const SIMULATION_SPEED = 0.6
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
    const state = pingPongStorage(gpu, MAX_COLUMNS * ROWS * 16)
    const palette = storage(gpu, 37 * 16, 'read')
    const fire = effect(gpu, shader, {
      label: 'blue-flame',
      set: {
        previous: state.read,
        current: state.read,
        palette,
        params: { columns: 1, rows: ROWS, blend: 1 },
      },
    })
    const simulation = compute(gpu, simulationShader, { label: 'blue-flame-simulation' })
    const wind = createFlameWind()
    let columns = 0
    let lastFrame: number | undefined
    let accumulator = 0
    let time = Math.random() * 100
    let initialize = true
    let history = false
    let disposed = false
    let colorKey = ''
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })

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
      initialize = true
      history = false
      accumulator = 0
      lastFrame = undefined
    }

    function render(now: number, still = false) {
      if (disposed) return
      updatePalette()
      const elapsed =
        lastFrame === undefined ? 0 : Math.min(0.1, Math.max(0, (now - lastFrame) / 1000))
      lastFrame = now
      if (!still) accumulator += elapsed * SIMULATION_SPEED
      frame(gpu, (encoding) => {
        if (initialize || (!still && accumulator >= STEP_SECONDS)) {
          encoding.computePass((pass) => {
            do {
              const weather = wind.advance(initialize ? 0 : STEP_SECONDS)
              if (!initialize) {
                history = true
                accumulator -= STEP_SECONDS
                time += STEP_SECONDS
              }
              simulation.set({
                src: state.read,
                dst: state.write,
                sim: {
                  columns,
                  rows: ROWS,
                  dt: STEP_SECONDS,
                  time,
                  wind: weather.velocity,
                  power: weather.power,
                  initialize: initialize ? 1 : 0,
                },
              })
              pass.dispatch(simulation, Math.ceil(columns / 8), Math.ceil(ROWS / 8))
              state.swap()
              initialize = false
            } while (!still && accumulator >= STEP_SECONDS)
          })
        }
        fire.set({
          previous: still || !history ? state.read : state.write,
          current: state.read,
          params: { columns, rows: ROWS, blend: still ? 1 : accumulator / STEP_SECONDS },
        })
        encoding.pass(screen, fire)
      })
    }

    function pause() {
      lastFrame = undefined
    }

    function dispose() {
      if (disposed) return
      disposed = true
      fire.dispose()
      simulation.dispose()
      screen.dispose()
      gpu.dispose()
    }

    await Promise.all([fire.compile(screen), simulation.compile()])
    return { resize, render, pause, dispose, lost: gpu.lost, onError: gpu.onError.bind(gpu) }
  } catch (error) {
    gpu.dispose()
    throw error
  }
}
