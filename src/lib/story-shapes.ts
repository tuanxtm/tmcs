export const STORY_SHAPE_OPTIONS = [
  { label: '1 × 1', value: '1x1' },
  { label: '2 × 1', value: '2x1' },
  { label: '3 × 1', value: '3x1' },
  { label: '1 × 2', value: '1x2' },
  { label: '2 × 2', value: '2x2' },
] as const

/** Decorations intentionally omit 3×1 — wide ornaments rarely read well. */
export const DECORATION_SHAPE_OPTIONS = [
  { label: '1 × 1', value: '1x1' },
  { label: '2 × 1', value: '2x1' },
  { label: '1 × 2', value: '1x2' },
  { label: '2 × 2', value: '2x2' },
] as const

export type StoryShape = (typeof STORY_SHAPE_OPTIONS)[number]['value']
export type DecorationShape = (typeof DECORATION_SHAPE_OPTIONS)[number]['value']

export type StoryShapeSpan = {
  shape: StoryShape
  columnSpan: number
  rowSpan: number
  weight: number
}

export const STORY_SHAPE_SPANS: StoryShapeSpan[] = [
  { shape: '3x1', columnSpan: 3, rowSpan: 1, weight: 3 },
  { shape: '2x2', columnSpan: 2, rowSpan: 2, weight: 5 },
  { shape: '2x1', columnSpan: 2, rowSpan: 1, weight: 4 },
  { shape: '1x2', columnSpan: 1, rowSpan: 2, weight: 3 },
  { shape: '1x1', columnSpan: 1, rowSpan: 1, weight: 3 },
]
