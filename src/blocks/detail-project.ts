import type { Block } from 'payload'

/**
 * Renders the currently routed Project via the shared `<DetailPage>` UI.
 *
 * Has no fields - drop it on a template Page and it auto-binds to whichever
 * Project is at `/[slug]` (via the resolver context that the route sets up
 * before calling the template Page's layout). The `templatePage` sidebar
 * field on a Project (required) chooses which template Page renders for it;
 * the `Detail - Project` block lives somewhere inside that template's layout.
 */
export const DetailProjectBlock: Block = {
  slug: 'detailProject',
  labels: {
    singular: 'Detail - Project',
    plural: 'Detail - Projects',
  },
  fields: [],
}
