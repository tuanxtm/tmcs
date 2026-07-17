import type { CollectionConfig } from 'payload'

import { Authors } from './Authors'
import { Categories } from './Categories'
import { ContactSubmissions } from './ContactSubmissions'
import { FeedDecorations } from './FeedDecorations'
import { Media } from './Media'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Projects } from './Projects'
import { ShortStories } from './ShortStories'
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
  ShortStories,
  FeedDecorations,
  Projects,
  Pages,
  ContactSubmissions,
]
