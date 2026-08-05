/**
 * Idempotent development seed.
 *
 * Usage:
 *   bun run seed
 *
 * Local-only credentials are baked in below (see SEED_USERS).
 * Override by editing this file or extending it with env reads if needed.
 * Never use these credentials in production. Safe to re-run — upserts by stable keys.
 */

import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '@payload-config'
import { PLANT_DECORATION_SEEDS } from './plant-decorations'
import { upsertFeedDecorationFile } from './decoration-upload'

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

  const localPath = path.join(process.cwd(), 'public', filename)
  const buffer = await readFile(localPath)
  // Plain Uint8Array — Node Buffer fails Miniflare/devalue (same as decoration-upload).
  const bytes = new Uint8Array(buffer)

  const created = await payload.create({
    collection: 'media',
    data: {
      alt,
      kind: 'image',
    },
    file: {
      data: Buffer.from(bytes),
      mimetype: 'image/webp',
      name: filename,
      size: bytes.byteLength,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  })

  return created.id
}

async function upsertThingByName(
  payload: Payload,
  en: {
    name: string
    description: string
    affiliateUrl?: string | null
    linkLabel?: string | null
    featured?: boolean
  },
  vi: {
    name: string
    description: string
    affiliateUrl?: string | null
    linkLabel?: string | null
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
    affiliateUrl: en.affiliateUrl ?? null,
    linkLabel: en.linkLabel ?? null,
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
      affiliateUrl: vi.affiliateUrl ?? null,
      linkLabel: vi.linkLabel ?? null,
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
      // Skip network thumbnail fetch during seed — we supply Media explicitly.
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
// Seed content — DIY projects, tech workspace, maker culture
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
    featured: true,
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
    authorKey: 'hana' as const,
  },
] as const

const POST_TITLES = [
  'First cuts on the modular bench',
  'Cable comb patterns that actually stay put',
  'Soldering a sensor breakout without lifting pads',
  'Why I moved the homelab off the shelf',
  'Designing t-track inserts for small parts',
  'A quiet fan curve for printer enclosures',
  'Measuring desk glare before buying a lamp',
  'Perfboard layout for a weekend ESP32 node',
  'Labeling PDUs so future-you says thanks',
  'Printing jigs for repeatable hole spacing',
  'Wood finish tests on shop storage',
  'Heat-set inserts in PETG enclosures',
  'Routing USB-C under the desk cleanly',
  'Calibrating a soil sensor in real pots',
  'A minimal tool wall above the bench',
  'Choosing bit sets for hybrid materials',
  'Documenting failures in the project log',
  'Filtering ABS without over-restricting flow',
  'A rolling cart for test equipment',
  'Power budgets for a small electronics bench',
  'Mounting a monitor arm on a thin desk',
  'Dry box humidity targets for PLA and PETG',
  'Sketching enclosure vents before CAD',
  'Bench lighting angles for close-up work',
  'Organizing spare headers and connectors',
  'A weekend NAS migration checklist',
  'Anti-vibration feet that do not wobble',
  'Thermal photos of a loaded rack',
  'Iteration notes on a planter dashboard',
  'Shipping a DIY project write-up',
] as const

