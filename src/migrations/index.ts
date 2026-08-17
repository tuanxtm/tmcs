import * as migration_20260809_152450_init from './20260809_152450_init';
import * as migration_20260809_160100_slug_reservations from './20260809_160100_slug_reservations';
import * as migration_20260810_033116_add_thing_links_array from './20260810_033116_add_thing_links_array';
import * as migration_20260810_045307_things_affiliate_url_rename from './20260810_045307_things_affiliate_url_rename';
import * as migration_20260815_032145_hero_blocks_redesign from './20260815_032145_hero_blocks_redesign';

export const migrations = [
  {
    up: migration_20260809_152450_init.up,
    down: migration_20260809_152450_init.down,
    name: '20260809_152450_init',
  },
  {
    up: migration_20260809_160100_slug_reservations.up,
    down: migration_20260809_160100_slug_reservations.down,
    name: '20260809_160100_slug_reservations',
  },
  {
    up: migration_20260810_033116_add_thing_links_array.up,
    down: migration_20260810_033116_add_thing_links_array.down,
    name: '20260810_033116_add_thing_links_array',
  },
  {
    up: migration_20260810_045307_things_affiliate_url_rename.up,
    down: migration_20260810_045307_things_affiliate_url_rename.down,
    name: '20260810_045307_things_affiliate_url_rename',
  },
  {
    up: migration_20260815_032145_hero_blocks_redesign.up,
    down: migration_20260815_032145_hero_blocks_redesign.down,
    name: '20260815_032145_hero_blocks_redesign'
  },
];
