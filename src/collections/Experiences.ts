import type { CollectionConfig } from 'payload'
import { anyone, hasRole } from '../access/roles'
import { slugField } from '../fields/slug'
import { seoField } from '../fields/seo'

const WEEKDAYS = [
  { label: 'Monday', value: 'mon' },
  { label: 'Tuesday', value: 'tue' },
  { label: 'Wednesday', value: 'wed' },
  { label: 'Thursday', value: 'thu' },
  { label: 'Friday', value: 'fri' },
  { label: 'Saturday', value: 'sat' },
  { label: 'Sunday', value: 'sun' },
]

/**
 * Experiences (§29–§37, §54–§57) — the core product. Uses admin tabs so the
 * "no-code" tour editor stays approachable. Drafts/versioning are enabled so
 * staff can preview before publishing (§58).
 */
export const Experiences: CollectionConfig = {
  slug: 'experiences',
  labels: { singular: 'Experience', plural: 'Experiences' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'destination', 'priceFrom', 'difficulty', '_status'],
    group: 'Catalogue',
    preview: (doc) => (doc?.slug ? `/experiences/${doc.slug}` : null),
  },
  access: {
    read: anyone,
    create: hasRole('operations', 'content-editor'),
    update: hasRole('operations', 'content-editor'),
    delete: hasRole('operations'),
  },
  versions: {
    drafts: { autosave: { interval: 800 }, schedulePublish: true },
    maxPerDoc: 25,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ── Overview ───────────────────────────────────────────────
        {
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'shortDescription', type: 'textarea', maxLength: 240 },
            { name: 'description', type: 'richText' },
            {
              name: 'highlights',
              type: 'array',
              labels: { singular: 'Highlight', plural: 'Highlights' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'whoFor', label: 'Who this experience is for', type: 'textarea' },
          ],
        },
        // ── Itinerary ──────────────────────────────────────────────
        {
          label: 'Itinerary',
          description: 'Add and drag-to-reorder the stops (§30, §56).',
          fields: [
            {
              name: 'itinerary',
              type: 'array',
              labels: { singular: 'Stop', plural: 'Stops' },
              admin: { components: {} },
              fields: [
                { name: 'time', type: 'text', admin: { width: '30%', placeholder: 'e.g. 07:00' } },
                { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                { name: 'description', type: 'textarea' },
              ],
            },
          ],
        },
        // ── Inclusions ─────────────────────────────────────────────
        {
          label: 'Inclusions',
          fields: [
            {
              name: 'included',
              label: "What's included",
              type: 'array',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'excluded',
              label: "What's not included",
              type: 'array',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'whatToBring',
              type: 'array',
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
        },
        // ── Pricing ────────────────────────────────────────────────
        {
          label: 'Pricing',
          description: 'Standard base pricing assumes 2+ travellers; 3+ can get reduced rates (§32).',
          fields: [
            {
              name: 'pricingStrategy',
              type: 'select',
              required: true,
              defaultValue: 'fixed',
              options: [
                { label: 'Fixed price per person', value: 'fixed' },
                { label: 'Tiered group pricing', value: 'tiered' },
                { label: 'Price per group', value: 'per-group' },
                { label: 'Private tour price', value: 'private' },
                { label: 'Request a quote', value: 'quote' },
              ],
            },
            {
              name: 'priceFrom',
              label: 'From price (GHS, per person)',
              type: 'number',
              min: 0,
              required: true,
              admin: { description: 'Whole Cedi. Shown as the card / "from" price.' },
            },
            {
              name: 'priceTiers',
              label: 'Group price tiers',
              type: 'array',
              admin: {
                condition: (data) => data?.pricingStrategy === 'tiered',
                description: 'Per-person price by group size. Leave blank to inherit the from price.',
              },
              fields: [
                { name: 'minGuests', type: 'number', required: true, min: 1, admin: { width: '30%' } },
                { name: 'maxGuests', type: 'number', min: 1, admin: { width: '30%' } },
                {
                  name: 'pricePerPerson',
                  type: 'number',
                  min: 0,
                  admin: { width: '25%', description: 'GHS' },
                },
                { name: 'requestQuote', type: 'checkbox', admin: { width: '15%' } },
              ],
            },
            {
              name: 'privatePrice',
              type: 'number',
              min: 0,
              admin: { condition: (data) => data?.pricingStrategy === 'private', description: 'GHS per group' },
            },
            {
              name: 'visitorPricing',
              label: 'Resident / international pricing',
              type: 'group',
              admin: {
                description:
                  'Disabled by default. Capital Pulse\'s GHS 1,400 is the international rate (§34); enable once Trivoxo supplies resident prices.',
              },
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false },
                {
                  name: 'residentPrice',
                  type: 'number',
                  min: 0,
                  admin: { condition: (_, sib) => Boolean(sib?.enabled) },
                },
              ],
            },
          ],
        },
        // ── Availability & capacity ────────────────────────────────
        {
          label: 'Availability',
          fields: [
            {
              name: 'availabilityType',
              type: 'select',
              required: true,
              defaultValue: 'everyday',
              options: [
                { label: 'Every day', value: 'everyday' },
                { label: 'Selected weekdays', value: 'weekdays' },
                { label: 'Specific dates', value: 'specific-dates' },
                { label: 'On request only', value: 'on-request' },
                { label: 'Private bookings only', value: 'private-only' },
              ],
            },
            {
              name: 'weekdays',
              type: 'select',
              hasMany: true,
              options: WEEKDAYS,
              admin: {
                condition: (data) => data?.availabilityType === 'weekdays',
                description: 'e.g. Dodi Island runs Sat + Sun only (§36).',
              },
            },
            {
              name: 'includePublicHolidays',
              type: 'checkbox',
              defaultValue: false,
              admin: { condition: (data) => ['weekdays', 'specific-dates'].includes(data?.availabilityType) },
            },
            {
              type: 'row',
              fields: [
                { name: 'minGuests', type: 'number', defaultValue: 2, min: 1, admin: { width: '25%' } },
                { name: 'maxGuests', type: 'number', min: 1, admin: { width: '25%' } },
                {
                  name: 'minNoticeHours',
                  label: 'Min booking notice (hours)',
                  type: 'number',
                  defaultValue: 24,
                  admin: { width: '25%' },
                },
                {
                  name: 'maxAdvanceDays',
                  label: 'Max advance (days)',
                  type: 'number',
                  defaultValue: 180,
                  admin: { width: '25%' },
                },
              ],
            },
            {
              name: 'soldOut',
              type: 'checkbox',
              defaultValue: false,
              admin: { position: 'sidebar', description: 'Mark the whole experience as sold out.' },
            },
          ],
        },
        // ── Logistics & activity detail ────────────────────────────
        {
          label: 'Logistics',
          fields: [
            { name: 'duration', type: 'text', admin: { placeholder: 'e.g. Full Day, Half Day, 2 Days' } },
            {
              name: 'difficulty',
              type: 'select',
              options: [
                { label: 'Easy', value: 'easy' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'Challenging', value: 'challenging' },
              ],
            },
            { name: 'meetingPoint', type: 'text' },
            { name: 'pickupInfo', type: 'textarea' },
            {
              type: 'row',
              fields: [
                { name: 'latitude', type: 'number', admin: { width: '50%' } },
                { name: 'longitude', type: 'number', admin: { width: '50%' } },
              ],
            },
            {
              name: 'activityDetails',
              type: 'group',
              admin: { description: 'Optional metadata that varies by activity type (§31).' },
              fields: [
                { name: 'distanceKm', label: 'Distance (km)', type: 'number' },
                { name: 'elevationM', label: 'Elevation gain (m)', type: 'number' },
                { name: 'terrain', type: 'text' },
                { name: 'fitnessNote', type: 'text' },
                { name: 'equipmentProvided', type: 'text' },
                { name: 'minimumAge', type: 'number' },
                { name: 'mealIncluded', type: 'checkbox' },
              ],
            },
            {
              name: 'faqs',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        // ── SEO ────────────────────────────────────────────────────
        { label: 'SEO', fields: [seoField] },
      ],
    },
    // ── Sidebar ──────────────────────────────────────────────────
    slugField('title'),
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'experience-categories',
      admin: { position: 'sidebar' },
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      admin: { position: 'sidebar' },
    },
    {
      name: 'badge',
      type: 'select',
      options: [
        { label: 'Bestseller', value: 'bestseller' },
        { label: 'New', value: 'new' },
        { label: 'Popular', value: 'popular' },
        { label: 'Limited', value: 'limited' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Surface in "Popular Experiences" on the homepage.' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    {
      name: 'gallery',
      type: 'array',
      admin: { position: 'sidebar' },
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
  ],
}
