import type { CollectionConfig } from 'payload'

import { Authors } from './Authors'
import { Categories } from './Categories'
import { ContactSubmissions } from './ContactSubmissions'
import { DecorationPacks } from './DecorationPacks'
import { FeedDecorations } from './FeedDecorations'
import { Media } from './Media'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Projects } from './Projects'
import { ShortStories } from './ShortStories'
import { Tags } from './Tags'
import { Things } from './Things'
import { Users } from './Users'
import { Videos } from './Videos'

/**
 * Collection registration order.
 * Auth collection first, then media, then content dependencies.
 * FeedDecorations (WebP upload) before DecorationPacks (items upload to it).
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
  DecorationPacks,
  Projects,
  Things,
  Videos,
  Pages,
  ContactSubmissions,
]
