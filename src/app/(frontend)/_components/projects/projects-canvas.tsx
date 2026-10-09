'use client'

import type { ProjectCardView } from '@/app/(frontend)/_lib/types'
import { DraggableCanvas, type CanvasItemProps } from '../canvas/draggable-canvas'
import { ProjectCanvasItem } from './project-canvas-item'

function renderProject({ item, ...props }: CanvasItemProps<ProjectCardView>) {
  return <ProjectCanvasItem project={item} {...props} />
}

export function ProjectsCanvas(props: {
  projects: ProjectCardView[]
  description?: string | null
  cursorPopupItem?: string | null
  onMovementChangeAction?: (moving: boolean) => void
}) {
  const { projects, onMovementChangeAction, ...rest } = props
  return (
    <DraggableCanvas
      items={projects}
      kind="project"
      renderItem={renderProject}
      onMovementChange={onMovementChangeAction}
      {...rest}
    />
  )
}
