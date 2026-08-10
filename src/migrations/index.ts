import * as migration_20260810_155155_initial_inventory_schema from './20260810_155155_initial_inventory_schema'
import * as migration_20260810_162914_paystack_payments from './20260810_162914_paystack_payments'

export const migrations = [
  {
    up: migration_20260810_155155_initial_inventory_schema.up,
    down: migration_20260810_155155_initial_inventory_schema.down,
    name: '20260810_155155_initial_inventory_schema',
  },
  {
    up: migration_20260810_162914_paystack_payments.up,
    down: migration_20260810_162914_paystack_payments.down,
    name: '20260810_162914_paystack_payments',
  },
]
