import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260712_170252_portfolio_blog_schema from './20260712_170252_portfolio_blog_schema';
import * as migration_20260713_021144_remove_portfolio_collections from './20260713_021144_remove_portfolio_collections';

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
    name: '20260713_021144_remove_portfolio_collections'
  },
];
