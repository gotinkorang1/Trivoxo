/**
 * Option lists for the public enquiry forms. Values MUST match the enum slugs
 * in the CorporateEnquiries / CustomTripRequests collections, or Payload will
 * reject the create.
 */

export const EVENT_TYPES = [
  { value: 'conference', label: 'Conference' },
  { value: 'corporate-retreat', label: 'Corporate Retreat' },
  { value: 'company-outing', label: 'Company Outing' },
  { value: 'team-building', label: 'Team Building' },
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'private-event', label: 'Private Event' },
  { value: 'other', label: 'Other' },
] as const

export const CORPORATE_SERVICES = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'transport', label: 'Transport' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'av', label: 'AV' },
  { value: 'photography', label: 'Photography' },
  { value: 'branding', label: 'Branding' },
  { value: 'registration', label: 'Registration' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'security', label: 'Security' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'event-staffing', label: 'Event staffing' },
] as const

export const TRIP_INTERESTS = [
  { value: 'history', label: 'History' },
  { value: 'culture', label: 'Culture' },
  { value: 'food', label: 'Food' },
  { value: 'hiking', label: 'Hiking' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'beaches', label: 'Beaches' },
  { value: 'nature', label: 'Nature' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'art', label: 'Art' },
  { value: 'wellness', label: 'Wellness' },
] as const

export const EVENT_TYPE_VALUES = EVENT_TYPES.map((o) => o.value)
export const CORPORATE_SERVICE_VALUES = CORPORATE_SERVICES.map((o) => o.value)
export const TRIP_INTEREST_VALUES = TRIP_INTERESTS.map((o) => o.value)
