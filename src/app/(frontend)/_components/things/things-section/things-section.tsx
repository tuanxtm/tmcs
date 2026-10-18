'use client'
import type { ThingCardView } from '@/app/(frontend)/_lib/types'
import {
  CanvasSection,
  type CanvasSectionProps,
  type CanvasContentProps,
} from '../../canvas/canvas-section'
import { ThingsCanvas } from '../things-canvas'
export type ThingsSectionProps = CanvasSectionProps<ThingCardView>
function ThingsContent({
  header,
  docs,
  locale,
  description,
  cursorPopupItem,
  onMovementChange,
  onOverlayChange,
}: CanvasContentProps<ThingCardView>) {
  return (
    <ThingsCanvas
      header={header}
      things={docs}
      locale={locale}
      description={description}
      cursorPopupItem={cursorPopupItem}
      onMovementChange={onMovementChange}
      onDetailOpenChange={onOverlayChange}
    />
  )
}
export function ThingsSection(props: ThingsSectionProps) {
  return <CanvasSection {...props} feedType="things" Canvas={ThingsContent} />
}
