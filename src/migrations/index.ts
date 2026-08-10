import * as migration_20260810_155155_initial_inventory_schema from './20260810_155155_initial_inventory_schema'

export const migrations = [
  {
    up: migration_20260810_155155_initial_inventory_schema.up,
    down: migration_20260810_155155_initial_inventory_schema.down,
    name: '20260810_155155_initial_inventory_schema',
  },
]
