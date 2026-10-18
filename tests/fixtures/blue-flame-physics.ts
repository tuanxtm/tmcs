import { compute, frame, init, pingPongStorage } from 'vgpu'
import shader from '@/components/ui/blue-flame/blue-flame-simulation.wgsl'

export async function measureFlamePhysics() {
  const gpu = await init({ powerPreference: 'low-power' })
  const errors: string[] = []
  gpu.onError((error) => errors.push(String(error)))
  try {
    const columns = 128
    const rows = 50
    async function carry(wind: number, power: number) {
      const state = pingPongStorage(gpu, columns * rows * 16)
      const initial = new Float32Array(columns * rows * 4)
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index = (y * columns + x) * 4
          initial[index] = 36 * Math.exp(-((x - 64) ** 2 + (y - 22) ** 2) / 20)
          initial[index + 1] = 0
          initial[index + 2] = 12 * power
          initial[index + 3] = 0.8
        }
      }
      state.read.write(initial)
      const simulation = compute(gpu, shader)
      await simulation.compile()
      frame(gpu, (encoding) => {
        encoding.computePass((pass) => {
          for (let i = 0; i < 30; i++) {
            simulation.set({
              src: state.read,
              dst: state.write,
              sim: { columns, rows, dt: 1 / 60, time: i / 60, wind, power, initialize: 0 },
            })
            pass.dispatch(simulation, columns / 8, Math.ceil(rows / 8))
            state.swap()
          }
        })
      })
      const values = new Float32Array(await state.read.read())
      let heat = 0
      let weightedX = 0
      let weightedY = 0
      let bounded = true
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
          const index = (y * columns + x) * 4
          const value = values[index]
          bounded &&= value >= 0 && value <= 36
          bounded &&= values.slice(index, index + 4).every(Number.isFinite)
          if (y >= 34) continue
          heat += value
          weightedX += value * x
          weightedY += value * y
        }
      }
      simulation.dispose()
      return {
        x: weightedX / heat,
        y: weightedY / heat,
        heat,
        bounded,
        rootWind: values[((rows - 1) * columns + 64) * 4 + 1],
        lowerWind: values[((rows - 4) * columns + 64) * 4 + 1],
      }
    }
    const left = await carry(-18, 1)
    const right = await carry(18, 1)
    const slow = await carry(0, 0.75)
    const fast = await carry(0, 1.4)
    return { left, right, slow, fast, errors }
  } finally {
    gpu.dispose()
  }
}
