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
]
