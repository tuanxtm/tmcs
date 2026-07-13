/**
 * Idempotent development seed.
 *
 * Usage:
 *   bun run seed
 *
 * Requires SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (and optional manager/creator).
 * Never embeds passwords. Safe to re-run — upserts by stable keys.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '@payload-config'

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing ${name}. Set it in .env before seeding.`)
  }
  return value
}

const optionalEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim()
  return value || undefined
}

async function upsertUser(
  payload: Payload,
  data: {
    email: string
    password: string
    name: string
    role: 'admin' | 'manager' | 'creator'
  },
) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: data.email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    return payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: {
        name: data.name,
        role: data.role,
        active: true,
        password: data.password,
      },
      overrideAccess: true,
    })
  }

  return payload.create({
    collection: 'users',
    data: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role,
      active: true,
    },
    overrideAccess: true,
  })
}

async function upsertBySlug(
  payload: Payload,
  collection: 'categories' | 'tags' | 'posts' | 'projects' | 'pages',
  slug: string,
  data: Record<string, unknown>,
  locale: 'en' | 'vi' = 'en',
) {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    return payload.update({
      collection,
      id: existing.docs[0].id,
      data: data as never,
      locale,
      overrideAccess: true,
    })
  }

  return payload.create({
    collection,
    data: { ...data, slug } as never,
    locale,
    overrideAccess: true,
  })
}

async function seed() {
  const payload = await getPayload({ config })

  const admin = await upsertUser(payload, {
    email: requireEnv('SEED_ADMIN_EMAIL'),
    password: requireEnv('SEED_ADMIN_PASSWORD'),
    name: optionalEnv('SEED_ADMIN_NAME') || 'Site Admin',
    role: 'admin',
  })

  const managerPassword = optionalEnv('SEED_MANAGER_PASSWORD')
  const managerEmail = optionalEnv('SEED_MANAGER_EMAIL')
  if (managerEmail && managerPassword) {
    await upsertUser(payload, {
      email: managerEmail,
      password: managerPassword,
      name: optionalEnv('SEED_MANAGER_NAME') || 'Site Manager',
      role: 'manager',
    })
  }

  const creatorPassword = optionalEnv('SEED_CREATOR_PASSWORD')
  const creatorEmail = optionalEnv('SEED_CREATOR_EMAIL')
  let creator = null as Awaited<ReturnType<typeof upsertUser>> | null
  if (creatorEmail && creatorPassword) {
    creator = await upsertUser(payload, {
      email: creatorEmail,
      password: creatorPassword,
      name: optionalEnv('SEED_CREATOR_NAME') || 'Site Creator',
      role: 'creator',
    })
  }

  // Author profile for admin
  const authorExisting = await payload.find({
    collection: 'authors',
    where: { user: { equals: admin.id } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const author =
    authorExisting.docs[0] ||
    (await payload.create({
      collection: 'authors',
      data: {
        displayName: optionalEnv('SEED_ADMIN_NAME') || 'Site Admin',
        jobTitle: 'Software Engineer',
        bio: 'Seed author profile for local development.',
        user: admin.id,
        approved: true,
      },
      locale: 'en',
      overrideAccess: true,
    }))

  await payload.update({
    collection: 'authors',
    id: author.id,
    data: {
      displayName: 'Quản trị viên trang',
      jobTitle: 'Kỹ sư phần mềm',
      bio: 'Hồ sơ tác giả mẫu cho môi trường phát triển.',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  const category = await upsertBySlug(payload, 'categories', 'engineering', {
    title: 'Engineering',
    description: 'Seed category — engineering topics.',
    order: 1,
  })
  await payload.update({
    collection: 'categories',
    id: category.id,
    data: {
      title: 'Kỹ thuật',
      description: 'Danh mục mẫu — chủ đề kỹ thuật.',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  const tag = await upsertBySlug(payload, 'tags', 'payload', {
    title: 'Payload',
    description: 'Seed tag for Payload CMS.',
  })
  await payload.update({
    collection: 'tags',
    id: tag.id,
    data: {
      title: 'Payload',
      description: 'Thẻ mẫu cho Payload CMS.',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'TMCS Portfolio',
      tagline: 'Portfolio, blog, and projects',
      description: 'Seed site settings for local development.',
      siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      contactEmail: requireEnv('SEED_ADMIN_EMAIL'),
      robots: { indexSite: false },
    },
    locale: 'en',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'TMCS Portfolio',
      tagline: 'Portfolio, blog và dự án',
      description: 'Cài đặt trang mẫu cho môi trường phát triển.',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroHeading: 'Hello — this is my portfolio',
      heroSubheading: 'Seed homepage content. Replace before production.',
      profileSummary: 'Developer building with Payload and Next.js.',
    },
    locale: 'en',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroHeading: 'Xin chào — đây là portfolio của tôi',
      heroSubheading: 'Nội dung trang chủ mẫu. Thay thế trước khi lên production.',
      profileSummary: 'Lập trình viên xây dựng với Payload và Next.js.',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  const publishedPost = await upsertBySlug(payload, 'posts', 'hello-world', {
    title: 'Hello World',
    excerpt: 'A seeded published post.',
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'This is a seeded published blog post.', version: 1 }],
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    author: author.id,
    owner: admin.id,
    categories: [category.id],
    tags: [tag.id],
    featured: true,
    _status: 'published',
    publishedAt: new Date().toISOString(),
    translationReady: { vi: true },
  })

  await payload.update({
    collection: 'posts',
    id: publishedPost.id,
    data: {
      title: 'Xin chào thế giới',
      excerpt: 'Bài viết đã xuất bản (seed).',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', text: 'Đây là bài blog mẫu đã xuất bản.', version: 1 }],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await upsertBySlug(payload, 'posts', 'draft-notes', {
    title: 'Draft Notes',
    excerpt: 'A seeded draft post.',
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'This draft should not be public.', version: 1 }],
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    author: author.id,
    owner: creator?.id || admin.id,
    _status: 'draft',
  })

  const publishedProject = await upsertBySlug(payload, 'projects', 'sample-project', {
    title: 'Sample Project',
    summary: 'A seeded published project case study.',
    challenge: 'Demonstrate the Projects collection.',
    solution: 'Ship a bilingual seed document.',
    outcome: 'Editors can explore Admin with real data.',
    author: author.id,
    owner: admin.id,
    projectStatus: 'completed',
    featured: true,
    order: 1,
    _status: 'published',
    publishedAt: new Date().toISOString(),
  })

  await payload.update({
    collection: 'projects',
    id: publishedProject.id,
    data: {
      title: 'Dự án mẫu',
      summary: 'Case study dự án mẫu đã xuất bản.',
      challenge: 'Minh họa collection Projects.',
      solution: 'Tạo tài liệu seed song ngữ.',
      outcome: 'Biên tập viên có dữ liệu thật trên Admin.',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await upsertBySlug(payload, 'projects', 'draft-project', {
    title: 'Draft Project',
    summary: 'A seeded draft project.',
    owner: creator?.id || admin.id,
    projectStatus: 'in-progress',
    _status: 'draft',
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      featuredProjects: [publishedProject.id],
      featuredPosts: [publishedPost.id],
    },
    locale: 'en',
    overrideAccess: true,
  })

  await upsertBySlug(payload, 'pages', 'about', {
    title: 'About',
    summary: 'Seed about page.',
    template: 'about',
    layout: [
      {
        blockType: 'richText',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'About page seeded content.', version: 1 }],
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    ],
    _status: 'published',
    publishedAt: new Date().toISOString(),
  })

  const portfolioPage = await upsertBySlug(payload, 'pages', 'portfolio', {
    title: 'Portfolio',
    summary: 'Projects and selected work.',
    template: 'generic',
    layout: [
      {
        blockType: 'richText',
        content: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    text: 'Selected projects and case studies. Edit this page in Admin to update portfolio copy.',
                    version: 1,
                  },
                ],
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
      {
        blockType: 'projectsGrid',
        heading: 'Featured projects',
        items: [publishedProject.id],
        featuredOnly: false,
      },
    ],
    _status: 'published',
    publishedAt: new Date().toISOString(),
    translationReady: { vi: true },
  })

  await payload.update({
    collection: 'pages',
    id: portfolioPage.id,
    data: {
      title: 'Portfolio',
      summary: 'Dự án và công việc đã chọn.',
      layout: [
        {
          blockType: 'richText',
          content: {
            root: {
              type: 'root',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      type: 'text',
                      text: 'Các dự án và case study đã chọn. Chỉnh sửa trang này trong Admin để cập nhật nội dung portfolio.',
                      version: 1,
                    },
                  ],
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
        },
        {
          blockType: 'projectsGrid',
          heading: 'Dự án nổi bật',
          items: [publishedProject.id],
          featuredOnly: false,
        },
      ],
    },
    locale: 'vi',
    overrideAccess: true,
  })

  console.log('Seed complete.')
  console.log(`- Admin: ${admin.email}`)
  if (managerEmail) console.log(`- Manager: ${managerEmail}`)
  if (creatorEmail) console.log(`- Creator: ${creatorEmail}`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
