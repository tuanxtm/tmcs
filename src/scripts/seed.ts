/**
 * Idempotent development seed.
 *
 * Usage:
 *   bun run seed
 *
 * Local-only credentials are baked in below (see SEED_USERS).
 * Override by editing this file or extending it with env reads if needed.
 * Never use these credentials in production. Safe to re-run - upserts by stable keys.
 */

import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '@payload-config'

type Locale = 'en' | 'vi'
type SeedRole = 'admin' | 'manager' | 'creator'

const SEED_USERS: ReadonlyArray<{
  email: string
  password: string
  name: string
  role: SeedRole
}> = [
  { email: 'admin@example.com', password: 'admin', name: 'Site Admin', role: 'admin' },
  { email: 'manager@example.com', password: 'admin', name: 'Site Manager', role: 'manager' },
  { email: 'creator@example.com', password: 'admin', name: 'Site Creator', role: 'creator' },
] as const

const ADMIN_EMAIL = SEED_USERS.find((u) => u.role === 'admin')!.email

/**
 * Source-of-truth list of WebP images under src/assets/images/.
 * Stable alphabetical order; the 21 entries are distributed across posts,
 * projects, things, and videos in their respective loops.
 */
const NEW_IMAGE_FILES = [
  'beam_1x1.webp',
  'beam_7x5.webp',
  'com_9x16.webp',
  'com_16x9.webp',
  'dune_1x2.webp',
  'dune_9x16.webp',
  'forest_1x1.webp',
  'forest_2x1.webp',
  'forest_16x9.webp',
  'grass_3x4.webp',
  'grass_16x9.webp',
  'leaf_4x3.webp',
  'leaf_5x4.webp',
  'night_2x3.webp',
  'night_5x7.webp',
  'orange_3x4.webp',
  'orange_16x9.webp',
  'purple_4x5.webp',
  'purple_9x16.webp',
  'wave_5x4.webp',
  'wave_7x5.webp',
] as const

function richText(...paragraphs: string[]) {
  return {
    root: {
      type: 'root' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph' as const,
        children: [{ type: 'text' as const, text, version: 1 as const }],
        version: 1 as const,
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1 as const,
    },
  }
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
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

async function upsertPackBySlug(
  payload: Payload,
  slug: string,
  data: { title: string },
): Promise<{ id: number }> {
  const existing = await payload.find({
    collection: 'decoration-packs',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: 'decoration-packs',
      id: existing.docs[0].id,
      data: { title: data.title },
      overrideAccess: true,
    })
    return { id: updated.id }
  }

  const created = await payload.create({
    collection: 'decoration-packs',
    data: { slug, title: data.title },
    overrideAccess: true,
  })
  return { id: created.id }
}

