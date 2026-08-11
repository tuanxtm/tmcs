/**
 * Home page loader - re-exports the shared page-data module.
 * Prefer importing from `page-data` for new code.
 */
export {
  firstHeroBlock,
  getHomePage,
  getPageBySlug,
  resolveLayoutBlocks,
} from '@/app/(frontend)/_lib/page-data'
