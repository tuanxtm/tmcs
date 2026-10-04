'use client'

import type { FeedDecorationView, ProjectCardView } from '@/app/(frontend)/_lib/types'
import { DraggableCanvas, type CanvasItemProps } from '../canvas/draggable-canvas'
import { ProjectCanvasItem } from './project-canvas-item'

function renderProject({ item, ...props }: CanvasItemProps<ProjectCardView>) {
  return <ProjectCanvasItem project={item} {...props} />
}

export function ProjectsCanvas(props: {
  projects: ProjectCardView[]
  description?: string | null
  cursorPopupItem?: string | null
  decorations?: FeedDecorationView[]
  onMovementChange?: (moving: boolean) => void
}) {
  const { projects, ...rest } = props
  return <DraggableCanvas items={projects} kind="project" renderItem={renderProject} {...rest} />
}
