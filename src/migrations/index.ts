import * as migration_20260809_160100_slug_reservations from './20260809_160100_slug_reservations';
import * as migration_20260903_172000_fresh_template_required from './20260903_172000_fresh_template_required';

export const migrations = [
  {
    up: migration_20260809_160100_slug_reservations.up,
    down: migration_20260809_160100_slug_reservations.down,
    name: '20260809_160100_slug_reservations',
  },
  {
    up: migration_20260903_172000_fresh_template_required.up,
    down: migration_20260903_172000_fresh_template_required.down,
    name: '20260903_172000_fresh_template_required',
  },
];
