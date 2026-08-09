import * as migration_20260809_152450_init from './20260809_152450_init';
import * as migration_20260809_160100_slug_reservations from './20260809_160100_slug_reservations';

export const migrations = [
  {
    up: migration_20260809_152450_init.up,
    down: migration_20260809_152450_init.down,
    name: '20260809_152450_init',
  },
  {
    up: migration_20260809_160100_slug_reservations.up,
    down: migration_20260809_160100_slug_reservations.down,
    name: '20260809_160100_slug_reservations'
  },
];
