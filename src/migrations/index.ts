import * as migration_20260810_155155_initial_inventory_schema from './20260810_155155_initial_inventory_schema';
import * as migration_20260810_162914_paystack_payments from './20260810_162914_paystack_payments';
import * as migration_20260810_172913_booking_fulfilment from './20260810_172913_booking_fulfilment';
import * as migration_20260811_012834_event_ticketing from './20260811_012834_event_ticketing';
import * as migration_20260811_050125_cloudinary_media_storage from './20260811_050125_cloudinary_media_storage';
import * as migration_20260811_094425_event_ticket_notifications from './20260811_094425_event_ticket_notifications';
import * as migration_20260811_200530_revoke_public_api_grants from './20260811_200530_revoke_public_api_grants';
import * as migration_20260812_003415_admin_notifications_and_profile from './20260812_003415_admin_notifications_and_profile';

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
  {
    up: migration_20260810_172913_booking_fulfilment.up,
    down: migration_20260810_172913_booking_fulfilment.down,
    name: '20260810_172913_booking_fulfilment',
  },
  {
    up: migration_20260811_012834_event_ticketing.up,
    down: migration_20260811_012834_event_ticketing.down,
    name: '20260811_012834_event_ticketing',
  },
  {
    up: migration_20260811_050125_cloudinary_media_storage.up,
    down: migration_20260811_050125_cloudinary_media_storage.down,
    name: '20260811_050125_cloudinary_media_storage',
  },
  {
    up: migration_20260811_094425_event_ticket_notifications.up,
    down: migration_20260811_094425_event_ticket_notifications.down,
    name: '20260811_094425_event_ticket_notifications',
  },
  {
    up: migration_20260811_200530_revoke_public_api_grants.up,
    down: migration_20260811_200530_revoke_public_api_grants.down,
    name: '20260811_200530_revoke_public_api_grants',
  },
  {
    up: migration_20260812_003415_admin_notifications_and_profile.up,
    down: migration_20260812_003415_admin_notifications_and_profile.down,
    name: '20260812_003415_admin_notifications_and_profile'
  },
];
