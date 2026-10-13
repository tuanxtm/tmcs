import * as migration_20260101_000000_inline_images_schema from './20260101_000000_inline_images_schema';
import * as migration_20260809_160100_slug_reservations from './20260809_160100_slug_reservations';
import * as migration_20261012_000000_remove_short_stories from './20261012_000000_remove_short_stories';

export const migrations = [
  {
    up: migration_20260101_000000_inline_images_schema.up,
    down: migration_20260101_000000_inline_images_schema.down,
    name: '20260101_000000_inline_images_schema',
  },
  {
    up: migration_20260809_160100_slug_reservations.up,
    down: migration_20260809_160100_slug_reservations.down,
    name: '20260809_160100_slug_reservations',
  },
  {
    up: migration_20261012_000000_remove_short_stories.up,
    down: migration_20261012_000000_remove_short_stories.down,
    name: '20261012_000000_remove_short_stories',
  },
];
