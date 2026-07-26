import type { GlobalConfig } from 'payload'

import { Footer } from './Footer'
import { Frontpage } from './Frontpage'
import { Navigation } from './Navigation'
import { SiteSettings } from './SiteSettings'

export const globals: GlobalConfig[] = [SiteSettings, Navigation, Footer, Frontpage]
