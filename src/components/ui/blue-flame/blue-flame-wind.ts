/** A damped wind velocity, measured in simulation cells per second. */
export function createFlameWind(random = Math.random) {
  const response = 1.2
  const chooseTarget = () => {
    const direction = random() * 2 - 1
    return (direction < 0 ? -1 : 1) * (7 + Math.abs(direction) * 13)
  }
  let target = chooseTarget()
  let velocity = target
  let rate = 0
  let remaining = 5 + random() * 5

  return {
    advance(seconds: number) {
      let elapsed = Math.max(0, seconds)
      while (elapsed > 0) {
        const dt = Math.min(elapsed, remaining)
        const offset = velocity - target
        const impulse = rate + offset * response
        const damping = Math.exp(-response * dt)
        velocity = target + (offset + impulse * dt) * damping
        rate = (rate - impulse * response * dt) * damping
        elapsed -= dt
        remaining -= dt
        if (remaining <= 1e-9) {
          target = chooseTarget()
          remaining = 5 + random() * 5
        }
      }
      return { velocity, power: 0.75 + (Math.abs(velocity) / 20) * 0.65 }
    },
  }
}