async function upsertBySlug(
  payload: Payload,
  collection: 'categories' | 'tags' | 'posts' | 'projects' | 'pages',
  slug: string,
  data: Record<string, unknown>,
  locale: Locale = 'en',
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

async function upsertShortStory(
  payload: Payload,
  seedKey: string,
  en: {
    title: string
    text: string
    variant: 'note' | 'quote' | 'image'
  },
  vi: { title: string; text: string },
  ownerId: number,
) {
  const existing = await payload.find({
    collection: 'short-stories',
    where: { title: { equals: en.title } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const base = {
    title: en.title,
    variant: en.variant,
    content: richText(en.text),
    owner: ownerId,
    _status: 'published' as const,
    publishedAt: daysAgo(Number(seedKey.replace(/\D/g, '')) || 1),
    translationReady: { vi: true },
  }

  const doc =
    existing.docs[0] ||
    (await payload.create({
      collection: 'short-stories',
      data: base,
      overrideAccess: true,
    }))

  if (existing.docs[0]) {
    await payload.update({
      collection: 'short-stories',
      id: doc.id,
      data: base,
      overrideAccess: true,
    })
  }

  await payload.update({
    collection: 'short-stories',
    id: doc.id,
    data: {
      title: vi.title,
      content: richText(vi.text),
    },
    locale: 'vi',
    overrideAccess: true,
  })

  return doc
}

async function upsertSeedMedia(payload: Payload, filename: string, alt: string): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (existing.docs[0]) return existing.docs[0].id

  const localPath = path.join(process.cwd(), 'src/assets/images', filename)
  const buffer = await readFile(localPath)
  const bytes = new Uint8Array(buffer)

  const created = await payload.create({
    collection: 'media',
    data: {
      alt,
      kind: 'image',
    },
    file: {
      data: bytes as unknown as Buffer,
      mimetype: 'image/webp',
      name: filename,
      size: bytes.byteLength,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  return created.id
}

/**
 * Delete every document in `collection` whose natural key is not in the
 * supplied `keepKeys`. The local D1 accumulates leftover rows from previous
 * seeds and integration tests; without this sweep those rows sort ahead of
 * the seed content (because their `publishedAt` is more recent) and the
 * frontend feeds end up rendering blank `featuredImage` slots.
 *
 * The function reads each kept key into the collection's native lookup field
 * (`slug` for posts/projects, `name` for things, `title` for videos) and
 * dispatches a single `deleteByID` for each row that doesn't match.
 */
async function deleteNonSeedRows<TKey extends string>(args: {
  payload: Payload
  collection: 'posts' | 'projects' | 'things' | 'videos'
  keyField: 'slug' | 'name' | 'title'
  keepKeys: readonly TKey[]
  label: string
}): Promise<number> {
  const keepSet = new Set<string>(args.keepKeys.map((k) => k.toLowerCase()))
  const result = await args.payload.find({
    collection: args.collection,
    limit: 1000,
    depth: 0,
    overrideAccess: true,
    select: { id: true, slug: true, name: true, title: true } as Record<string, true>,
  })

  let removed = 0
  for (const doc of result.docs) {
    const keyRaw = (doc as { slug?: string; name?: string; title?: string })[args.keyField]
    const key = typeof keyRaw === 'string' ? keyRaw.toLowerCase() : null
    if (key && keepSet.has(key)) continue
    await args.payload.delete({
      collection: args.collection,
      id: (doc as { id: number }).id,
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    removed += 1
  }

  if (removed > 0) {
    console.log(`- Cleaned ${removed} non-seed ${args.label} row(s)`)
  }
  return removed
}

async function upsertThingByName(
  payload: Payload,
  en: {
    name: string
    description: string
    links: ReadonlyArray<{ label: string; url: string }>
    featured?: boolean
  },
  vi: {
    name: string
    description: string
  },
  images: { primary: number; detail?: number },
  ownerId: number,
  days: number,
) {
  const existing = await payload.find({
    collection: 'things',
    where: { name: { equals: en.name } },
    limit: 1,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })

  const base = {
    name: en.name,
    description: en.description,
    primaryImage: images.primary,
    detailImage: images.detail ?? images.primary,
    links: en.links,
    featured: Boolean(en.featured),
    owner: ownerId,
    _status: 'published' as const,
    publishedAt: daysAgo(days),
    translationReady: { vi: true },
  }

  const doc =
    existing.docs[0] ||
    (await payload.create({
      collection: 'things',
      data: base as never,
      locale: 'en',
      overrideAccess: true,
    }))

  if (existing.docs[0]) {
    await payload.update({
      collection: 'things',
      id: doc.id,
      data: base as never,
      locale: 'en',
      overrideAccess: true,
    })
  }

  await payload.update({
    collection: 'things',
    id: doc.id,
    data: {
      name: vi.name,
      description: vi.description,
    } as never,
    locale: 'vi',
    overrideAccess: true,
  })

  return doc
}

async function upsertVideoByTitle(
  payload: Payload,
  en: {
    title: string
    provider: 'youtube' | 'tiktok' | 'instagram' | 'other'
    sourceUrl: string
    featured?: boolean
  },
  vi: { title: string },
  thumbnailId: number,
  ownerId: number,
  days: number,
) {
  const existing = await payload.find({
    collection: 'videos',
    where: { title: { equals: en.title } },
    limit: 1,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })

  const base = {
    title: en.title,
    provider: en.provider,
    sourceUrl: en.sourceUrl,
    thumbnail: thumbnailId,
    featured: Boolean(en.featured),
    owner: ownerId,
    _status: 'published' as const,
    publishedAt: daysAgo(days),
    translationReady: { vi: true },
  }

  const doc =
    existing.docs[0] ||
    (await payload.create({
      collection: 'videos',
      data: base as never,
      locale: 'en',
      overrideAccess: true,
      // Skip network thumbnail fetch during seed - we supply Media explicitly.
      context: { youtubeThumbAttempted: true, disableRevalidate: true },
    }))

  if (existing.docs[0]) {
    await payload.update({
      collection: 'videos',
      id: doc.id,
      data: base as never,
      locale: 'en',
      overrideAccess: true,
      context: { youtubeThumbAttempted: true, disableRevalidate: true },
    })
  }

  await payload.update({
    collection: 'videos',
    id: doc.id,
    data: { title: vi.title } as never,
    locale: 'vi',
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  return doc
}

// ---------------------------------------------------------------------------
// Seed content - DIY projects, tech workspace, maker culture
// ---------------------------------------------------------------------------

const CATEGORY_SEEDS = [
  {
    slug: 'diy-projects',
    en: {
      title: 'DIY Projects',
      description: 'Hands-on builds, repairs, and weekend experiments.',
    },
    vi: {
      title: 'Dự án DIY',
      description: 'Các bản build thực hành, sửa chữa và thử nghiệm cuối tuần.',
    },
  },
  {
    slug: 'tech-workspace',
    en: {
      title: 'Tech Workspace',
      description: 'Desk setups, ergonomics, and studio organization.',
    },
    vi: {
      title: 'Không gian làm việc',
      description: 'Bàn làm việc, công thái học và tổ chức studio.',
    },
  },
  {
    slug: 'electronics',
    en: { title: 'Electronics', description: 'Circuits, microcontrollers, and soldering notes.' },
    vi: { title: 'Điện tử', description: 'Mạch điện, vi điều khiển và ghi chú hàn.' },
  },
  {
    slug: 'woodworking',
    en: { title: 'Woodworking', description: 'Joinery, jigs, and furniture for the shop.' },
    vi: { title: 'Mộc', description: 'Liên kết gỗ, đồ gá và nội thất cho xưởng.' },
  },
  {
    slug: '3d-printing',
    en: { title: '3D Printing', description: 'Filament tuning, enclosures, and printable tools.' },
    vi: { title: 'In 3D', description: 'Chỉnh filament, vỏ bọc và dụng cụ in được.' },
  },
  {
    slug: 'smart-home',
    en: { title: 'Smart Home', description: 'Sensors, automations, and local-first gadgets.' },
    vi: {
      title: 'Nhà thông minh',
      description: 'Cảm biến, tự động hóa và thiết bị ưu tiên local.',
    },
  },
] as const

const TAG_SEEDS = [
  { slug: 'arduino', en: 'Arduino', vi: 'Arduino' },
  { slug: 'raspberry-pi', en: 'Raspberry Pi', vi: 'Raspberry Pi' },
  { slug: 'cnc', en: 'CNC', vi: 'CNC' },
  { slug: 'soldering', en: 'Soldering', vi: 'Hàn mạch' },
  { slug: 'cable-management', en: 'Cable Management', vi: 'Quản lý dây cáp' },
  { slug: 'desk-setup', en: 'Desk Setup', vi: 'Setup bàn làm việc' },
  { slug: 'open-source', en: 'Open Source', vi: 'Mã nguồn mở' },
  { slug: 'home-lab', en: 'Home Lab', vi: 'Home lab' },
  { slug: 'cad', en: 'CAD', vi: 'CAD' },
  { slug: 'wifi', en: 'Wi-Fi', vi: 'Wi-Fi' },
] as const

const AUTHOR_SEEDS = [
  {
    key: 'admin',
    en: {
      displayName: 'Minh Tran',
      jobTitle: 'Full-stack maker',
      bio: 'Builds software by day and workbench projects by night. Documents the messy middle.',
    },
    vi: {
      displayName: 'Minh Trần',
      jobTitle: 'Maker full-stack',
      bio: 'Làm phần mềm ban ngày, dự án bàn thợ ban đêm. Ghi lại phần giữa chừng.',
    },
    linkUser: true,
  },
  {
    key: 'linh',
    en: {
      displayName: 'Linh Nguyen',
      jobTitle: 'Electronics hobbyist',
      bio: 'Specializes in sensor networks, perfboard layouts, and tidy power distribution.',
    },
    vi: {
      displayName: 'Linh Nguyễn',
      jobTitle: 'Người đam mê điện tử',
      bio: 'Chuyên mạng cảm biến, layout perfboard và phân phối nguồn gọn gàng.',
    },
    linkUser: false,
  },
  {
    key: 'khoa',
    en: {
      displayName: 'Khoa Pham',
      jobTitle: 'Woodshop tinkerer',
      bio: 'Designs modular storage, shop jigs, and hybrid wood + metal fixtures.',
    },
    vi: {
      displayName: 'Khoa Phạm',
      jobTitle: 'Thợ mộc tự học',
      bio: 'Thiết kế kệ module, đồ gá xưởng và chi tiết gỗ + kim loại.',
    },
    linkUser: false,
  },
  {
    key: 'hana',
    en: {
      displayName: 'Hana Le',
      jobTitle: '3D print engineer',
      bio: 'Tunes printers, prints enclosures, and prototypes mounting systems.',
    },
    vi: {
      displayName: 'Hana Lê',
      jobTitle: 'Kỹ sư in 3D',
      bio: 'Chỉnh máy in, in vỏ bọc và thử nghiệm hệ gá lắp.',
    },
    linkUser: false,
  },
  {
    key: 'duc',
    en: {
      displayName: 'Duc Vo',
      jobTitle: 'Home lab architect',
      bio: 'Runs a small homelab, documents rack cooling, and self-hosted services.',
    },
    vi: {
      displayName: 'Đức Võ',
      jobTitle: 'Kiến trúc sư homelab',
      bio: 'Vận hành homelab nhỏ, ghi chú làm mát rack và dịch vụ self-host.',
    },
    linkUser: false,
  },
] as const

// 21 published projects. Topics rotate across tech, science, DIY, and generic
// maker subjects. Each project gets a hand-translated Vietnamese title/summary.
const PROJECT_SEEDS = [
  {
    slug: 'modular-workbench',
    en: {
      title: 'Modular Workbench System',
      summary: 'A t-track workbench with interchangeable fixtures for electronics and woodworking.',
    },
    vi: {
      title: 'Hệ bàn thợ module',
      summary: 'Bàn t-track với đồ gá thay đổi cho điện tử và mộc.',
    },
    featured: true,
    authorKey: 'hana' as const,
  },
  {
    slug: 'desk-power-rail',
    en: {
      title: 'Desk Power Rail',
      summary: 'Under-desk USB-C and AC distribution with fused branches for a clean cable path.',
    },
    vi: {
      title: 'Thanh nguồn bàn làm việc',
      summary: 'Phân phối USB-C và AC dưới bàn với nhánh có cầu chì.',
    },
    featured: false,
    authorKey: 'khoa' as const,
  },
  {
    slug: 'sensor-planter',
    en: {
      title: 'Sensor Planter',
      summary: 'ESP32 planter monitoring soil moisture, light, and ambient temperature.',
    },
    vi: {
      title: 'Chậu cảm biến',
      summary: 'Chậu ESP32 theo dõi độ ẩm đất, ánh sáng và nhiệt độ.',
    },
    featured: false,
    authorKey: 'hana' as const,
  },
  {
    slug: 'print-farm-enclosure',
    en: {
      title: 'Print Farm Enclosure',
      summary: 'Stacked printer enclosure with filtered exhaust and vibration isolation.',
    },
    vi: {
      title: 'Vỏ farm in 3D',
      summary: 'Vỏ máy in xếp chồng có lọc khí thải và cách rung.',
    },
    featured: false,
    authorKey: 'khoa' as const,
  },
  {
    slug: 'homelab-rack',
    en: {
      title: 'Homelab Rack',
      summary: '12U rolling rack with cable comb, PDU labeling, and hot-aisle airflow notes.',
    },
    vi: {
      title: 'Rack homelab',
      summary: 'Rack 12U có lược dây, nhãn PDU và ghi chú luồng khí.',
    },
    featured: true,
    authorKey: 'duc' as const,
  },
  {
    slug: 'solder-fume-extractor',
    en: {
      title: 'Solder Fume Extractor',
      summary: 'Carbon-filtered extractor with a quiet fan and a baffle for late-night work.',
    },
    vi: {
      title: 'Hút khói hàn',
      summary: 'Hút khói lọc carbon, quạt êm và vách ngăn cho hàn khuya.',
    },
    featured: false,
    authorKey: 'linh' as const,
  },
  {
    slug: 'spectrometer-starter',
    en: {
      title: 'Pocket Spectrometer',
      summary: 'A diffraction-grill spectrometer built around a cheap camera sensor and a DVD.',
    },
    vi: {
      title: 'Máy quang phổ bỏ túi',
      summary: 'Máy quang phổ cách tử quanh cảm biến camera rẻ và đĩa DVD.',
    },
    featured: true,
    authorKey: 'linh' as const,
  },
  {
    slug: 'museum-night-lamp',
    en: {
      title: 'Museum Night Lamp',
      summary: 'A faux-antique brass lamp with a warm dimmable LED and a brass-thread shade.',
    },
    vi: {
      title: 'Đèn bàn đêm',
      summary: 'Đèn đồng giả cổ với LED ấm dim được và chao ren đồng.',
    },
    featured: false,
    authorKey: 'khoa' as const,
  },
  {
    slug: 'garden-soil-sensor',
    en: {
      title: 'Garden Soil Sensor',
      summary: 'A solar-powered LoRa sensor broadcasting soil moisture for an entire raised bed.',
    },
    vi: {
      title: 'Cảm biến đất vườn',
      summary: 'Cảm biến LoRa năng lượng mặt trời phát độ ẩm cả luống nổi.',
    },
    featured: false,
    authorKey: 'hana' as const,
  },
  {
    slug: 'paper-aircraft-launcher',
    en: {
      title: 'Paper Aircraft Launcher',
      summary: 'A catapult-and-rig that pops a paper plane at a precise angle for physics demos.',
    },
    vi: {
      title: 'Bệ phóng máy bay giấy',
      summary: 'Cung và giá bắn máy bay giấy góc chính xác cho demo vật lý.',
    },
    featured: false,
    authorKey: 'admin' as const,
  },
  {
    slug: 'kitchen-ferment-fridge',
    en: {
      title: 'Fermentation Fridge',
      summary: 'A repurposed beverage fridge with a PID controller for kimchi and kombucha.',
    },
    vi: {
      title: 'Tủ lên men',
      summary: 'Tủ đồ uống tận dụng với PID điều khiển cho kimchi và kombucha.',
    },
    featured: true,
    authorKey: 'admin' as const,
  },
  {
    slug: 'mini-split-stand',
    en: {
      title: 'Mini Split Stand',
      summary: 'A welded steel stand for a garage mini-split that absorbs vibration and levels.',
    },
    vi: {
      title: 'Giá đỡ mini split',
      summary: 'Giá thép hàn cho điều hòa mini trong gara, giảm rung và cân bằng.',
    },
    featured: false,
    authorKey: 'khoa' as const,
  },
  {
    slug: 'telescope-tracker',
    en: {
      title: 'Telescope Tracker',
      summary: 'A 3D-printed barn-door tracker for wide-field astrophotography on a tripod.',
    },
    vi: {
      title: 'Theo dõi kính thiên văn',
      summary: 'Bộ theo dõi cửa chuồng in 3D chụp trường rộng trên chân máy.',
    },
    featured: false,
    authorKey: 'linh' as const,
  },
  {
    slug: 'cable-test-jig',
    en: {
      title: 'Cable Test Jig',
      summary: 'A continuity jig that lights up each conductor on a multi-pin cable at once.',
    },
    vi: {
      title: 'Đồ gá test cáp',
      summary: 'Đồ gá đo thông mạch bật sáng từng chân cáp nhiều chân cùng lúc.',
    },
    featured: false,
    authorKey: 'linh' as const,
  },
  {
    slug: 'reading-easel',
    en: {
      title: 'Reading Easel',
      summary: 'A folding easel that holds a cookbook or a tablet at a comfortable kitchen angle.',
    },
    vi: {
      title: 'Giá đọc bếp',
      summary: 'Giá xếp giữ sách nấu ăn hoặc tablet ở góc bếp thoải mái.',
    },
    featured: false,
    authorKey: 'khoa' as const,
  },
  {
    slug: 'wifi-heatmap-board',
    en: {
      title: 'Wi-Fi Heatmap Board',
      summary: 'A wall-mounted LED grid that maps home Wi-Fi signal strength in real time.',
    },
    vi: {
      title: 'Bản đồ nhiệt Wi-Fi',
      summary: 'Lưới LED treo tường hiển thị cường độ Wi-Fi nhà theo thời gian thực.',
    },
    featured: false,
    authorKey: 'duc' as const,
  },
  {
    slug: 'audio-splitter',
    en: {
      title: 'Audio Splitter Box',
      summary: 'A passive XLR/TRS splitter for streaming two sources into one recorder.',
    },
    vi: {
      title: 'Hộp chia âm thanh',
      summary: 'Hộp chia XLR/TRS thụ động để stream hai nguồn vào một máy ghi.',
    },
    featured: false,
    authorKey: 'admin' as const,
  },
  {
    slug: 'plant-press',
    en: {
      title: 'Plant Press Kit',
      summary: 'A wooden press with corrugated cardboard for field botany and herbarium samples.',
    },
    vi: {
      title: 'Bộ ép cây',
      summary: 'Bộ ép gỗ với carton sóng cho thực vật thực địa và mẫu herbarium.',
    },
    featured: false,
    authorKey: 'khoa' as const,
  },
  {
    slug: 'sensor-helmet',
    en: {
      title: 'Sensor Helmet',
      summary: 'A hard-hat mounted IMU and GPS logger for tracking a long hike or rides.',
    },
    vi: {
      title: 'Mũ cảm biến',
      summary: 'IMU và GPS gắn mũ bảo hộ ghi nhật ký đi bộ đường dài hoặc đạp xe.',
    },
    featured: true,
    authorKey: 'duc' as const,
  },
  {
    slug: 'lego-sorter',
    en: {
      title: 'Lego Sorter',
      summary: 'A small conveyor-driven sorter that picks Lego bricks by color with a camera.',
    },
    vi: {
      title: 'Máy phân loại Lego',
      summary: 'Băng tải nhỏ phân loại gạch Lego theo màu bằng camera.',
    },
    featured: false,
    authorKey: 'hana' as const,
  },
  {
    slug: 'infinity-mirror',
    en: {
      title: 'Infinity Mirror Table',
      summary: 'A coffee table with a one-way mirror, an LED ring, and a hidden IR sensor.',
    },
    vi: {
      title: 'Bàn gương vô cực',
      summary: 'Bàn café với gương một chiều, vòng LED và cảm biến hồng ngoại ẩn.',
    },
    featured: false,
    authorKey: 'admin' as const,
  },
] as const

// 21 published posts. Topics rotate across tech, science, DIY, and generic
// maker subjects so the seed exercises a real variety of content.
const POST_TITLES = [
  'First cuts on the modular bench',
  'A simple pendulum lab for the kitchen table',
  'Why we still use a logic analyzer in 2025',
  'Soldering a sensor breakout without lifting pads',
  'Why I moved the homelab off the shelf',
  'Designing t-track inserts for small parts',
  'Quick glucose estimation from a finger-prick DIY kit',
  'A quiet fan curve for printer enclosures',
  'Measuring desk glare before buying a lamp',
  'Perfboard layout for a weekend ESP32 node',
  'How salty is your soup? A conductivity experiment',
  'Designing a no-code probe for soil sensors',
  'Dry box humidity targets for PLA and PETG',
  'Calibrating a soil sensor in real pots',
  'A minimal tool wall above the bench',
  'Choosing bit sets for hybrid materials',
  'Documenting failures in the project log',
  'Filtering ABS without over-restricting flow',
  'A rolling cart for test equipment',
  'Power budgets for a small electronics bench',
  'Mounting a monitor arm on a thin desk',
] as const

const POST_TITLES_VI = [
  'Những vết cắt đầu tiên trên bàn module',
  'Phòng thí nghiệm con lắc đơn giản trên bàn bếp',
  'Vì sao năm 2025 ta vẫn dùng logic analyzer',
  'Hàn breakout cảm biến không bong pad',
  'Vì sao tôi chuyển homelab khỏi kệ',
  'Thiết kế insert t-track cho linh kiện nhỏ',
  'Ước lượng đường huyết nhanh từ bộ DIY lấy máu đầu ngón',
  'Đường cong quạt êm cho vỏ máy in',
  'Đo chói bàn trước khi mua đèn',
  'Layout perfboard cho node ESP32 cuối tuần',
  'Canh của bạn mặn cỡ nào? Thí nghiệm đo độ dẫn',
  'Thiết kế probe no-code cho cảm biến đất',
  'Mục tiêu độ ẩm hộp khô cho PLA và PETG',
  'Hiệu chuẩn cảm biến đất trong chậu thật',
  'Tường dụng cụ tối giản trên bàn',
  'Chọn bộ mũi khoan cho vật liệu lai',
  'Ghi thất bại trong nhật ký dự án',
  'Lọc ABS không hạn chế luồng quá mức',
  'Xe đẩy cho thiết bị đo',
  'Ngân sách nguồn cho bàn điện tử nhỏ',
  'Gá màn hình trên bàn mỏng',
] as const

const SHORT_STORY_SEEDS = [
  {
    key: 'ss01',
    en: {
      title: 'Measure twice',
      text: 'A quick note before cutting stock: mark, step back, mark again.',
      variant: 'note' as const,
    },
    vi: {
      title: 'Đo hai lần',
      text: 'Ghi chú nhanh trước khi cắt: đánh dấu, lùi lại, đánh dấu lại.',
    },
  },
  {
    key: 'ss02',
    en: {
      title: 'Bench rule',
      text: 'If it takes longer to find the tool than to use it, the tool needs a home.',
      variant: 'quote' as const,
    },
    vi: { title: 'Quy tắc bàn thợ', text: 'Nếu tìm dụng cụ lâu hơn dùng nó, dụng cụ cần một chỗ.' },
  },
  {
    key: 'ss03',
    en: {
      title: 'Spare ferrules',
      text: 'Keep three sizes in a labeled tin. Future-you is always soldering at 11pm.',
      variant: 'note' as const,
    },
    vi: {
      title: 'Đầu cosse dự phòng',
      text: 'Giữ ba cỡ trong hộp có nhãn. Bạn tương lai luôn hàn lúc 11 giờ tối.',
    },
  },
  {
    key: 'ss04',
    en: {
      title: 'Local first',
      text: 'Automate the plant sensor locally before exposing another cloud dashboard.',
      variant: 'quote' as const,
    },
    vi: {
      title: 'Local trước',
      text: 'Tự động hóa cảm biến cây local trước khi thêm dashboard cloud.',
    },
  },
  {
    key: 'ss05',
    en: {
      title: 'Filament note',
      text: 'Write the oven dry time on the spool. Memory is not a process.',
      variant: 'note' as const,
    },
    vi: {
      title: 'Ghi filament',
      text: 'Viết thời gian sấy lò lên cuộn. Trí nhớ không phải quy trình.',
    },
  },
  {
    key: 'ss06',
    en: {
      title: 'Rack mantra',
      text: 'Label the cable before you trust the service.',
      variant: 'quote' as const,
    },
    vi: { title: 'Câu rack', text: 'Dán nhãn dây trước khi tin dịch vụ.' },
  },
  {
    key: 'ss07',
    en: {
      title: 'Vent sketch',
      text: 'A napkin drawing of intake vs exhaust beats a perfect render that ships late.',
      variant: 'note' as const,
    },
    vi: { title: 'Phác thông gió', text: 'Vẽ giấy ăn hút/thổi tốt hơn render hoàn hảo trễ hạn.' },
  },
  {
    key: 'ss08',
    en: {
      title: 'Shop light',
      text: 'Cross-light the bench; kill the shadows on your smallest parts.',
      variant: 'note' as const,
    },
    vi: { title: 'Đèn xưởng', text: 'Chiếu chéo bàn; xóa bóng trên chi tiết nhỏ nhất.' },
  },
  {
    key: 'ss09',
    en: {
      title: 'Iteration',
      text: 'Version three is where the project finally tells you what it wants to be.',
      variant: 'quote' as const,
    },
    vi: { title: 'Lặp', text: 'Phiên bản ba là lúc dự án nói bạn nó muốn trở thành gì.' },
  },
  {
    key: 'ss10',
    en: {
      title: 'Ship the log',
      text: 'Publish the messy notes. Someone else is stuck on the same bench problem.',
      variant: 'note' as const,
    },
    vi: {
      title: 'Xuất nhật ký',
      text: 'Đăng ghi chú lộn xộn. Ai đó cũng kẹt cùng vấn đề bàn thợ.',
    },
  },
  {
    key: 'ss11',
    en: {
      title: 'Torque habit',
      text: 'Snug the screw, then stop. Stripped threads cost more time than caution.',
      variant: 'note' as const,
    },
    vi: {
      title: 'Thói quen siết',
      text: 'Vặn vừa khít rồi dừng. Ren hỏng tốn thời gian hơn cẩn thận.',
    },
  },
  {
    key: 'ss12',
    en: {
      title: 'Test clip',
      text: 'A labeled bag of clipped leads beats a drawer of mystery metal.',
      variant: 'quote' as const,
    },
    vi: {
      title: 'Túi chân cắt',
      text: 'Túi có nhãn đựng chân cắt tốt hơn ngăn kéo kim loại không rõ nguồn.',
    },
  },
  {
    key: 'ss13',
    en: {
      title: 'Flux reminder',
      text: 'Clean the joint before you blame the solder.',
      variant: 'note' as const,
    },
    vi: { title: 'Nhắc flux', text: 'Làm sạch mối hàn trước khi đổ lỗi cho thiếc.' },
  },
  {
    key: 'ss14',
    en: {
      title: 'Quiet hours',
      text: 'Schedule the loud prints for when neighbors are at work.',
      variant: 'quote' as const,
    },
    vi: { title: 'Giờ yên', text: 'Hẹn in ồn khi hàng xóm đi làm.' },
  },
  {
    key: 'ss15',
    en: {
      title: 'Backup bit',
      text: 'Keep a duplicate end mill one drawer down. Dull catches at the worst moment.',
      variant: 'note' as const,
    },
    vi: {
      title: 'Mũi dự phòng',
      text: 'Giữ mũi phay dự phòng một ngăn dưới. Cùn kẹt đúng lúc tệ nhất.',
    },
  },
  {
    key: 'ss16',
    en: {
      title: 'Ground loop',
      text: 'If the scope lies, check the ground before chasing ghosts in firmware.',
      variant: 'quote' as const,
    },
    vi: { title: 'Vòng mass', text: 'Nếu scope sai, kiểm tra mass trước khi truy firmware ma.' },
  },
  {
    key: 'ss17',
    en: {
      title: 'Dust pass',
      text: 'Vacuum the bench after sanding. Electronics and sawdust are not friends.',
      variant: 'note' as const,
    },
    vi: { title: 'Hút bụi', text: 'Hút bàn sau khi chà nhám. Điện tử và mùn cưa không phải bạn.' },
  },
  {
    key: 'ss18',
    en: {
      title: 'Spare USB',
      text: 'Label the data-only cables. Charging cables lie during flashing.',
      variant: 'note' as const,
    },
    vi: { title: 'USB dự phòng', text: 'Dán nhãn cáp chỉ data. Cáp sạc nói dối khi flash.' },
  },
  {
    key: 'ss19',
    en: {
      title: 'Scope budget',
      text: 'Buy the probe you will actually reach for, not the one that impresses on paper.',
      variant: 'quote' as const,
    },
    vi: {
      title: 'Ngân sách scope',
      text: 'Mua đầu dò bạn thực sự dùng, không phải cái ấn tượng trên giấy.',
    },
  },
  {
    key: 'ss20',
    en: {
      title: 'End of day',
      text: 'Power down the bench, cap the flux, and leave one note for morning-you.',
      variant: 'note' as const,
    },
    vi: { title: 'Cuối ngày', text: 'Tắt nguồn bàn, đậy flux, để một ghi chú cho bạn sáng mai.' },
  },
] as const

// 21 published things. Each Thing has one or two affiliate-style image slots.
// The first thing (index 0) intentionally uses the same media id for both
// primaryImage and detailImage, as requested.
const THING_SEEDS = [
  {
    en: {
      name: 'Soldering station',
      description: 'Temperature-controlled iron for nightly repairs.',
      featured: true,
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE1' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE1' },
        { label: 'Shopee', url: 'https://shopee.vn/soldering-station' },
      ],
    },
    vi: {
      name: 'Trạm hàn',
      description: 'Mỏ hàn chỉnh nhiệt cho sửa chữa ban đêm.',
    },
  },
  {
    en: {
      name: 'ESD mat',
      description: 'Grounded work surface for sensitive boards.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE2' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE2' },
        { label: 'Shopee', url: 'https://shopee.vn/esd-mat' },
      ],
    },
    vi: {
      name: 'Thảm ESD',
      description: 'Mặt bàn nối mass cho mạch nhạy cảm.',
    },
  },
  {
    en: {
      name: 'Helping hands',
      description: 'Third hand with magnifier for fine joints.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE3' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE3' },
        { label: 'Shopee', url: 'https://shopee.vn/helping-hands' },
      ],
    },
    vi: {
      name: 'Kẹp hỗ trợ',
      description: 'Tay thứ ba kèm kính lúp cho mối hàn nhỏ.',
    },
  },
  {
    en: {
      name: 'Digital calipers',
      description: '0.01 mm readings for enclosure fits.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE4' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE4' },
        { label: 'Shopee', url: 'https://shopee.vn/digital-calipers' },
      ],
    },
    vi: {
      name: 'Thước kẹp điện tử',
      description: 'Độ chính xác 0.01 mm cho khít vỏ.',
    },
  },
  {
    en: {
      name: 'Flush cutters',
      description: 'Clean lead trims without nicking pads.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLEA' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEA' },
        { label: 'Shopee', url: 'https://shopee.vn/flush-cutters' },
      ],
    },
    vi: {
      name: 'Kềm cắt chân',
      description: 'Cắt chân sạch không cạo pad.',
    },
  },
  {
    en: {
      name: 'Kapton tape',
      description: 'Heat-safe masking for rework.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE6' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE6' },
        { label: 'Shopee', url: 'https://shopee.vn/kapton-tape' },
      ],
    },
    vi: {
      name: 'Băng Kapton',
      description: 'Băng chịu nhiệt cho rework.',
    },
  },
  {
    en: {
      name: 'USB microscope',
      description: 'Inspect joints before powering up.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE7' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE7' },
        { label: 'Shopee', url: 'https://shopee.vn/usb-microscope' },
      ],
    },
    vi: {
      name: 'Kính hiển vi USB',
      description: 'Kiểm mối hàn trước khi cấp nguồn.',
    },
  },
  {
    en: {
      name: 'Bench PSU',
      description: 'Current-limited supply for first boots.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE8' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE8' },
        { label: 'Shopee', url: 'https://shopee.vn/bench-psu' },
      ],
    },
    vi: {
      name: 'Nguồn bàn',
      description: 'Nguồn giới hạn dòng cho lần boot đầu.',
    },
  },
  {
    en: {
      name: 'Logic analyzer',
      description: 'Capture I2C and UART when firmware ghosts appear.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLE9' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE9' },
        { label: 'Shopee', url: 'https://shopee.vn/logic-analyzer' },
      ],
    },
    vi: {
      name: 'Logic analyzer',
      description: 'Bắt I2C và UART khi firmware ma xuất hiện.',
    },
  },
  {
    en: {
      name: 'Wire strippers',
      description: 'Self-adjusting jaws for 30–10 AWG.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLEW' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEW' },
        { label: 'Shopee', url: 'https://shopee.vn/wire-strippers' },
      ],
    },
    vi: {
      name: 'Kìm tuốt dây',
      description: 'Hàm tự chỉnh cho 30–10 AWG.',
    },
  },
  {
    en: {
      name: 'Fume extractor',
      description: 'Carbon filter for late-night soldering.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLEF' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEF' },
        { label: 'Shopee', url: 'https://shopee.vn/fume-extractor' },
      ],
    },
    vi: {
      name: 'Hút khói',
      description: 'Lọc carbon cho hàn khuya.',
    },
  },
  {
    en: {
      name: 'Multimeter',
      description: 'True-RMS meter for AC and DC checks.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLEM' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEM' },
        { label: 'Shopee', url: 'https://shopee.vn/multimeter' },
      ],
    },
    vi: {
      name: 'Đồng hồ vạn năng',
      description: 'True-RMS cho kiểm AC và DC.',
    },
  },
  {
    en: {
      name: 'Hot air station',
      description: 'For QFN rework and heat-shrink.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLEH' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEH' },
        { label: 'Shopee', url: 'https://shopee.vn/hot-air' },
      ],
    },
    vi: {
      name: 'Trạm hơi nóng',
      description: 'Cho rework QFN và ống gen.',
    },
  },
  {
    en: {
      name: 'Parts organizer',
      description: 'Labeled bins so SMD resistors stay findable.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLEP' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEP' },
        { label: 'Shopee', url: 'https://shopee.vn/parts-organizer' },
      ],
    },
    vi: {
      name: 'Hộp linh kiện',
      description: 'Ngăn có nhãn để điện trở SMD luôn tìm được.',
    },
  },
  {
    en: {
      name: 'Raspberry Pi 5',
      description: 'Tiny single-board computer for homelab services.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPL15' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE15' },
        { label: 'Shopee', url: 'https://shopee.vn/raspberry-pi-5' },
      ],
    },
    vi: {
      name: 'Raspberry Pi 5',
      description: 'Máy tính nhúng nhỏ cho dịch vụ homelab.',
    },
  },
  {
    en: {
      name: 'Mesh router',
      description: 'Tri-band mesh for sane Wi-Fi across a small apartment.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLMR' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE1' },
        { label: 'Shopee', url: 'https://shopee.vn/mesh-router' },
      ],
    },
    vi: {
      name: 'Router mesh',
      description: 'Mesh ba băng tần cho Wi-Fi căn hộ nhỏ ổn định.',
    },
  },
  {
    en: {
      name: 'Bench grinder',
      description: 'Compact 8-inch grinder for reshaping tool bits.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLGR' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEG' },
        { label: 'Shopee', url: 'https://shopee.vn/bench-grinder' },
      ],
    },
    vi: {
      name: 'Máy mài bàn',
      description: 'Máy mài 8 inch gọn nhẹ để chỉnh lại mũi dụng cụ.',
    },
  },
  {
    en: {
      name: 'Filament dry box',
      description: 'Heated filament dry box with a humidity readout.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLEFB' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEFB' },
        { label: 'Shopee', url: 'https://shopee.vn/filament-dry-box' },
      ],
    },
    vi: {
      name: 'Hộp sấy filament',
      description: 'Hộp sấy filament có đo độ ẩm hiển thị.',
    },
  },
  {
    en: {
      name: 'Work gloves',
      description: 'Cut-resistant gloves for routing and soldering-adjacent work.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLWG' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEWG' },
        { label: 'Shopee', url: 'https://shopee.vn/work-gloves' },
      ],
    },
    vi: {
      name: 'Găng tay bảo hộ',
      description: 'Găng chống cắt cho phay và công việc cạnh hàn.',
    },
  },
  {
    en: {
      name: 'Camera microscope',
      description: 'A 4K HDMI camera microscope for fine inspection and soldering.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLCM' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLE1' },
        { label: 'Shopee', url: 'https://shopee.vn/camera-microscope' },
      ],
    },
    vi: {
      name: 'Kính hiển vi camera',
      description: 'Kính hiển vi HDMI 4K kiểm tra chi tiết và hàn mịn.',
    },
  },
  {
    en: {
      name: 'Headlamp',
      description: 'A rechargeable headlamp for dark corners and night-time soldering.',
      links: [
        { label: 'Amazon', url: 'https://www.amazon.com/dp/B08EXAMPLHL' },
        { label: 'AliExpress', url: 'https://www.aliexpress.com/item/100000EXAMPLEHL' },
        { label: 'Shopee', url: 'https://shopee.vn/headlamp' },
      ],
    },
    vi: {
      name: 'Đèn đeo đầu',
      description: 'Đèn đeo đầu sạc cho góc tối và hàn ban đêm.',
    },
  },
] as const