const POST_TITLES_VI = [
  'Những vết cắt đầu tiên trên bàn module',
  'Mẫu lược dây thực sự giữ được',
  'Hàn breakout cảm biến không bong pad',
  'Vì sao tôi chuyển homelab khỏi kệ',
  'Thiết kế insert t-track cho linh kiện nhỏ',
  'Đường cong quạt êm cho vỏ máy in',
  'Đo chói bàn trước khi mua đèn',
  'Layout perfboard cho node ESP32 cuối tuần',
  'Dán nhãn PDU để tương lai cảm ơn',
  'In jig cho khoảng cách lỗ lặp lại',
  'Thử hoàn thiện gỗ trên kệ xưởng',
  'Heat-set insert trong vỏ PETG',
  'Đi dây USB-C dưới bàn gọn gàng',
  'Hiệu chuẩn cảm biến đất trong chậu thật',
  'Tường dụng cụ tối giản trên bàn',
  'Chọn bộ mũi khoan cho vật liệu lai',
  'Ghi thất bại trong nhật ký dự án',
  'Lọc ABS không hạn chế luồng quá mức',
  'Xe đẩy cho thiết bị đo',
  'Ngân sách nguồn cho bàn điện tử nhỏ',
  'Gá màn hình trên bàn mỏng',
  'Mục tiêu độ ẩm hộp khô cho PLA và PETG',
  'Phác thảo lỗ thông gió trước CAD',
  'Góc đèn bàn cho việc cận cảnh',
  'Sắp xếp header và connector dự phòng',
  'Checklist di chuyển NAS cuối tuần',
  'Chân chống rung không lắc',
  'Ảnh nhiệt rack khi tải đầy',
  'Ghi chú lặp dashboard chậu cây',
  'Xuất bản bài viết dự án DIY',
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

const THING_SEEDS = [
  {
    en: {
      name: 'Soldering station',
      description: 'Temperature-controlled iron for nightly repairs.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE1',
      featured: true,
    },
    vi: {
      name: 'Trạm hàn',
      description: 'Mỏ hàn chỉnh nhiệt cho sửa chữa ban đêm.',
      affiliateUrl: 'https://shopee.vn/soldering-station',
    },
  },
  {
    en: {
      name: 'ESD mat',
      description: 'Grounded work surface for sensitive boards.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE2',
    },
    vi: {
      name: 'Thảm ESD',
      description: 'Mặt bàn nối mass cho mạch nhạy cảm.',
      affiliateUrl: 'https://shopee.vn/esd-mat',
    },
  },
  {
    en: {
      name: 'Helping hands',
      description: 'Third hand with magnifier for fine joints.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE3',
    },
    vi: {
      name: 'Kẹp hỗ trợ',
      description: 'Tay thứ ba kèm kính lúp cho mối hàn nhỏ.',
      affiliateUrl: null,
    },
  },
  {
    en: {
      name: 'Digital calipers',
      description: '0.01 mm readings for enclosure fits.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE4',
    },
    vi: {
      name: 'Thước kẹp điện tử',
      description: 'Độ chính xác 0.01 mm cho khít vỏ.',
      affiliateUrl: 'https://shopee.vn/digital-calipers',
    },
  },
  {
    en: {
      name: 'Flush cutters',
      description: 'Clean lead trims without nicking pads.',
      affiliateUrl: null,
    },
    vi: {
      name: 'Kềm cắt chân',
      description: 'Cắt chân sạch không cạo pad.',
      affiliateUrl: null,
    },
  },
  {
    en: {
      name: 'Kapton tape',
      description: 'Heat-safe masking for rework.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE6',
    },
    vi: {
      name: 'Băng Kapton',
      description: 'Băng chịu nhiệt cho rework.',
      affiliateUrl: 'https://shopee.vn/kapton-tape',
    },
  },
  {
    en: {
      name: 'USB microscope',
      description: 'Inspect joints before powering up.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE7',
    },
    vi: {
      name: 'Kính hiển vi USB',
      description: 'Kiểm mối hàn trước khi cấp nguồn.',
      affiliateUrl: 'https://shopee.vn/usb-microscope',
    },
  },
  {
    en: {
      name: 'Bench PSU',
      description: 'Current-limited supply for first boots.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE8',
    },
    vi: {
      name: 'Nguồn bàn',
      description: 'Nguồn giới hạn dòng cho lần boot đầu.',
      affiliateUrl: 'https://shopee.vn/bench-psu',
    },
  },
  {
    en: {
      name: 'Logic analyzer',
      description: 'Capture I2C and UART when firmware ghosts appear.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLE9',
    },
    vi: {
      name: 'Logic analyzer',
      description: 'Bắt I2C và UART khi firmware ma xuất hiện.',
      affiliateUrl: 'https://shopee.vn/logic-analyzer',
    },
  },
  {
    en: {
      name: 'Wire strippers',
      description: 'Self-adjusting jaws for 30–10 AWG.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLEA',
    },
    vi: {
      name: 'Kìm tuốt dây',
      description: 'Hàm tự chỉnh cho 30–10 AWG.',
      affiliateUrl: 'https://shopee.vn/wire-strippers',
    },
  },
  {
    en: {
      name: 'Fume extractor',
      description: 'Carbon filter for late-night soldering.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLEB',
    },
    vi: {
      name: 'Hút khói',
      description: 'Lọc carbon cho hàn khuya.',
      affiliateUrl: 'https://shopee.vn/fume-extractor',
    },
  },
  {
    en: {
      name: 'Multimeter',
      description: 'True-RMS meter for AC and DC checks.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLEC',
    },
    vi: {
      name: 'Đồng hồ vạn năng',
      description: 'True-RMS cho kiểm AC và DC.',
      affiliateUrl: 'https://shopee.vn/multimeter',
    },
  },
  {
    en: {
      name: 'Hot air station',
      description: 'For QFN rework and heat-shrink.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLED',
    },
    vi: {
      name: 'Trạm hơi nóng',
      description: 'Cho rework QFN và ống gen.',
      affiliateUrl: 'https://shopee.vn/hot-air',
    },
  },
  {
    en: {
      name: 'Parts organizer',
      description: 'Labeled bins so SMD resistors stay findable.',
      affiliateUrl: 'https://www.amazon.com/dp/B08EXAMPLEE',
    },
    vi: {
      name: 'Hộp linh kiện',
      description: 'Ngăn có nhãn để điện trở SMD luôn tìm được.',
      affiliateUrl: 'https://shopee.vn/parts-organizer',
    },
  },
] as const

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
      title: 'Workshop reel — calipers',
      provider: 'instagram' as const,
      sourceUrl: 'https://www.instagram.com/reel/AbCdEfGhIjK/',
    },
    vi: { title: 'Reel xưởng — thước kẹp' },
  },
  {
    en: {
      title: 'Bench PSU first boot',
      provider: 'youtube' as const,
      sourceUrl: 'https://youtu.be/dQw4w9WgXcQ',
    },
    vi: { title: 'Boot đầu nguồn bàn' },
  },
] as const

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
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

  let creator = null as Awaited<ReturnType<typeof upsertUser>> | null
  for (const seedUser of SEED_USERS) {
    if (seedUser.role === 'admin') continue
    const doc = await upsertUser(payload, seedUser)
    if (seedUser.role === 'creator') creator = doc
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
      description: `Seed tag — ${tag.en}.`,
    })
    await payload.update({
      collection: 'tags',
      id: doc.id,
      data: { title: tag.vi, description: `Thẻ mẫu — ${tag.vi}.` },
      locale: 'vi',
      overrideAccess: true,
    })
    tags[tag.slug] = doc
  }

  // Globals
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'tuantm',
      tagline: 'DIY builds, tech workspace, and maker notes',
      description: 'Seed site — workshop projects, desk setups, and electronics experiments.',
      siteUrl: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
      contactEmail: ADMIN_EMAIL,
      robots: { indexSite: false },
      bio: richText(
        'Documenting builds, failures, and the tools that survive them.',
        'Based in a small home workshop — posting maker notes and desk setups.',
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
      description: 'Trang mẫu — dự án xưởng, setup bàn và thử nghiệm điện tử.',
      bio: richText(
        'Ghi lại bản build, thất bại và dụng cụ còn sót lại.',
        'Từ một xưởng nhỏ tại nhà — chia sẻ ghi chú maker và setup bàn.',
      ),
    },
    locale: 'vi',
    overrideAccess: true,
  })

  const plantPack = await upsertPackBySlug(payload, 'plant', { title: 'Plant' })
  await upsertPackBySlug(payload, 'new-year', { title: 'New Year' })
  await upsertPackBySlug(payload, 'christmas', { title: 'Christmas' })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      activeDecorationPack: plantPack.id,
    },
    locale: 'en',
    overrideAccess: true,
  })

  const plantItems: Array<{
    id: string
    title: string
    file: number
    weight: number
  }> = []

  for (const [index, deco] of PLANT_DECORATION_SEEDS.entries()) {
    const fileId = await upsertFeedDecorationFile(payload, {
      title: deco.title,
      filename: deco.filename,
    })

    plantItems.push({
      id: `plant-item-${index + 1}`,
      title: deco.title,
      file: fileId,
      weight: deco.weight,
    })
  }

  await payload.update({
    collection: 'decoration-packs',
    id: plantPack.id,
    data: {
      items: plantItems,
      footerItem: plantItems[0]?.id ?? null,
    },
    overrideAccess: true,
  })

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

  // 30 published posts
  const postIds: number[] = []
  for (let i = 0; i < POST_TITLES.length; i++) {
    const slug = slugify(POST_TITLES[i])
    const author = authorIds[i % authorIds.length]
    const category = categoryIds[i % categoryIds.length]
    const tagA = tags[tagSlugs[i % tagSlugs.length]].id
    const tagB = tags[tagSlugs[(i + 3) % tagSlugs.length]].id
    const featured = i < 3 || i % 11 === 0

    const doc = await upsertBySlug(payload, 'posts', slug, {
      title: POST_TITLES[i],
      excerpt: `Notes from the bench on ${POST_TITLES[i].toLowerCase()}.`,
      content: richText(
        `This seeded post covers ${POST_TITLES[i].toLowerCase()} in a DIY tech workspace context.`,
        'It exists to exercise the bento feed and bilingual content.',
      ),
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
          `Bài seed này nói về ${POST_TITLES_VI[i].toLowerCase()} trong bối cảnh DIY và không gian tech.`,
          'Nó giúp kiểm tra feed bento, nội dung song ngữ và kích thước thẻ biên tập.',
        ),
      },
      locale: 'vi',
      overrideAccess: true,
    })

    postIds.push(doc.id)
  }

  // One draft post for editorial testing
  await upsertBySlug(payload, 'posts', 'bench-wiring-draft', {
    title: 'Bench wiring draft',
    excerpt: 'Unpublished wiring diagram notes.',
    content: richText('Draft content — should not appear on the public feed.'),
    author: authors.linh.id,
    owner: creator?.id || admin.id,
    _status: 'draft',
  })

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

  // 5 projects
  const projectIds: number[] = []
  for (const [index, project] of PROJECT_SEEDS.entries()) {
    const doc = await upsertBySlug(payload, 'projects', project.slug, {
      title: project.en.title,
      summary: project.en.summary,
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
      },
      locale: 'vi',
      overrideAccess: true,
    })

    projectIds.push(doc.id)
  }

  await upsertBySlug(payload, 'projects', 'draft-cnc-fixture', {
    title: 'CNC fixture draft',
    summary: 'Unpublished fixture concept.',
    owner: creator?.id || admin.id,
    _status: 'draft',
  })

  // Seed media reused by Things / Videos (plant WebPs already in public/).
  const mediaIds: number[] = []
  for (const [index, plant] of PLANT_DECORATION_SEEDS.entries()) {
    const id = await upsertSeedMedia(payload, plant.filename, `Seed media ${index + 1}`)
    mediaIds.push(id)
  }
  if (mediaIds.length === 0) {
    throw new Error('Expected plant decoration files for Things/Videos seed media.')
  }

  const thingIds: number[] = []
  for (const [index, thing] of THING_SEEDS.entries()) {
    const primary = mediaIds[index % mediaIds.length]
    const detail = mediaIds[(index + 1) % mediaIds.length]
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

  const videoIds: number[] = []
  for (const [index, video] of VIDEO_SEEDS.entries()) {
    const doc = await upsertVideoByTitle(
      payload,
      video.en,
      video.vi,
      mediaIds[index % mediaIds.length],
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
        blockType: 'richText',
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
          blockType: 'richText',
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
        blockType: 'feedSection',
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
        blockType: 'feedSection',
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
        blockType: 'feedSection',
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

  const homePage = await upsertBySlug(payload, 'pages', 'home', {
    title: 'Home',
    summary: 'DIY builds, tech workspace, and maker notes',
    template: 'home',
    layout: [
      {
        id: 'seed-home-hero',
        blockType: 'hero',
        label: 'Hero',
        title: 'tuantm',
        tagline: 'DIY builds, tech workspace, and maker notes',
        bio: richText('Documenting builds, failures, and the tools that survive them.'),
        cursorPopup: 'scroll down',
        links: [
          {
            id: 'seed-home-hero-about',
            label: 'About',
            linkType: 'internal',
            page: aboutPage.id,
            newTab: false,
          },
        ],
      },
      {
        id: 'seed-home-projects',
        blockType: 'feedSection',
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
      {
        id: 'seed-home-posts',
        blockType: 'feedSection',
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
      {
        id: 'seed-home-things',
        blockType: 'feedSection',
        heading: 'things',
        description: 'Tools and gear from the bench.',
        feedType: 'things',
        source: 'latest',
        pagination: 'static',
        limit: 5,
        showViewAll: true,
        viewAllLabel: 'View all things',
        viewAllPage: thingsPage.id,
        cursorPopup: 'tools & gear',
        cursorPopupEmpty: 'nothing here yet',
        cursorPopupItem: 'shop this',
        cursorPopupViewAll: 'view all things',
      },
      {
        id: 'seed-home-videos',
        blockType: 'feedSection',
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
    ],
    _status: 'published',
    publishedAt: daysAgo(120),
    translationReady: { vi: true },
    seo: {
      metaTitle: 'tuantm',
      metaDescription: 'DIY builds, tech workspace, and maker notes from a home workshop.',
    },
  })

  const seedLinks = [
    {
      id: 'seed-link-about',
      labelEn: 'About',
      labelVi: 'Giới thiệu',
      linkType: 'internal' as const,
      page: aboutPage.id,
      newTab: false,
    },
    {
      id: 'seed-link-projects',
      labelEn: 'Projects',
      labelVi: 'Dự án',
      linkType: 'internal' as const,
      page: projectsPage.id,
      newTab: false,
    },
    {
      id: 'seed-link-posts',
      labelEn: 'Posts',
      labelVi: 'Bài viết',
      linkType: 'internal' as const,
      page: postsPage.id,
      newTab: false,
    },
    {
      id: 'seed-link-instagram',
      labelEn: 'Instagram',
      labelVi: 'Instagram',
      linkType: 'external' as const,
      url: 'https://instagram.com/tuantm',
      newTab: true,
    },
    {
      id: 'seed-link-youtube',
      labelEn: 'YouTube',
      labelVi: 'YouTube',
      linkType: 'external' as const,
      url: 'https://youtube.com/@tuantm',
      newTab: true,
    },
    {
      id: 'seed-link-github',
      labelEn: 'GitHub',
      labelVi: 'GitHub',
      linkType: 'external' as const,
      url: 'https://github.com/tuantm',
      newTab: true,
    },
  ]

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      bio: richText(
        'Documenting builds, failures, and the tools that survive them.',
        'Based in a small home workshop — posting maker notes and desk setups.',
      ),
      links: seedLinks.map((link) => ({
        id: link.id,
        label: link.labelEn,
        linkType: link.linkType,
        page: 'page' in link ? link.page : undefined,
        url: 'url' in link ? link.url : undefined,
        newTab: link.newTab,
      })),
    },
    locale: 'en',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      bio: richText(
        'Ghi lại bản build, thất bại và dụng cụ còn sót lại.',
        'Từ một xưởng nhỏ tại nhà — chia sẻ ghi chú maker và setup bàn.',
      ),
      links: seedLinks.map((link) => ({
        id: link.id,
        label: link.labelVi,
        linkType: link.linkType,
        page: 'page' in link ? link.page : undefined,
        url: 'url' in link ? link.url : undefined,
        newTab: link.newTab,
      })),
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
          blockType: 'feedSection',
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
          blockType: 'feedSection',
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
          blockType: 'feedSection',
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
          blockType: 'hero',
          label: 'Hero',
          title: 'tuantm',
          tagline: 'Dự án DIY, không gian tech và ghi chú maker',
          bio: richText('Ghi lại bản build, thất bại và dụng cụ còn sót lại.'),
          cursorPopup: 'kéo xuống',
          links: [
            {
              id: 'seed-home-hero-about',
              label: 'Giới thiệu',
              linkType: 'internal',
              page: aboutPage.id,
              newTab: false,
            },
          ],
        },
        {
          id: 'seed-home-projects',
          blockType: 'feedSection',
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
        {
          id: 'seed-home-posts',
          blockType: 'feedSection',
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
        {
          id: 'seed-home-things',
          blockType: 'feedSection',
          heading: 'món đồ',
          description: 'Dụng cụ và đồ nghề từ bàn thợ.',
          feedType: 'things',
          source: 'latest',
          pagination: 'static',
          limit: 5,
          showViewAll: true,
          viewAllLabel: 'Xem tất cả món đồ',
          viewAllPage: thingsPage.id,
          cursorPopup: 'dụng cụ & đồ nghề',
          cursorPopupEmpty: 'chưa có gì ở đây',
          cursorPopupItem: 'mua món này',
          cursorPopupViewAll: 'xem tất cả món đồ',
        },
        {
          id: 'seed-home-videos',
          blockType: 'feedSection',
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
