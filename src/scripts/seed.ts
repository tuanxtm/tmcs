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
import { PLANT_DECORATION_SEEDS } from './plant-decorations'

type Locale = 'en' | 'vi'

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
    allowedShapes?: ('1x1' | '2x1' | '3x1' | '1x2' | '2x2')[]
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
    allowedShapes: en.allowedShapes,
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

// ---------------------------------------------------------------------------
// Seed content — DIY projects, tech workspace, maker culture
// ---------------------------------------------------------------------------

const CATEGORY_SEEDS = [
  {
    slug: 'diy-projects',
    en: { title: 'DIY Projects', description: 'Hands-on builds, repairs, and weekend experiments.' },
    vi: { title: 'Dự án DIY', description: 'Các bản build thực hành, sửa chữa và thử nghiệm cuối tuần.' },
  },
  {
    slug: 'tech-workspace',
    en: { title: 'Tech Workspace', description: 'Desk setups, ergonomics, and studio organization.' },
    vi: { title: 'Không gian làm việc', description: 'Bàn làm việc, công thái học và tổ chức studio.' },
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
    vi: { title: 'Nhà thông minh', description: 'Cảm biến, tự động hóa và thiết bị ưu tiên local.' },
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
      challenge: 'One bench had to support soldering, sawing, and laptop work without constant resets.',
      solution: 'Designed a modular top with removable inserts, integrated power, and mobile tool trays.',
      outcome: 'Swap contexts in under five minutes; fewer stray parts on the surface.',
    },
    vi: {
      title: 'Hệ bàn thợ module',
      summary: 'Bàn t-track với đồ gá thay đổi cho điện tử và mộc.',
      challenge: 'Một bàn phải hàn, cưa và làm việc laptop mà không setup lại liên tục.',
      solution: 'Mặt bàn module, nguồn tích hợp và khay dụng cụ di động.',
      outcome: 'Đổi ngữ cảnh dưới năm phút; ít linh kiện rơi vãi.',
    },
    projectType: 'design' as const,
    featured: true,
    order: 1,
  },
  {
    slug: 'desk-power-rail',
    en: {
      title: 'Desk Power Rail',
      summary: 'Under-desk USB-C and AC distribution with fused branches for a clean cable path.',
      challenge: 'Multiple chargers and lab supplies created a tangled power mess.',
      solution: 'Built a fused rail with labeled branches, strain relief, and a single inlet.',
      outcome: 'Reduced desk clutter; easier to trace faults during prototyping.',
    },
    vi: {
      title: 'Thanh nguồn bàn làm việc',
      summary: 'Phân phối USB-C và AC dưới bàn với nhánh có cầu chì.',
      challenge: 'Nhiều sạc và nguồn lab làm rối dây điện.',
      solution: 'Thanh nguồn có cầu chì, nhãn nhánh và một điểm vào.',
      outcome: 'Giảm rối; dễ truy vết lỗi khi prototype.',
    },
    projectType: 'infra' as const,
    featured: true,
    order: 2,
  },
  {
    slug: 'sensor-planter',
    en: {
      title: 'Sensor Planter',
      summary: 'ESP32 planter monitoring soil moisture, light, and ambient temperature.',
      challenge: 'Plants died silently between waterings during busy weeks.',
      solution: 'Low-power sensor node with local alerts and a weekly trend chart.',
      outcome: 'Catch dry spells early; less guesswork on watering.',
    },
    vi: {
      title: 'Chậu cảm biến',
      summary: 'Chậu ESP32 theo dõi độ ẩm đất, ánh sáng và nhiệt độ.',
      challenge: 'Cây chết lặng lẽ giữa các lần tưới khi bận.',
      solution: 'Node cảm biến tiết kiệm điện, cảnh báo local và biểu đồ tuần.',
      outcome: 'Phát hiện khô sớm; ít đoán mò khi tưới.',
    },
    projectType: 'web' as const,
    featured: false,
    order: 3,
  },
  {
    slug: 'print-farm-enclosure',
    en: {
      title: 'Print Farm Enclosure',
      summary: 'Stacked printer enclosure with filtered exhaust and vibration isolation.',
      challenge: 'ABS fumes and resonance traveled through a small apartment workshop.',
      solution: 'Enclosure stack with HEPA path, foam feet, and shared filament dry box.',
      outcome: 'Quieter prints; more predictable ABS results.',
    },
    vi: {
      title: 'Vỏ farm in 3D',
      summary: 'Vỏ máy in xếp chồng có lọc khí thải và cách rung.',
      challenge: 'Khí ABS và rung lan trong xưởng nhỏ.',
      solution: 'Vỏ xếp chồng, đường HEPA, chân foam và hộp khô filament chung.',
      outcome: 'In êm hơn; ABS ổn định hơn.',
    },
    projectType: 'design' as const,
    featured: false,
    order: 4,
  },
  {
    slug: 'homelab-rack',
    en: {
      title: 'Homelab Rack',
      summary: '12U rolling rack with cable comb, PDU labeling, and hot-aisle airflow notes.',
      challenge: 'Services sprawled across shelves with no cooling story.',
      solution: 'Compact rack, blanking panels, intake/exhaust mapping, and service map.',
      outcome: 'Stable thermals; faster incident triage.',
    },
    vi: {
      title: 'Rack homelab',
      summary: 'Rack 12U có lược dây, nhãn PDU và ghi chú luồng khí.',
      challenge: 'Dịch vụ tràn kệ, không có chiến lược làm mát.',
      solution: 'Rack gọn, tấm che, sơ đồ hút/thổi và bản đồ dịch vụ.',
      outcome: 'Nhiệt ổn định; xử lý sự cố nhanh hơn.',
    },
    projectType: 'infra' as const,
    featured: true,
    order: 5,
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

const CARD_SIZES = ['auto', 'small', 'wide', 'tall', 'large'] as const

const SHORT_STORY_SEEDS = [
  {
    key: 'ss01',
    en: { title: 'Measure twice', text: 'A quick note before cutting stock: mark, step back, mark again.', variant: 'note' as const },
    vi: { title: 'Đo hai lần', text: 'Ghi chú nhanh trước khi cắt: đánh dấu, lùi lại, đánh dấu lại.' },
    allowedShapes: ['1x1', '2x1'] as const,
  },
  {
    key: 'ss02',
    en: { title: 'Bench rule', text: 'If it takes longer to find the tool than to use it, the tool needs a home.', variant: 'quote' as const },
    vi: { title: 'Quy tắc bàn thợ', text: 'Nếu tìm dụng cụ lâu hơn dùng nó, dụng cụ cần một chỗ.' },
    allowedShapes: ['1x1', '1x2', '2x1'] as const,
  },
  {
    key: 'ss03',
    en: { title: 'Spare ferrules', text: 'Keep three sizes in a labeled tin. Future-you is always soldering at 11pm.', variant: 'note' as const },
    vi: { title: 'Đầu cosse dự phòng', text: 'Giữ ba cỡ trong hộp có nhãn. Bạn tương lai luôn hàn lúc 11 giờ tối.' },
  },
  {
    key: 'ss04',
    en: { title: 'Local first', text: 'Automate the plant sensor locally before exposing another cloud dashboard.', variant: 'quote' as const },
    vi: { title: 'Local trước', text: 'Tự động hóa cảm biến cây local trước khi thêm dashboard cloud.' },
    allowedShapes: ['2x1', '3x1'] as const,
  },
  {
    key: 'ss05',
    en: { title: 'Filament note', text: 'Write the oven dry time on the spool. Memory is not a process.', variant: 'note' as const },
    vi: { title: 'Ghi filament', text: 'Viết thời gian sấy lò lên cuộn. Trí nhớ không phải quy trình.' },
  },
  {
    key: 'ss06',
    en: { title: 'Rack mantra', text: 'Label the cable before you trust the service.', variant: 'quote' as const },
    vi: { title: 'Câu rack', text: 'Dán nhãn dây trước khi tin dịch vụ.' },
    allowedShapes: ['1x1', '2x2'] as const,
  },
  {
    key: 'ss07',
    en: { title: 'Vent sketch', text: 'A napkin drawing of intake vs exhaust beats a perfect render that ships late.', variant: 'note' as const },
    vi: { title: 'Phác thông gió', text: 'Vẽ giấy ăn hút/thổi tốt hơn render hoàn hảo trễ hạn.' },
    allowedShapes: ['1x2', '2x2'] as const,
  },
  {
    key: 'ss08',
    en: { title: 'Shop light', text: 'Cross-light the bench; kill the shadows on your smallest parts.', variant: 'note' as const },
    vi: { title: 'Đèn xưởng', text: 'Chiếu chéo bàn; xóa bóng trên chi tiết nhỏ nhất.' },
    allowedShapes: ['2x1', '3x1'] as const,
  },
  {
    key: 'ss09',
    en: { title: 'Iteration', text: 'Version three is where the project finally tells you what it wants to be.', variant: 'quote' as const },
    vi: { title: 'Lặp', text: 'Phiên bản ba là lúc dự án nói bạn nó muốn trở thành gì.' },
  },
  {
    key: 'ss10',
    en: { title: 'Ship the log', text: 'Publish the messy notes. Someone else is stuck on the same bench problem.', variant: 'note' as const },
    vi: { title: 'Xuất nhật ký', text: 'Đăng ghi chú lộn xộn. Ai đó cũng kẹt cùng vấn đề bàn thợ.' },
    allowedShapes: ['1x1', '2x1', '1x2'] as const,
  },
  {
    key: 'ss11',
    en: { title: 'Torque habit', text: 'Snug the screw, then stop. Stripped threads cost more time than caution.', variant: 'note' as const },
    vi: { title: 'Thói quen siết', text: 'Vặn vừa khít rồi dừng. Ren hỏng tốn thời gian hơn cẩn thận.' },
    allowedShapes: ['1x1'] as const,
  },
  {
    key: 'ss12',
    en: { title: 'Test clip', text: 'A labeled bag of clipped leads beats a drawer of mystery metal.', variant: 'quote' as const },
    vi: { title: 'Túi chân cắt', text: 'Túi có nhãn đựng chân cắt tốt hơn ngăn kéo kim loại không rõ nguồn.' },
    allowedShapes: ['2x1', '3x1'] as const,
  },
  {
    key: 'ss13',
    en: { title: 'Flux reminder', text: 'Clean the joint before you blame the solder.', variant: 'note' as const },
    vi: { title: 'Nhắc flux', text: 'Làm sạch mối hàn trước khi đổ lỗi cho thiếc.' },
  },
  {
    key: 'ss14',
    en: { title: 'Quiet hours', text: 'Schedule the loud prints for when neighbors are at work.', variant: 'quote' as const },
    vi: { title: 'Giờ yên', text: 'Hẹn in ồn khi hàng xóm đi làm.' },
    allowedShapes: ['1x2', '2x2'] as const,
  },
  {
    key: 'ss15',
    en: { title: 'Backup bit', text: 'Keep a duplicate end mill one drawer down. Dull catches at the worst moment.', variant: 'note' as const },
    vi: { title: 'Mũi dự phòng', text: 'Giữ mũi phay dự phòng một ngăn dưới. Cùn kẹt đúng lúc tệ nhất.' },
    allowedShapes: ['1x1', '2x1'] as const,
  },
  {
    key: 'ss16',
    en: { title: 'Ground loop', text: 'If the scope lies, check the ground before chasing ghosts in firmware.', variant: 'quote' as const },
    vi: { title: 'Vòng mass', text: 'Nếu scope sai, kiểm tra mass trước khi truy firmware ma.' },
    allowedShapes: ['2x1', '3x1', '2x2'] as const,
  },
  {
    key: 'ss17',
    en: { title: 'Dust pass', text: 'Vacuum the bench after sanding. Electronics and sawdust are not friends.', variant: 'note' as const },
    vi: { title: 'Hút bụi', text: 'Hút bàn sau khi chà nhám. Điện tử và mùn cưa không phải bạn.' },
  },
  {
    key: 'ss18',
    en: { title: 'Spare USB', text: 'Label the data-only cables. Charging cables lie during flashing.', variant: 'note' as const },
    vi: { title: 'USB dự phòng', text: 'Dán nhãn cáp chỉ data. Cáp sạc nói dối khi flash.' },
    allowedShapes: ['1x1', '1x2'] as const,
  },
  {
    key: 'ss19',
    en: { title: 'Scope budget', text: 'Buy the probe you will actually reach for, not the one that impresses on paper.', variant: 'quote' as const },
    vi: { title: 'Ngân sách scope', text: 'Mua đầu dò bạn thực sự dùng, không phải cái ấn tượng trên giấy.' },
    allowedShapes: ['1x1', '2x1', '1x2'] as const,
  },
  {
    key: 'ss20',
    en: { title: 'End of day', text: 'Power down the bench, cap the flux, and leave one note for morning-you.', variant: 'note' as const },
    vi: { title: 'Cuối ngày', text: 'Tắt nguồn bàn, đậy flux, để một ghi chú cho bạn sáng mai.' },
    allowedShapes: ['2x1', '3x1'] as const,
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
    where: userId
      ? { user: { equals: userId } }
      : { displayName: { equals: seed.en.displayName } },
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
      siteName: 'TMCS Portfolio',
      tagline: 'DIY builds, tech workspace, and maker notes',
      description: 'Seed site — workshop projects, desk setups, and electronics experiments.',
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
      tagline: 'Dự án DIY, không gian tech và ghi chú maker',
      description: 'Trang mẫu — dự án xưởng, setup bàn và thử nghiệm điện tử.',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroHeading: 'Workshop notes from the bench',
      heroSubheading: 'DIY projects, desk setups, and electronics experiments.',
      profileSummary: 'Documenting builds, failures, and the tools that survive them.',
      endOfFeed: {
        enabled: true,
        eyebrow: 'End of feed',
        title: 'Thanks for reading',
        message: 'More notes land here as they leave the bench.',
        preferredShape: '2x1',
      },
      activeDecorationPack: 'plant',
    },
    locale: 'en',
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroHeading: 'Ghi chú từ bàn thợ',
      heroSubheading: 'Dự án DIY, setup bàn và thử nghiệm điện tử.',
      profileSummary: 'Ghi lại bản build, thất bại và dụng cụ còn sót lại.',
      endOfFeed: {
        enabled: true,
        eyebrow: 'Hết feed',
        title: 'Cảm ơn đã đọc',
        message: 'Thêm ghi chú sẽ xuất hiện khi chúng rời bàn thợ.',
        preferredShape: '2x1',
      },
      activeDecorationPack: 'plant',
    },
    locale: 'vi',
    overrideAccess: true,
  })

  for (const deco of PLANT_DECORATION_SEEDS) {
    const existing = await payload.find({
      collection: 'feed-decorations',
      where: { title: { equals: deco.title } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      title: deco.title,
      pack: deco.pack,
      svgMarkup: deco.svgMarkup,
      allowedShapes: [...deco.allowedShapes],
      weight: deco.weight,
    }

    if (existing.docs[0]) {
      await payload.update({
        collection: 'feed-decorations',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({
        collection: 'feed-decorations',
        data,
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
    const cardSize = CARD_SIZES[i % CARD_SIZES.length]
    const featured = i < 3 || i % 11 === 0

    const doc = await upsertBySlug(payload, 'posts', slug, {
      title: POST_TITLES[i],
      excerpt: `Notes from the bench on ${POST_TITLES[i].toLowerCase()}.`,
      content: richText(
        `This seeded post covers ${POST_TITLES[i].toLowerCase()} in a DIY tech workspace context.`,
        'It exists to exercise the bento feed, bilingual content, and editorial card sizes.',
      ),
      author,
      owner: admin.id,
      categories: [category],
      tags: [tagA, tagB],
      featured,
      cardSize,
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
        allowedShapes: 'allowedShapes' in story ? [...story.allowedShapes] : undefined,
      },
      story.vi,
      admin.id,
    )
  }

  // 5 projects
  const projectIds: number[] = []
  for (const project of PROJECT_SEEDS) {
    const doc = await upsertBySlug(payload, 'projects', project.slug, {
      title: project.en.title,
      summary: project.en.summary,
      challenge: project.en.challenge,
      solution: project.en.solution,
      outcome: project.en.outcome,
      author: authors[project.order % 2 === 0 ? 'khoa' : 'hana'].id,
      owner: admin.id,
      projectType: project.projectType,
      projectStatus: 'completed',
      featured: project.featured,
      order: project.order,
      _status: 'published',
      publishedAt: daysAgo(project.order * 14),
      translationReady: { vi: true },
    })

    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: {
        title: project.vi.title,
        summary: project.vi.summary,
        challenge: project.vi.challenge,
        solution: project.vi.solution,
        outcome: project.vi.outcome,
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
    projectStatus: 'concept',
    _status: 'draft',
  })

  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      featuredProjects: projectIds.filter((_, i) => PROJECT_SEEDS[i]?.featured),
      featuredPosts: postIds.slice(0, 4),
    },
    locale: 'en',
    overrideAccess: true,
  })

  await upsertBySlug(payload, 'pages', 'about', {
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
  })

  const portfolioPage = await upsertBySlug(payload, 'pages', 'portfolio', {
    title: 'Portfolio',
    summary: 'Selected workshop builds and case studies.',
    template: 'generic',
    layout: [
      {
        blockType: 'richText',
        content: richText(
          'Case studies from the bench — modular furniture, power distribution, sensors, enclosures, and homelab work.',
        ),
      },
      {
        blockType: 'projectsGrid',
        heading: 'Featured projects',
        items: projectIds,
        featuredOnly: false,
      },
    ],
    _status: 'published',
    publishedAt: daysAgo(60),
    translationReady: { vi: true },
  })

  await payload.update({
    collection: 'pages',
    id: portfolioPage.id,
    data: {
      title: 'Portfolio',
      summary: 'Các bản build và case study đã chọn.',
      layout: [
        {
          blockType: 'richText',
          content: richText(
            'Case study từ bàn thợ — nội thất module, phân phối nguồn, cảm biến, vỏ bọc và homelab.',
          ),
        },
        {
          blockType: 'projectsGrid',
          heading: 'Dự án nổi bật',
          items: projectIds,
          featuredOnly: false,
        },
      ],
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
  if (managerEmail) console.log(`- Manager: ${managerEmail}`)
  if (creatorEmail) console.log(`- Creator: ${creatorEmail}`)
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