// 21 published videos. Provider mix: 7 YouTube, 7 TikTok, 7 Instagram.
// All URLs are synthetic placeholders that satisfy the validators.
const VIDEO_SEEDS = [
  {
    en: {
      title: 'Desk cable routing',
      provider: 'youtube' as const,
      sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      featured: true,
    },
    vi: { title: 'Đi dây bàn làm việc' },
  },
  {
    en: {
      title: 'Hot tip: flux before solder',
      provider: 'tiktok' as const,
      sourceUrl: 'https://www.tiktok.com/@tuantm/video/7123456789012345678',
    },
    vi: { title: 'Mẹo: flux trước khi hàn' },
  },
  {
    en: {
      title: 'Workshop reel - calipers',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/AbCdEfGhIjK/',
    },
    vi: { title: 'Reel xưởng - thước kẹp' },
  },
  {
    en: {
      title: 'Bench PSU first boot',
      provider: 'youtube' as const,
      sourceUrl: 'https://www.youtube.com/watch?v=Q59mkE9P3oA',
    },
    vi: { title: 'Boot đầu nguồn bàn' },
  },
  {
    en: {
      title: 'Bench layout refresh',
      provider: 'tiktok' as const,
      sourceUrl: 'https://www.tiktok.com/@tuantm/video/7111111111111111111',
    },
    vi: { title: 'Trùng tu bố cục bàn' },
  },
  {
    en: {
      title: 'Garden sensor install',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/CxYzAbCdEfG/',
    },
    vi: { title: 'Lắp cảm biến vườn' },
  },
  {
    en: {
      title: 'Filament dry box tour',
      provider: 'youtube' as const,
      sourceUrl: 'https://www.youtube.com/watch?v=ZxCv7NkLmPq',
    },
    vi: { title: 'Tour hộp sấy filament' },
  },
  {
    en: {
      title: 'Quick tip: tinning the tip',
      provider: 'tiktok' as const,
      sourceUrl: 'https://www.tiktok.com/@tuantm/video/7222222222222222222',
    },
    vi: { title: 'Mẹo nhanh: thiếc hóa đầu mỏ' },
  },
  {
    en: {
      title: 'Lego sorter preview',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/Lm9876HijKl/',
    },
    vi: { title: 'Xem trước máy phân loại Lego' },
  },
  {
    en: {
      title: 'Homelab rack follow-up',
      provider: 'youtube' as const,
      sourceUrl: 'https://www.youtube.com/watch?v=H8aBcDeFgHi',
    },
    vi: { title: 'Cập nhật rack homelab' },
  },
  {
    en: {
      title: 'Sensor planter update',
      provider: 'tiktok' as const,
      sourceUrl: 'https://www.tiktok.com/@tuantm/video/7333333333333333333',
    },
    vi: { title: 'Cập nhật chậu cảm biến' },
  },
  {
    en: {
      title: 'Box joint jig demo',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/BxYz1234567/',
    },
    vi: { title: 'Demo jig mộng hộp' },
  },
  {
    en: {
      title: 'Spectrometer first light',
      provider: 'youtube' as const,
      sourceUrl: 'https://www.youtube.com/watch?v=SpEcTrOm1St',
    },
    vi: { title: 'Ánh sáng đầu máy quang phổ' },
  },
  {
    en: {
      title: 'Bench lighting redo',
      provider: 'tiktok' as const,
      sourceUrl: 'https://www.tiktok.com/@tuantm/video/7444444444444444444',
    },
    vi: { title: 'Đèn bàn mới' },
  },
  {
    en: {
      title: 'Router mesh unboxing',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/Mn654321MnVz/',
    },
    vi: { title: 'Unbox router mesh' },
  },
  {
    en: {
      title: 'Bench cleanup timelapse',
      provider: 'youtube' as const,
      sourceUrl: 'https://www.youtube.com/watch?v=TiMeLaP5eXy',
    },
    vi: { title: 'Timelapse dọn bàn' },
  },
  {
    en: {
      title: 'A day at the workshop',
      provider: 'tiktok' as const,
      sourceUrl: 'https://www.tiktok.com/@tuantm/video/7555555555555555555',
    },
    vi: { title: 'Một ngày ở xưởng' },
  },
  {
    en: {
      title: 'Repair reel - broken cable',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/RepA1r3elAA/',
    },
    vi: { title: 'Reel sửa - dây đứt' },
  },
  {
    en: {
      title: 'KiCad schematic walkthrough',
      provider: 'youtube' as const,
      sourceUrl: 'https://www.youtube.com/watch?v=KiCaD45HemA',
    },
    vi: { title: 'Đi qua schematic KiCad' },
  },
  {
    en: {
      title: 'Workshop tour 2025',
      provider: 'tiktok' as const,
      sourceUrl: 'https://www.tiktok.com/@tuantm/video/7666666666666666666',
    },
    vi: { title: 'Tour xưởng 2025' },
  },
  {
    en: {
      title: 'Plant press demo',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/PlaNtPress1/',
    },
    vi: { title: 'Demo bộ ép cây' },
  },
] as const

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function upsertLink(
  payload: Payload,
  data: {
    label: string
    category: 'navigation' | 'social' | 'legal' | 'contact' | 'other'
    linkType: 'internal' | 'external'
    page?: number | null
    url?: string | null
    newTab: boolean
  },
  locale: Locale = 'en',
): Promise<{ id: number }> {
  const existing = await payload.find({
    collection: 'links',
    where: { label: { equals: data.label } },
    limit: 1,
    depth: 0,
    locale,
    overrideAccess: true,
  })

  const doc =
    existing.docs[0] ||
    (await payload.create({
      collection: 'links',
      data: {
        label: data.label,
        category: data.category,
        linkType: data.linkType,
        page: data.page ?? undefined,
        url: data.url ?? undefined,
        newTab: data.newTab,
      },
      locale,
      overrideAccess: true,
    }))

  if (existing.docs[0]) {
    await payload.update({
      collection: 'links',
      id: doc.id,
      data: {
        label: data.label,
        category: data.category,
        linkType: data.linkType,
        page: data.page ?? undefined,
        url: data.url ?? undefined,
        newTab: data.newTab,
      },
      locale,
      overrideAccess: true,
    })
  }

  return { id: doc.id }
}

