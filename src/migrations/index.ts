import * as migration_20250929_111647 from './20250929_111647'
import * as migration_20260712_170252_portfolio_blog_schema from './20260712_170252_portfolio_blog_schema'
import * as migration_20260713_021144_remove_portfolio_collections from './20260713_021144_remove_portfolio_collections'
import * as migration_20260716_094605_add_short_stories_and_post_card_size from './20260716_094605_add_short_stories_and_post_card_size'
import * as migration_20260716_171127_end_of_feed_homepage from './20260716_171127_end_of_feed_homepage'
import * as migration_20260716_173705_feed_decorations_plant_pack from './20260716_173705_feed_decorations_plant_pack'
import * as migration_20260719_171400_footer_text_richtext from './20260719_171400_footer_text_richtext'
import * as migration_20260721_130000_decoration_packs_frontpage_end_of_feed from './20260721_130000_decoration_packs_frontpage_end_of_feed'
import * as migration_20260722_120000_pack_centric_feed_decorations from './20260722_120000_pack_centric_feed_decorations'
import * as migration_20260726_091600_hot_query_indexes from './20260726_091600_hot_query_indexes'
import * as migration_20260729_092400_remove_frontpage_end_of_feed from './20260729_092400_remove_frontpage_end_of_feed'
import * as migration_20260730_003800_profile_hero_site_settings from './20260730_003800_profile_hero_site_settings'
import * as migration_20260801_001800_unify_site_settings_simplify_projects from './20260801_001800_unify_site_settings_simplify_projects'
import * as migration_20260801_004800_remove_packer_cms_fields from './20260801_004800_remove_packer_cms_fields'
import * as migration_20260802_100000_payload_homepage_blocks from './20260802_100000_payload_homepage_blocks'
import * as migration_20260802_103200_feed_section_cursor_popups from './20260802_103200_feed_section_cursor_popups'
import * as migration_20260802_153500_feed_section_description from './20260802_153500_feed_section_description'
import * as migration_20260802_161000_feed_section_pagination_view_all_page from './20260802_161000_feed_section_pagination_view_all_page'
import * as migration_20260803_125000_add_things_and_videos_collections from './20260803_125000_add_things_and_videos_collections'
import * as migration_20260804_slug_reservations from './20260804_slug_reservations'
import * as migration_20260805_012000_add_typewriter_block from './20260805_012000_add_typewriter_block'
import * as migration_20260805_095000_add_scramble_hover_block from './20260805_095000_add_scramble_hover_block'
import * as migration_20260805_120000_add_footer_block from './20260805_120000_add_footer_block'

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260712_170252_portfolio_blog_schema.up,
    down: migration_20260712_170252_portfolio_blog_schema.down,
    name: '20260712_170252_portfolio_blog_schema',
  },
  {
    up: migration_20260713_021144_remove_portfolio_collections.up,
    down: migration_20260713_021144_remove_portfolio_collections.down,
    name: '20260713_021144_remove_portfolio_collections',
  },
  {
    up: migration_20260716_094605_add_short_stories_and_post_card_size.up,
    down: migration_20260716_094605_add_short_stories_and_post_card_size.down,
    name: '20260716_094605_add_short_stories_and_post_card_size',
  },
  {
    up: migration_20260716_171127_end_of_feed_homepage.up,
    down: migration_20260716_171127_end_of_feed_homepage.down,
    name: '20260716_171127_end_of_feed_homepage',
  },
  {
    up: migration_20260716_173705_feed_decorations_plant_pack.up,
    down: migration_20260716_173705_feed_decorations_plant_pack.down,
    name: '20260716_173705_feed_decorations_plant_pack',
  },
  {
    up: migration_20260719_171400_footer_text_richtext.up,
    down: migration_20260719_171400_footer_text_richtext.down,
    name: '20260719_171400_footer_text_richtext',
  },
  {
    up: migration_20260721_130000_decoration_packs_frontpage_end_of_feed.up,
    down: migration_20260721_130000_decoration_packs_frontpage_end_of_feed.down,
    name: '20260721_130000_decoration_packs_frontpage_end_of_feed',
  },
  {
    up: migration_20260722_120000_pack_centric_feed_decorations.up,
    down: migration_20260722_120000_pack_centric_feed_decorations.down,
    name: '20260722_120000_pack_centric_feed_decorations',
  },
  {
    up: migration_20260726_091600_hot_query_indexes.up,
    down: migration_20260726_091600_hot_query_indexes.down,
    name: '20260726_091600_hot_query_indexes',
  },
  {
    up: migration_20260729_092400_remove_frontpage_end_of_feed.up,
    down: migration_20260729_092400_remove_frontpage_end_of_feed.down,
    name: '20260729_092400_remove_frontpage_end_of_feed',
  },
  {
    up: migration_20260730_003800_profile_hero_site_settings.up,
    down: migration_20260730_003800_profile_hero_site_settings.down,
    name: '20260730_003800_profile_hero_site_settings',
  },
  {
    up: migration_20260801_001800_unify_site_settings_simplify_projects.up,
    down: migration_20260801_001800_unify_site_settings_simplify_projects.down,
    name: '20260801_001800_unify_site_settings_simplify_projects',
  },
  {
    up: migration_20260801_004800_remove_packer_cms_fields.up,
    down: migration_20260801_004800_remove_packer_cms_fields.down,
    name: '20260801_004800_remove_packer_cms_fields',
  },
  {
    up: migration_20260802_100000_payload_homepage_blocks.up,
    down: migration_20260802_100000_payload_homepage_blocks.down,
    name: '20260802_100000_payload_homepage_blocks',
  },
  {
    up: migration_20260802_103200_feed_section_cursor_popups.up,
    down: migration_20260802_103200_feed_section_cursor_popups.down,
    name: '20260802_103200_feed_section_cursor_popups',
  },
  {
    up: migration_20260802_153500_feed_section_description.up,
    down: migration_20260802_153500_feed_section_description.down,
    name: '20260802_153500_feed_section_description',
  },
  {
    up: migration_20260802_161000_feed_section_pagination_view_all_page.up,
    down: migration_20260802_161000_feed_section_pagination_view_all_page.down,
    name: '20260802_161000_feed_section_pagination_view_all_page',
  },
  {
    up: migration_20260803_125000_add_things_and_videos_collections.up,
    down: migration_20260803_125000_add_things_and_videos_collections.down,
    name: '20260803_125000_add_things_and_videos_collections',
  },
  {
    up: migration_20260805_012000_add_typewriter_block.up,
    down: migration_20260805_012000_add_typewriter_block.down,
    name: '20260805_012000_add_typewriter_block',
  },
  {
    up: migration_20260805_095000_add_scramble_hover_block.up,
    down: migration_20260805_095000_add_scramble_hover_block.down,
    name: '20260805_095000_add_scramble_hover_block',
  },
  {
    up: migration_20260805_120000_add_footer_block.up,
    down: migration_20260805_120000_add_footer_block.down,
    name: '20260805_120000_add_footer_block',
  },
]
