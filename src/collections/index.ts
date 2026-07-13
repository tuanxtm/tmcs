import type { CollectionConfig } from 'payload'

import { Authors } from './Authors'
import { Categories } from './Categories'
import { ContactSubmissions } from './ContactSubmissions'
import { Media } from './Media'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Projects } from './Projects'
import { Tags } from './Tags'
import { Users } from './Users'

/**
 * Collection registration order.
 * Auth collection first, then media, then content dependencies.
 */
export const collections: CollectionConfig[] = [
  Users,
  Media,
  Authors,
  Categories,
  Tags,
  Posts,
  Projects,
  Pages,
  ContactSubmissions,
]
