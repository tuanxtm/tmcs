import 'dotenv/config'
import { getPayload } from 'payload'

import config from '@payload-config'
import { seedLinkLibrary } from './seed-links'

async function repair() {
  const payload = await getPayload({ config })
  const pages = {} as Record<'about' | 'projects' | 'posts', number>
  for (const slug of ['about', 'projects', 'posts'] as const) {
    const result = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      locale: 'en',
      fallbackLocale: false,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    if (!result.docs[0]) throw new Error(`Missing seed page: ${slug}`)
    pages[slug] = result.docs[0].id
  }

  await seedLinkLibrary(payload, pages)
  console.log('Seed links repaired. Both locales now share each seed Link ID.')
}

repair()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed link repair failed:', error)
    process.exit(1)
  })