async function upsertAuthor(
  payload: Payload,
  seed: (typeof AUTHOR_SEEDS)[number],
  userId?: number,
) {
  const existing = await payload.find({
    collection: 'authors',
    where: userId ? { user: { equals: userId } } : { displayName: { equals: seed.en.displayName } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const base = {
    displayName: seed.en.displayName,
    jobTitle: seed.en.jobTitle,
    bio: seed.en.bio,
    approved: true,
    ...(userId ? { user: userId } : {}),
  }

  const doc =
    existing.docs[0] ||
    (await payload.create({
      collection: 'authors',
      data: base,
      locale: 'en',
      overrideAccess: true,
    }))

  if (existing.docs[0]) {
    await payload.update({
      collection: 'authors',
      id: doc.id,
      data: base,
      locale: 'en',
      overrideAccess: true,
    })
  }

  await payload.update({
    collection: 'authors',
    id: doc.id,
    data: {
      displayName: seed.vi.displayName,
      jobTitle: seed.vi.jobTitle,
      bio: seed.vi.bio,
    },
    locale: 'vi',
    overrideAccess: true,
  })

  return doc
}

async function seed() {
  const payload = await getPayload({ config })

  const admin = await upsertUser(payload, {
    email: ADMIN_EMAIL,
    password: SEED_USERS.find((u) => u.role === 'admin')!.password,
    name: SEED_USERS.find((u) => u.role === 'admin')!.name,
    role: 'admin',
  })

  for (const seedUser of SEED_USERS) {
    if (seedUser.role === 'admin') continue
    await upsertUser(payload, seedUser)
  }

  // Authors
  const authors: Record<string, { id: number }> = {}
  for (const seedAuthor of AUTHOR_SEEDS) {
    const userId = seedAuthor.linkUser ? admin.id : undefined
    authors[seedAuthor.key] = await upsertAuthor(payload, seedAuthor, userId)
  }

  // Categories
  const categories: Record<string, { id: number }> = {}
  for (const [index, cat] of CATEGORY_SEEDS.entries()) {
    const doc = await upsertBySlug(payload, 'categories', cat.slug, {
      title: cat.en.title,
      description: cat.en.description,
      order: index + 1,
    })
    await payload.update({
      collection: 'categories',
      id: doc.id,
      data: { title: cat.vi.title, description: cat.vi.description },
      locale: 'vi',
      overrideAccess: true,
    })
    categories[cat.slug] = doc
  }

  // Tags
  const tags: Record<string, { id: number }> = {}
  for (const tag of TAG_SEEDS) {
    const doc = await upsertBySlug(payload, 'tags', tag.slug, {
      title: tag.en,
      description: `Seed tag - ${tag.en}.`,
    })
    await payload.update({
      collection: 'tags',
      id: doc.id,
      data: { title: tag.vi, description: `Thẻ mẫu - ${tag.vi}.` },
      locale: 'vi',
      overrideAccess: true,
    })
    tags[tag.slug] = doc
  }

  // Globals
  // Create the decoration packs BEFORE the first site-settings update so
  // `activeDecorationPack` (required) can point to a valid pack id from
  // the start. Packs are intentionally left empty - no feed-decorations
  // are uploaded by the seed.
  const plantPack = await upsertPackBySlug(payload, 'plant', { title: 'Plant' })
  await upsertPackBySlug(payload, 'new-year', { title: 'New Year' })
  await upsertPackBySlug(payload, 'christmas', { title: 'Christmas' })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      activeDecorationPack: plantPack.id,
      siteName: 'tuantm',
      tagline: 'DIY builds, tech workspace, and maker notes',
      description: 'Seed site - workshop projects, desk setups, and electronics experiments.',
      siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      contactEmail: ADMIN_EMAIL,
      robots: { indexSite: false },
      bio: richText(
        'Documenting builds, failures, and the tools that survive them.',
        'Based in a small home workshop - posting maker notes and desk setups.',
      ),
    },
    locale: 'en',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'tuantm',
      tagline: 'Dự án DIY, không gian tech và ghi chú maker',
      description: 'Trang mẫu - dự án xưởng, setup bàn và thử nghiệm điện tử.',
      bio: richText(
        'Ghi lại bản build, thất bại và dụng cụ còn sót lại.',
        'Từ một xưởng nhỏ tại nhà - chia sẻ ghi chú maker và setup bàn.',
      ),
    },
    locale: 'vi',
    overrideAccess: true,
  })

  // Make sure the new-year and christmas packs stay empty (no items uploaded).
  // The plant pack is the active one and stays empty by design.
  for (const slug of ['new-year', 'christmas'] as const) {
    const pack = await payload.find({
      collection: 'decoration-packs',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (pack.docs[0]) {
      await payload.update({
        collection: 'decoration-packs',
        id: pack.docs[0].id,
        data: { items: [], footerItem: null },
        overrideAccess: true,
      })
    }
  }

  const categoryIds = Object.values(categories).map((c) => c.id)
  const tagSlugs = TAG_SEEDS.map((t) => t.slug)
  const authorIds = Object.values(authors).map((a) => a.id)

  // Pre-upload all 21 seed WebP images from src/assets/images and remember
  // their media ids. Files are picked in stable alphabetical order; the
  // collections below use `mediaIds[index]` so each item gets a unique image.
  const mediaIds: number[] = []
  for (const [index, filename] of NEW_IMAGE_FILES.entries()) {
    const id = await upsertSeedMedia(payload, filename, `Seed media ${index + 1}`)
    mediaIds.push(id)
  }
  if (mediaIds.length !== NEW_IMAGE_FILES.length) {
    throw new Error(`Expected ${NEW_IMAGE_FILES.length} seed media files, got ${mediaIds.length}.`)
  }

  // Drop posts/projects/things/videos rows that are not part of the seed
  // list. The local D1 picks up leftover data from previous seeds and from
  // integration tests; without this sweep the left-over rows sort ahead of
  // the seed content by `publishedAt` and surface in the public feeds with
  // empty `featuredImage` slots.
  const postSeedSlugs = POST_TITLES.map((title) => slugify(title))
  const projectSeedSlugs = PROJECT_SEEDS.map((project) => project.slug)
  const thingSeedNames = THING_SEEDS.map((thing) => thing.en.name)
  const videoSeedTitles = VIDEO_SEEDS.map((video) => video.en.title)
  await deleteNonSeedRows({
    payload,
    collection: 'posts',
    keyField: 'slug',
    keepKeys: postSeedSlugs,
    label: 'posts',
  })
  await deleteNonSeedRows({
    payload,
    collection: 'projects',
    keyField: 'slug',
    keepKeys: projectSeedSlugs,
    label: 'projects',
  })
  await deleteNonSeedRows({
    payload,
    collection: 'things',
    keyField: 'name',
    keepKeys: thingSeedNames,
    label: 'things',
  })
  await deleteNonSeedRows({
    payload,
    collection: 'videos',
    keyField: 'title',
    keepKeys: videoSeedTitles,
    label: 'videos',
  })

  // 21 published posts
  const postIds: number[] = []
  for (let i = 0; i < POST_TITLES.length; i++) {
    const slug = slugify(POST_TITLES[i])
    const author = authorIds[i % authorIds.length]
    const category = categoryIds[i % categoryIds.length]
    const tagA = tags[tagSlugs[i % tagSlugs.length]].id
    const tagB = tags[tagSlugs[(i + 3) % tagSlugs.length]].id
    const featured = i % 7 === 0
    const featuredImage = mediaIds[i]

    const doc = await upsertBySlug(payload, 'posts', slug, {
      title: POST_TITLES[i],
      excerpt: `Notes from the bench on ${POST_TITLES[i].toLowerCase()}.`,
      content: richText(
        `Long-form opening paragraph for the post "${POST_TITLES[i]}". This seeded entry walks through the topic in a builder-friendly tone, mixing first-person observation with concrete technical notes so the bento feed and bilingual content paths both get exercised.`,
        `Middle paragraph expands on the topic with concrete examples, a handful of measurements or component values, and a personal observation from the workshop - the kind of detail that makes a generic explanation feel like it was written after a real weekend of building rather than a copy-paste from a tutorial.`,
        `Closing paragraph wraps up with a forward-looking thought, a small caveat about what the next iteration might look like, and an invitation to share what the reader has built. Most seeded posts use this three-paragraph shape so the renderer has a realistic payload to layout.`,
      ),
      featuredImage,
      author,
      owner: admin.id,
      categories: [category],
      tags: [tagA, tagB],
      featured,
      _status: 'published',
      publishedAt: daysAgo(POST_TITLES.length - i),
      translationReady: { vi: true },
    })

    await payload.update({
      collection: 'posts',
      id: doc.id,
      data: {
        title: POST_TITLES_VI[i],
        excerpt: `Ghi chú từ bàn thợ về ${POST_TITLES_VI[i].toLowerCase()}.`,
        content: richText(
          `Đoạn mở đầu dài cho bài viết "${POST_TITLES_VI[i]}". Bài seed này đi qua chủ đề với giọng văn thân thiện với người thợ, trộn quan sát cá nhân với ghi chú kỹ thuật cụ thể để đảm bảo feed bento và luồng nội dung song ngữ đều được kiểm thử.`,
          `Đoạn giữa mở rộng chủ đề với ví dụ thực tế, vài số đo hoặc giá trị linh kiện, và một quan sát cá nhân từ xưởng - chi tiết khiến lời giải thích chung chung cảm thấy như được viết sau một cuối tuần build thực sự thay vì sao chép từ tutorial.`,
          `Đoạn kết khép lại với suy nghĩ hướng về phía trước, một lưu ý nhỏ về phiên bản lặp tiếp theo và lời mời chia sẻ những gì bạn đọc đã build. Hầu hết bài seed dùng khuôn ba đoạn này để renderer có payload thực tế để bố cục.`,
        ),
      },
      locale: 'vi',
      overrideAccess: true,
    })

    postIds.push(doc.id)
  }

  // 10 short stories
  for (const story of SHORT_STORY_SEEDS) {
    await upsertShortStory(
      payload,
      story.key,
      {
        title: story.en.title,
        text: story.en.text,
        variant: story.en.variant,
      },
      story.vi,
      admin.id,
    )
  }

  // 21 published projects
  const projectIds: number[] = []
  for (const [index, project] of PROJECT_SEEDS.entries()) {
    const featuredImage = mediaIds[index]
    const doc = await upsertBySlug(payload, 'projects', project.slug, {
      title: project.en.title,
      summary: project.en.summary,
      content: richText(
        `Long-form opening paragraph for the project "${project.en.title}". This seeded entry explains the build premise in a builder-friendly tone so the projects page exercises realistic rich-text content alongside the summary.`,
        `Middle paragraph walks through the construction process, listing the key materials and step-order, and notes a couple of design tradeoffs that came up while iterating. The goal is to keep the project body useful even on a preview without filling the public page with placeholder filler.`,
        `Closing paragraph wraps up with what works, what does not, and a short note about what the next iteration could look like. Most seeded projects use this three-paragraph shape so the renderer has a realistic payload to layout.`,
      ),
      featuredImage,
      author: authors[project.authorKey].id,
      owner: admin.id,
      featured: project.featured,
      _status: 'published',
      publishedAt: daysAgo((index + 1) * 14),
      translationReady: { vi: true },
    })

    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: {
        title: project.vi.title,
        summary: project.vi.summary,
        content: richText(
          `Đoạn mở đầu dài cho dự án "${project.vi.title}". Bài seed này giải thích tiền đề bản build với giọng văn thân thiện với người thợ để trang dự án kiểm thử nội dung rich-text thực tế cùng với summary.`,
          `Đoạn giữa đi qua quy trình thi công, liệt kê vật liệu chính và thứ tự bước, và ghi lại vài đánh đổi thiết kế xuất hiện trong lúc lặp. Mục tiêu là giữ phần thân dự án hữu ích ngay cả trên preview mà không nhồi trang công khai bằng filler.`,
          `Đoạn kết khép lại với những gì chạy, những gì không, và một ghi chú ngắn về phiên bản lặp tiếp theo. Hầu hết dự án seed dùng khuôn ba đoạn này để renderer có payload thực tế để bố cục.`,
        ),
      },
      locale: 'vi',
      overrideAccess: true,
    })

    projectIds.push(doc.id)
  }

  // 21 published things. The first thing (index 0) intentionally uses the
  // same media id for both primaryImage and detailImage.
  const thingIds: number[] = []
  for (const [index, thing] of THING_SEEDS.entries()) {
    const primary = mediaIds[index]
    const detail = index === 0 ? mediaIds[index] : mediaIds[(index + 1) % mediaIds.length]
    const doc = await upsertThingByName(
      payload,
      thing.en,
      thing.vi,
      { primary, detail },
      admin.id,
      (index + 1) * 3,
    )
    thingIds.push(doc.id)
  }

  // 21 published videos
  const videoIds: number[] = []
  for (const [index, video] of VIDEO_SEEDS.entries()) {
    const doc = await upsertVideoByTitle(
      payload,
      video.en,
      video.vi,
      mediaIds[index],
      admin.id,
      (index + 1) * 5,
    )
    videoIds.push(doc.id)
  }

  const aboutPage = await upsertBySlug(payload, 'pages', 'about', {
    title: 'About',
    summary: 'Maker behind the workshop notes.',
    template: 'about',
    layout: [
      {
        blockType: 'layoutRichTextWithoutBlock',
        content: richText(
          'This site documents DIY projects, desk setups, and electronics experiments from a small home workshop.',
        ),
      },
    ],
    _status: 'published',
    publishedAt: daysAgo(90),
    translationReady: { vi: true },
  })

  await payload.update({
    collection: 'pages',
    id: aboutPage.id,
    data: {
      title: 'Giới thiệu',
      slug: 'about',
      summary: 'Maker đứng sau các ghi chú xưởng.',
      layout: [
        {
          blockType: 'layoutRichTextWithoutBlock',
          content: richText(
            'Trang này ghi lại dự án DIY, setup bàn làm việc và thử nghiệm điện tử từ một xưởng nhỏ tại nhà.',
          ),
        },
      ],
    },
    locale: 'vi',
    overrideAccess: true,
  })

  const projectsPage = await upsertBySlug(payload, 'pages', 'projects', {
    title: 'Projects',
    summary: 'Selected workshop builds and case studies.',
    template: 'generic',
    layout: [
      {
        id: 'seed-projects-index',
        blockType: 'layoutFeedSection',
        heading: 'projects',
        description: 'All published builds from the workshop.',
        feedType: 'projects',
        source: 'latest',
        pagination: 'infinite',
        limit: 11,
        showViewAll: false,
        cursorPopup: "cool projects, isn't it ?",
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'view details',
      },
    ],
    _status: 'published',
    publishedAt: daysAgo(60),
    translationReady: { vi: true },
    seo: {
      metaTitle: 'Projects',
      metaDescription: 'Selected workshop builds and case studies.',
    },
  })

  const postsPage = await upsertBySlug(payload, 'pages', 'posts', {
    title: 'Posts',
    summary: 'Notes, process logs, and maker write-ups.',
    template: 'generic',
    layout: [
      {
        id: 'seed-posts-index',
        blockType: 'layoutFeedSection',
        heading: 'posts',
        description: 'All published notes from the bench.',
        feedType: 'posts',
        source: 'latest',
        pagination: 'infinite',
        limit: 11,
        showViewAll: false,
        cursorPopup: 'explore posts',
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'view details',
      },
    ],
    _status: 'published',
    publishedAt: daysAgo(55),
    translationReady: { vi: true },
    seo: {
      metaTitle: 'Posts',
      metaDescription: 'Notes, process logs, and maker write-ups.',
    },
  })

  const thingsPage = await upsertBySlug(payload, 'pages', 'things', {
    title: 'Things',
    summary: 'Tools and gear from the bench.',
    template: 'generic',
    layout: [
      {
        id: 'seed-things-index',
        blockType: 'layoutFeedSection',
        heading: 'things',
        description: 'All published tools and gear from the workshop.',
        feedType: 'things',
        source: 'latest',
        pagination: 'infinite',
        limit: 11,
        showViewAll: false,
        cursorPopup: 'tools & gear',
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'shop this',
      },
    ],
    _status: 'published',
    publishedAt: daysAgo(50),
    translationReady: { vi: true },
    seo: {
      metaTitle: 'Things',
      metaDescription: 'Tools and gear from the bench.',
    },
  })

  // Centralized link library. Created BEFORE the home page so the hero
  // home-about link can reference the "About" link by id.
  const seedLinkDefs = [
    {
      key: 'about',
      category: 'navigation' as const,
      en: { label: 'About', linkType: 'internal' as const, page: aboutPage.id },
      vi: { label: 'Giới thiệu', linkType: 'internal' as const, page: aboutPage.id },
      newTab: false,
    },
    {
      key: 'projects',
      category: 'navigation' as const,
      en: { label: 'Projects', linkType: 'internal' as const, page: projectsPage.id },
      vi: { label: 'Dự án', linkType: 'internal' as const, page: projectsPage.id },
      newTab: false,
    },
    {
      key: 'posts',
      category: 'navigation' as const,
      en: { label: 'Posts', linkType: 'internal' as const, page: postsPage.id },
      vi: { label: 'Bài viết', linkType: 'internal' as const, page: postsPage.id },
      newTab: false,
    },
    {
      key: 'instagram',
      category: 'social' as const,
      en: {
        label: 'Instagram',
        linkType: 'external' as const,
        url: 'https://instagram.com/tuantm',
      },
      vi: {
        label: 'Instagram',
        linkType: 'external' as const,
        url: 'https://instagram.com/tuantm',
      },
      newTab: true,
    },
    {
      key: 'youtube',
      category: 'social' as const,
      en: { label: 'YouTube', linkType: 'external' as const, url: 'https://youtube.com/@tuantm' },
      vi: { label: 'YouTube', linkType: 'external' as const, url: 'https://youtube.com/@tuantm' },
      newTab: true,
    },
    {
      key: 'github',
      category: 'social' as const,
      en: { label: 'GitHub', linkType: 'external' as const, url: 'https://github.com/tuantm' },
      vi: { label: 'GitHub', linkType: 'external' as const, url: 'https://github.com/tuantm' },
      newTab: true,
    },
  ] as const

  // Locale-aware maps: link ids stored per locale (pages use the same id; the
  // displayed label is localized in the admin via the localized field).
  const linkIds: Record<string, Record<(typeof seedLinkDefs)[number]['key'], number>> = {
    en: {} as Record<(typeof seedLinkDefs)[number]['key'], number>,
    vi: {} as Record<(typeof seedLinkDefs)[number]['key'], number>,
  }
  for (const def of seedLinkDefs) {
    const baseEn = {
      label: def.en.label,
      category: def.category,
      linkType: def.en.linkType,
      page: 'page' in def.en ? def.en.page : undefined,
      url: 'url' in def.en ? def.en.url : undefined,
      newTab: def.newTab,
    }
    const baseVi = {
      label: def.vi.label,
      category: def.category,
      linkType: def.vi.linkType,
      page: 'page' in def.vi ? def.vi.page : undefined,
      url: 'url' in def.vi ? def.vi.url : undefined,
      newTab: def.newTab,
    }
    const en = await upsertLink(payload, baseEn, 'en')
    const vi = await upsertLink(payload, baseVi, 'vi')
    linkIds.en[def.key] = en.id
    linkIds.vi[def.key] = vi.id
  }

  // Home page layout: Hero → Projects feed → Blank space → Things feed →
  // Blank space → Posts feed → Blank space → Videos feed → Blank space →
  // Footer. Each feed section uses static pagination with limit 11 and
  // shows a View all tile pointing to the corresponding archive page
  // (videos has no archive page so showViewAll is false there).
  const blankSpace = (id: string) => ({
    id,
    blockType: 'layoutBlankSpace' as const,
    height: '30vh',
  })

  const homePage = await upsertBySlug(payload, 'pages', 'home', {
    title: 'Home',
    summary: 'DIY builds, tech workspace, and maker notes',
    template: 'home',
    layout: [
      {
        id: 'seed-home-hero',
        blockType: 'layoutHero',
        labelTitle: 'Passenger',
        title: 'tuantm',
        labelTagline: 'Route',
        tagline: 'DIY builds, tech workspace, and maker notes',
        labelBio: 'Notes',
        bio: richText('Documenting builds, failures, and the tools that survive them.'),
        cursorPopup: 'scroll down',
        labelSocialLinks: 'Socials',
        socialLinks: [linkIds.en.about],
        labelOtherLinks: 'Links',
        otherLinks: [],
      },
      {
        id: 'seed-home-projects',
        blockType: 'layoutFeedSection',
        heading: 'projects',
        description: 'Selected builds from the workshop.',
        feedType: 'projects',
        source: 'latest',
        pagination: 'static',
        limit: 11,
        showViewAll: true,
        viewAllLabel: 'View all projects',
        viewAllPage: projectsPage.id,
        cursorPopup: "cool projects, isn't it ?",
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'view details',
        cursorPopupViewAll: 'view all projects',
      },
      blankSpace('seed-home-gap-1'),
      {
        id: 'seed-home-things',
        blockType: 'layoutFeedSection',
        heading: 'things',
        description: 'Tools and gear from the bench.',
        feedType: 'things',
        source: 'latest',
        pagination: 'static',
        limit: 11,
        showViewAll: true,
        viewAllLabel: 'View all things',
        viewAllPage: thingsPage.id,
        cursorPopup: 'tools & gear',
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'shop this',
        cursorPopupViewAll: 'view all things',
      },
      blankSpace('seed-home-gap-2'),
      {
        id: 'seed-home-posts',
        blockType: 'layoutFeedSection',
        heading: 'posts',
        description: 'Notes, process logs, and maker write-ups.',
        feedType: 'posts',
        source: 'latest',
        pagination: 'static',
        limit: 11,
        showViewAll: true,
        viewAllLabel: 'View all posts',
        viewAllPage: postsPage.id,
        cursorPopup: 'explore posts',
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'view details',
        cursorPopupViewAll: 'view all posts',
      },
      blankSpace('seed-home-gap-3'),
      {
        id: 'seed-home-videos',
        blockType: 'layoutFeedSection',
        heading: 'videos',
        description: 'Short clips from the workshop.',
        feedType: 'videos',
        source: 'latest',
        pagination: 'static',
        limit: 11,
        showViewAll: false,
        cursorPopup: 'watch',
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'play',
      },
      blankSpace('seed-home-gap-4'),
    ],
    _status: 'published',
    publishedAt: daysAgo(120),
    translationReady: { vi: true },
    seo: {
      metaTitle: 'tuantm',
      metaDescription: 'DIY builds, tech workspace, and maker notes from a home workshop.',
    },
  })

  // Wire SiteSettings → profileLinks + navigation from the Links library.
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      bio: richText(
        'Documenting builds, failures, and the tools that survive them.',
        'Based in a small home workshop - posting maker notes and desk setups.',
      ),
      profileLinks: [linkIds.en.instagram, linkIds.en.youtube, linkIds.en.github],
      navigation: [
        { link: linkIds.en.projects },
        { link: linkIds.en.posts },
        { link: linkIds.en.about },
      ],
    },
    locale: 'en',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      bio: richText(
        'Ghi lại bản build, thất bại và dụng cụ còn sót lại.',
        'Từ một xưởng nhỏ tại nhà - chia sẻ ghi chú maker và setup bàn.',
      ),
      profileLinks: [linkIds.vi.instagram, linkIds.vi.youtube, linkIds.vi.github],
      navigation: [
        { link: linkIds.vi.projects },
        { link: linkIds.vi.posts },
        { link: linkIds.vi.about },
      ],
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await payload.update({
    collection: 'pages',
    id: projectsPage.id,
    data: {
      title: 'Dự án',
      slug: 'projects',
      summary: 'Các bản build và case study đã chọn.',
      layout: [
        {
          id: 'seed-projects-index',
          blockType: 'layoutFeedSection',
          heading: 'dự án',
          description: 'Tất cả bản build đã xuất bản từ xưởng.',
          feedType: 'projects',
          source: 'latest',
          pagination: 'infinite',
          limit: 11,
          showViewAll: false,
          cursorPopup: 'những dự án hay, đúng không?',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'xem chi tiết',
        },
      ],
      seo: {
        metaTitle: 'Dự án',
        metaDescription: 'Các bản build và case study đã chọn.',
      },
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await payload.update({
    collection: 'pages',
    id: postsPage.id,
    data: {
      title: 'Bài viết',
      slug: 'posts',
      summary: 'Ghi chú, nhật ký quy trình và bài viết maker.',
      layout: [
        {
          id: 'seed-posts-index',
          blockType: 'layoutFeedSection',
          heading: 'bài viết',
          description: 'Tất cả ghi chú đã xuất bản từ bàn thợ.',
          feedType: 'posts',
          source: 'latest',
          pagination: 'infinite',
          limit: 11,
          showViewAll: false,
          cursorPopup: 'khám phá bài viết',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'xem chi tiết',
        },
      ],
      seo: {
        metaTitle: 'Bài viết',
        metaDescription: 'Ghi chú, nhật ký quy trình và bài viết maker.',
      },
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await payload.update({
    collection: 'pages',
    id: thingsPage.id,
    data: {
      title: 'Món đồ',
      slug: 'things',
      summary: 'Dụng cụ và đồ nghề từ bàn thợ.',
      layout: [
        {
          id: 'seed-things-index',
          blockType: 'layoutFeedSection',
          heading: 'món đồ',
          description: 'Tất cả dụng cụ và đồ nghề đã xuất bản từ xưởng.',
          feedType: 'things',
          source: 'latest',
          pagination: 'infinite',
          limit: 11,
          showViewAll: false,
          cursorPopup: 'dụng cụ & đồ nghề',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'mua món này',
        },
      ],
      seo: {
        metaTitle: 'Món đồ',
        metaDescription: 'Dụng cụ và đồ nghề từ bàn thợ.',
      },
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await payload.update({
    collection: 'pages',
    id: homePage.id,
    data: {
      title: 'Trang chủ',
      summary: 'Dự án DIY, không gian tech và ghi chú maker',
      layout: [
        {
          id: 'seed-home-hero',
          blockType: 'layoutHero',
          labelTitle: 'Hành khách',
          title: 'tuantm',
          labelTagline: 'Hành trình',
          tagline: 'Dự án DIY, không gian tech và ghi chú maker',
          labelBio: 'Ghi chú',
          bio: richText('Ghi lại bản build, thất bại và dụng cụ còn sót lại.'),
          cursorPopup: 'kéo xuống',
          labelSocialLinks: 'Mạng xã hội',
          socialLinks: [linkIds.vi.about],
          labelOtherLinks: 'Liên kết',
          otherLinks: [],
        },
        {
          id: 'seed-home-projects',
          blockType: 'layoutFeedSection',
          heading: 'dự án',
          description: 'Những bản build chọn lọc từ xưởng.',
          feedType: 'projects',
          source: 'latest',
          pagination: 'static',
          limit: 11,
          showViewAll: true,
          viewAllLabel: 'Xem tất cả dự án',
          viewAllPage: projectsPage.id,
          cursorPopup: 'những dự án hay, đúng không?',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'xem chi tiết',
          cursorPopupViewAll: 'xem tất cả dự án',
        },
        blankSpace('seed-home-gap-1'),
        {
          id: 'seed-home-things',
          blockType: 'layoutFeedSection',
          heading: 'món đồ',
          description: 'Dụng cụ và đồ nghề từ bàn thợ.',
          feedType: 'things',
          source: 'latest',
          pagination: 'static',
          limit: 11,
          showViewAll: true,
          viewAllLabel: 'Xem tất cả món đồ',
          viewAllPage: thingsPage.id,
          cursorPopup: 'dụng cụ & đồ nghề',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'mua món này',
          cursorPopupViewAll: 'xem tất cả món đồ',
        },
        blankSpace('seed-home-gap-2'),
        {
          id: 'seed-home-posts',
          blockType: 'layoutFeedSection',
          heading: 'bài viết',
          description: 'Ghi chú, nhật ký quy trình và bài viết maker.',
          feedType: 'posts',
          source: 'latest',
          pagination: 'static',
          limit: 11,
          showViewAll: true,
          viewAllLabel: 'Xem tất cả bài viết',
          viewAllPage: postsPage.id,
          cursorPopup: 'khám phá bài viết',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'xem chi tiết',
          cursorPopupViewAll: 'xem tất cả bài viết',
        },
        blankSpace('seed-home-gap-3'),
        {
          id: 'seed-home-videos',
          blockType: 'layoutFeedSection',
          heading: 'video',
          description: 'Clip ngắn từ xưởng.',
          feedType: 'videos',
          source: 'latest',
          pagination: 'static',
          limit: 11,
          showViewAll: false,
          cursorPopup: 'xem',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'phát',
        },
        blankSpace('seed-home-gap-4'),
      ],
      seo: {
        metaTitle: 'tuantm',
        metaDescription: 'Dự án DIY, không gian tech và ghi chú maker từ xưởng tại nhà.',
      },
    },
    locale: 'vi',
    overrideAccess: true,
  })

  console.log('Seed complete.')
  console.log(`- Admin: ${admin.email}`)
  console.log(`- Authors: ${authorIds.length}`)
  console.log(`- Categories: ${categoryIds.length}`)
  console.log(`- Tags: ${tagSlugs.length}`)
  console.log(`- Published posts: ${postIds.length}`)
  console.log(`- Short stories: ${SHORT_STORY_SEEDS.length}`)
  console.log(`- Published projects: ${projectIds.length}`)
  console.log(`- Things: ${thingIds.length}`)
  console.log(`- Videos: ${videoIds.length}`)
  console.log(`- Home page: ${homePage.id}`)
  console.log(`- Posts page: ${postsPage.id}`)
  console.log(`- Projects page: ${projectsPage.id}`)
  console.log(`- Things page: ${thingsPage.id}`)
  for (const seedUser of SEED_USERS) {
    console.log(`- ${seedUser.role}: ${seedUser.email}`)
  }
  console.log('Seed complete. Run bun run migrate if schema migrations are pending.')
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
