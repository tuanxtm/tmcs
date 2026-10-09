'use client'

import type { ProjectCardView } from '@/app/(frontend)/_lib/types'
import {
  CanvasSection,
  type CanvasSectionProps,
  type CanvasContentProps,
} from '../canvas/canvas-section'
import { ProjectsCanvas } from './projects-canvas'

export type ProjectsSectionProps = CanvasSectionProps<ProjectCardView>

function ProjectsContent({
  docs,
  onMovementChange,
  description,
  cursorPopupItem,
}: CanvasContentProps<ProjectCardView>) {
  return (
    <ProjectsCanvas
      projects={docs}
      description={description}
      cursorPopupItem={cursorPopupItem}
      onMovementChangeAction={onMovementChange}
    />
  )
}

export function ProjectsSection(props: ProjectsSectionProps) {
  return <CanvasSection {...props} feedType="projects" Canvas={ProjectsContent} />
}
