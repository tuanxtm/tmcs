struct Params {
  columns: u32,
  rows: u32,
  blend: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read> previous: array<vec4f>;
@group(0) @binding(2) var<storage, read> current: array<vec4f>;
@group(0) @binding(3) var<storage, read> palette: array<vec4f>;

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let cell = min(vec2u(uv * vec2f(f32(params.columns), f32(params.rows))),
    vec2u(params.columns - 1u, params.rows - 1u));
  let index = cell.y * params.columns + cell.x;
  let heat = clamp(mix(previous[index].x, current[index].x, params.blend), 0.0, 36.0);
  let low = u32(heat);
  let color = mix(palette[low], palette[min(low + 1u, 36u)], fract(heat));
  return vec4f(color.rgb * color.a, color.a);
}
