import type { CollectionConfig } from 'payload'
import { hasRole } from '../access/roles'

function relationshipID(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'number' ? id : undefined
  }
  return undefined
}

/**
 * A dated, capacity-limited run of an experience.
 *
 * Inventory is derived from active booking holds and confirmed bookings while
 * the departure row is locked. We intentionally do not store mutable
 * "remaining seats" counters here: timestamp-based holds then expire exactly
 * on time without a counter-repair race.
 */
export const Departures: CollectionConfig = {
  slug: 'departures',
  labels: { singular: 'Departure', plural: 'Departures' },
  admin: {
    useAsTitle: 'inventoryKey',
    defaultColumns: ['experience', 'startsAt', 'status', 'capacity', 'timeConfirmed'],
    group: 'Operations',
    description:
      'Scheduled experience dates and seat capacity. Active holds and confirmed bookings consume this capacity automatically.',
  },
  access: {
    read: hasRole('operations', 'finance'),
    create: hasRole('operations'),
    update: hasRole('operations'),
    delete: hasRole('operations'),
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        const nextData = data ?? {}
        const experience = relationshipID(nextData.experience ?? originalDoc?.experience)
        const startsAtValue = nextData.startsAt ?? originalDoc?.startsAt

        if (experience && startsAtValue) {
          const startsAt = new Date(String(startsAtValue))
          if (!Number.isNaN(startsAt.getTime())) {
            const iso = startsAt.toISOString()
            nextData.startsAt = iso
            nextData.dateKey = iso.slice(0, 10)
            nextData.inventoryKey = `${experience}:${iso}`
          }
        }

        return nextData
      },
    ],
    beforeChange: [
      ({ data, originalDoc }) => {
        const capacity = Number(data.capacity ?? originalDoc?.capacity)
        if (!Number.isInteger(capacity) || capacity < 1) {
          throw new Error('Departure capacity must be a whole number of at least 1.')
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'experience',
      type: 'relationship',
      relationTo: 'experiences',
      required: true,
      index: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startsAt',
          label: 'Departure date & time',
          type: 'date',
          required: true,
          index: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', displayFormat: 'd MMM yyyy, HH:mm' },
          },
        },
        {
          name: 'timeConfirmed',
          label: 'Departure time confirmed',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            width: '25%',
            description: 'Turn off when only the travel date has been agreed.',
          },
        },
        {
          name: 'capacity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 15,
          admin: { width: '25%', step: 1 },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'scheduled',
      index: true,
      options: [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Closed', value: 'closed' },
        { label: 'Sold out (manual)', value: 'sold-out' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'autoCreated',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Created from an eligible website date request.',
      },
    },
    {
      name: 'dateKey',
      type: 'text',
      index: true,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'inventoryKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'meetingPointOverride',
      label: 'Meeting point override',
      type: 'text',
      admin: { description: 'Leave blank to use the experience meeting point.' },
    },
    { name: 'operationsNotes', type: 'textarea' },
  ],
}
