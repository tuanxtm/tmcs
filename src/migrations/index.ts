import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260712_170252_portfolio_blog_schema from './20260712_170252_portfolio_blog_schema';
import * as migration_20260713_021144_remove_portfolio_collections from './20260713_021144_remove_portfolio_collections';
import * as migration_20260716_094605_add_short_stories_and_post_card_size from './20260716_094605_add_short_stories_and_post_card_size';
import * as migration_20260716_171127_end_of_feed_homepage from './20260716_171127_end_of_feed_homepage';
import * as migration_20260716_173705_feed_decorations_plant_pack from './20260716_173705_feed_decorations_plant_pack';

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
    name: '20260716_173705_feed_decorations_plant_pack'
  },
];
