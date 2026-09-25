import * as migration_20260801_000000_blocks_v2 from './20260801_000000_blocks_v2';
import * as migration_20260809_160100_slug_reservations from './20260809_160100_slug_reservations';

export const migrations = [
  {
    up: migration_20260801_000000_blocks_v2.up,
    down: migration_20260801_000000_blocks_v2.down,
    name: '20260801_000000_blocks_v2',
  },
  {
    up: migration_20260809_160100_slug_reservations.up,
    down: migration_20260809_160100_slug_reservations.down,
    name: '20260809_160100_slug_reservations',
  },
];
