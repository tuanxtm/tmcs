import type { Block } from 'payload'

export const ProjectsGridBlock: Block = {
  slug: 'projectsGrid',
  labels: {
    singular: 'Projects grid',
    plural: 'Projects grids',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
    },
    {
      name: 'items',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
    },
    {
      name: 'featuredOnly',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
