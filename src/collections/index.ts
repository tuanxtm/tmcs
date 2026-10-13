import type { CollectionConfig } from 'payload'

import { Authors } from './Authors'
import { Categories } from './Categories'
import { ContactSubmissions } from './ContactSubmissions'
import { InlineImages } from './InlineImages'
import { Links } from './Links'
import { Media } from './Media'
import { Pages } from './Pages'
import { Posts } from './Posts'
import { Projects } from './Projects'
import { Tags } from './Tags'
import { Things } from './Things'
import { Users } from './Users'
import { Videos } from './Videos'

/**
 * Collection registration order.
 * Auth collection first, then media, then content dependencies.
 * InlineImages after Media so the dedicated Hero picker resolves first.
 */
export const collections: CollectionConfig[] = [
  Users,
  Media,
  InlineImages,
  Authors,
  Categories,
  Tags,
  Posts,
  Projects,
  Things,
  Videos,
  Pages,
  Links,
  ContactSubmissions,
]
