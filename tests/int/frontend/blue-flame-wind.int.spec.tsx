import { describe, expect, it } from 'vitest'
import { createFlameWind } from '@/components/ui/blue-flame/blue-flame-wind'

function alternatingWeather() {
  let call = 0
  return () => [0.95, 0, 0.05, 0][call++ % 4]
}

describe('flame wind', () => {
  it('keeps a breeze during otherwise calm weather, including startup', () => {
    const wind = createFlameWind(() => 0.5)
    expect(wind.advance(0).velocity).toBeGreaterThanOrEqual(7)
    for (let i = 0; i < 3600; i++) {
      expect(wind.advance(1 / 60).velocity).toBeGreaterThanOrEqual(7)
    }
  })

  it('reverses smoothly through calm air and changes power with the gusts', () => {
    const wind = createFlameWind(alternatingWeather())
    const samples = Array.from({ length: 900 }, () => wind.advance(1 / 60))
    expect(Math.max(...samples.map((sample) => sample.velocity))).toBeGreaterThan(12)
    expect(Math.min(...samples.map((sample) => sample.velocity))).toBeLessThan(-12)
    expect(Math.max(...samples.map((sample) => sample.power))).toBeGreaterThan(1.1)
    expect(Math.min(...samples.map((sample) => sample.power))).toBeLessThan(0.8)
    for (let i = 1; i < samples.length; i++) {
      expect(Math.abs(samples[i].velocity - samples[i - 1].velocity)).toBeLessThan(0.3)
      expect(samples[i].power).toBeGreaterThanOrEqual(0.75)
      expect(samples[i].power).toBeLessThanOrEqual(1.4)
    }
  })

  it('follows elapsed time consistently at different frame rates', () => {
    const slow = createFlameWind(alternatingWeather())
    const fast = createFlameWind(alternatingWeather())
    for (let i = 0; i < 300; i++) slow.advance(1 / 30)
    for (let i = 0; i < 1200; i++) fast.advance(1 / 120)
    expect(slow.advance(0).velocity).toBeCloseTo(fast.advance(0).velocity, 8)
    expect(slow.advance(0).power).toBeCloseTo(fast.advance(0).power, 8)
  })

  it('holds its state while paused', () => {
    const wind = createFlameWind(alternatingWeather())
    const before = wind.advance(2)
    expect(wind.advance(0)).toEqual(before)
    expect(wind.advance(-1)).toEqual(before)
  })
})
