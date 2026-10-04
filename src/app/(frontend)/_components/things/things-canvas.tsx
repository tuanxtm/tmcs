'use client'

import { useMemo } from 'react'
import type { FeedDecorationView, ThingCardView } from '@/app/(frontend)/_lib/types'
import type { LocaleCode } from '@/lib/locales'
import { DraggableCanvas } from '../canvas/draggable-canvas'
import { ThingCanvasItem } from './thing-canvas-item'

export function ThingsCanvas({
  things,
  locale,
  onDetailOpenChange,
  ...props
}: {
  things: ThingCardView[]
  locale: LocaleCode
  description?: string | null
  cursorPopupItem?: string | null
  decorations?: FeedDecorationView[]
  onMovementChange?: (moving: boolean) => void
  onDetailOpenChange?: (open: boolean) => void
}) {
  const items = useMemo(() => things.map((thing) => ({ ...thing, title: thing.name })), [things])
  return (
    <DraggableCanvas
      {...props}
      items={items}
      kind="thing"
      renderItem={(itemProps) => (
        <ThingCanvasItem {...itemProps} locale={locale} onDetailOpenChange={onDetailOpenChange} />
      )}
    />
  )
}
