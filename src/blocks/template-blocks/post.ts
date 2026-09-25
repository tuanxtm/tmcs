import type { Block } from 'payload'

/**
 * Renders the currently routed Post via the shared `<DetailPage>` UI.
 *
 * Has no fields - drop it on a template Page and it auto-binds to whichever
 * Post is at `/[slug]` (via the resolver context that the route sets up
 * before calling the template Page's layout). The `templatePage` sidebar
 * field on a Post (required) chooses which template Page renders for it;
 * the `Template - Post` block lives somewhere inside that template's layout.
 */
export const TemplatePostBlock: Block = {
  slug: 'templatePost',
  labels: {
    singular: 'Template - Post',
    plural: 'Template - Posts',
  },
  fields: [],
}
