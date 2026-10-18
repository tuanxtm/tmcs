struct Simulation {
  columns: u32,
  rows: u32,
  dt: f32,
  time: f32,
  wind: f32,
  power: f32,
  initialize: u32,
}

@group(0) @binding(0) var<uniform> sim: Simulation;
// Heat, horizontal velocity, rising velocity, fuel.
@group(0) @binding(1) var<storage, read> src: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> dst: array<vec4f>;

fn hash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn noise(p: vec2f) -> f32 {
  let cell = floor(p);
  let local = fract(p);
  let t = local * local * (3.0 - 2.0 * local);
  return mix(mix(hash(cell), hash(cell + vec2f(1, 0)), t.x),
    mix(hash(cell + vec2f(0, 1)), hash(cell + vec2f(1, 1)), t.x), t.y);
}

fn randomCell(cell: vec2u, tick: u32, salt: u32) -> f32 {
  var bits = cell.x * 1973u + cell.y * 9277u + tick * 26699u + salt;
  bits = (bits ^ (bits >> 16u)) * 2246822519u;
  bits = (bits ^ (bits >> 13u)) * 3266489917u;
  bits ^= bits >> 16u;
  return f32(bits & 16777215u) / 16777216.0;
}

fn loadCell(p: vec2i) -> vec4f {
  let width = i32(sim.columns);
  let x = u32(((p.x % width) + width) % width);
  let y = u32(clamp(p.y, 0, i32(sim.rows) - 1));
  return src[y * sim.columns + x];
}

fn sampleState(p: vec2f) -> vec4f {
  let cell = vec2i(floor(p));
  let t = fract(p);
  return mix(mix(loadCell(cell), loadCell(cell + vec2i(1, 0)), t.x),
    mix(loadCell(cell + vec2i(0, 1)), loadCell(cell + vec2i(1, 1)), t.x), t.y);
}

@compute @workgroup_size(8, 8)
fn cs_main(@builtin(global_invocation_id) id: vec3u) {
  if (id.x >= sim.columns || id.y >= sim.rows) { return; }
  let index = id.y * sim.columns + id.x;
  let position = vec2f(id.xy);
  let height = f32(sim.rows - 1u - id.y);
  if (sim.initialize == 1u) {
    let fuel = noise(vec2f(position.x * 0.6, height * 0.16 + sim.time));
    let reach = 19.0 + fuel * 26.0;
    let heat = max(0.0, 36.0 * (1.0 - height / reach)
      - noise(position * 0.8 + sim.time) * 3.0);
    dst[index] = vec4f(heat, sim.wind, 10.0 + heat * 0.22, fuel);
    if (id.y == sim.rows - 1u) { dst[index].x = 36.0; }
    return;
  }

  let local = src[index];
  let p = position * 0.13 + vec2f(-sim.time * 0.18, sim.time * 0.65);
  let eddy = vec2f(
    noise(p + vec2f(0, 0.5)) - noise(p - vec2f(0, 0.5)),
    noise(p - vec2f(0.5, 0)) - noise(p + vec2f(0.5, 0))) * 7.0;
  let flickerPosition = position * 0.65 + vec2f(-sim.time * 0.4, sim.time * 2.5);
  let flicker = vec2f(noise(flickerPosition), noise(flickerPosition + 71.0)) * 2.0 - 1.0;
  let airflow = vec2f(sim.wind + eddy.x + flicker.x * 5.0,
    (8.0 + local.x * 0.3 + eddy.y + flicker.y * 4.0) * sim.power);
  let velocity = mix(local.yz, airflow, 1.0 - exp(-sim.dt * 3.0));
  // Trace heat and momentum backward through the moving air.
  let origin = position - vec2f(velocity.x, -velocity.y) * sim.dt;
  let carried = sampleState(origin);
  // Carry discrete heat packets to retain torn tips instead of averaging them away.
  let tick = u32(sim.time * 60.0);
  let random = vec2f(randomCell(id.xy, tick, 0u), randomCell(id.xy, tick, 31847u));
  let offset = vec2i(select(vec2f(0), vec2f(1), random < fract(origin)));
  let packet = loadCell(vec2i(floor(origin)) + offset);
  let cooling = 8.0 + (1.0 - packet.w) * 14.0
    + noise(flickerPosition + 19.0) * 5.0;
  let heat = max(0.0, packet.x - cooling * sim.dt);
  let momentum = mix(carried.yz, airflow, 1.0 - exp(-sim.dt * 3.0));
  dst[index] = vec4f(heat, momentum, max(0.0, packet.w - sim.dt * 0.03));
  if (id.y == sim.rows - 1u) {
    let fuel = noise(vec2f(position.x * 0.65, sim.time * 3.0));
    dst[index] = vec4f(36.0, sim.wind, 18.0 * sim.power, fuel);
  }
}
