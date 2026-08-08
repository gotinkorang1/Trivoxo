/**
 * Travel services (§70–§73). One config drives the index cards, the per-service
 * pages and the enquiry form fields. `serviceType` matches the
 * TravelServiceRequests collection enum; `slug` matches the route + footer links.
 */
import { Plane, PlaneTakeoff, BedDouble, Car, type LucideIcon } from 'lucide-react'

export type ServiceField = {
  name: string
  label: string
  type?: 'text' | 'date' | 'number' | 'select' | 'textarea'
  options?: { value: string; label: string }[]
  placeholder?: string
  full?: boolean
}

export type TravelService = {
  slug: string
  serviceType: string
  title: string
  blurb: string
  icon: LucideIcon
  gradient: string
  submitLabel: string
  fields: ServiceField[]
}

const sel = (values: string[]) => values.map((v) => ({ value: v.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label: v }))

export const TRAVEL_SERVICES: TravelService[] = [
  {
    slug: 'airport-transfers',
    serviceType: 'airport-transfer',
    title: 'Airport Transfers',
    blurb: 'Professional drivers and comfortable vehicles — arrive and depart stress-free.',
    icon: Plane,
    gradient: 'linear-gradient(135deg,#0e2a4d,#2f7fb8)',
    submitLabel: 'Request a transfer',
    fields: [
      { name: 'direction', label: 'Direction', type: 'select', options: sel(['Pickup from airport', 'Drop-off to airport']) },
      { name: 'airport', label: 'Airport', type: 'text', placeholder: 'e.g. Kotoka International' },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'time', label: 'Time', type: 'text', placeholder: 'e.g. 14:30' },
      { name: 'flightNumber', label: 'Flight number', type: 'text' },
      { name: 'destination', label: 'Other location', type: 'text', placeholder: 'City address / hotel' },
      { name: 'passengers', label: 'Passengers', type: 'number' },
      { name: 'vehicle', label: 'Vehicle', type: 'select', options: sel(['Sedan', 'SUV', 'Van', 'Bus']) },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
  {
    slug: 'flights',
    serviceType: 'flights',
    title: 'Local & International Ticketing',
    blurb: 'Fast, reliable ticketing support — tell us your route and we’ll send options.',
    icon: PlaneTakeoff,
    gradient: 'linear-gradient(135deg,#13273a,#1e3350)',
    submitLabel: 'Request flight options',
    fields: [
      { name: 'tripType', label: 'Trip type', type: 'select', options: sel(['One way', 'Return', 'Multi-city']) },
      { name: 'from', label: 'Departure city', type: 'text' },
      { name: 'to', label: 'Destination', type: 'text' },
      { name: 'departDate', label: 'Departure date', type: 'date' },
      { name: 'returnDate', label: 'Return date', type: 'date' },
      { name: 'adults', label: 'Adults', type: 'number' },
      { name: 'children', label: 'Children', type: 'number' },
      { name: 'infants', label: 'Infants', type: 'number' },
      { name: 'cabin', label: 'Cabin', type: 'select', options: sel(['Economy', 'Premium Economy', 'Business', 'First']) },
      { name: 'airline', label: 'Preferred airline', type: 'text' },
      { name: 'baggage', label: 'Baggage', type: 'text', placeholder: 'e.g. 2 checked bags' },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
  {
    slug: 'accommodation',
    serviceType: 'accommodation',
    title: 'Hotel & Accommodation',
    blurb: 'Selected hotels and serviced apartments across Ghana for comfort and convenience.',
    icon: BedDouble,
    gradient: 'linear-gradient(135deg,#4d3a12,#f5b133)',
    submitLabel: 'Request accommodation',
    fields: [
      { name: 'location', label: 'Location', type: 'text', placeholder: 'City / area' },
      { name: 'checkIn', label: 'Check-in', type: 'date' },
      { name: 'checkOut', label: 'Check-out', type: 'date' },
      { name: 'guests', label: 'Guests', type: 'number' },
      { name: 'roomType', label: 'Room type', type: 'select', options: sel(['Standard', 'Deluxe', 'Suite', 'Serviced apartment']) },
      { name: 'budget', label: 'Budget per night', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
  {
    slug: 'car-rentals',
    serviceType: 'car-rental',
    title: 'Car Rentals',
    blurb: 'Clean, well-maintained vehicles with experienced support — personal or corporate.',
    icon: Car,
    gradient: 'linear-gradient(135deg,#133a4d,#2a9fb8)',
    submitLabel: 'Request a vehicle',
    fields: [
      { name: 'vehicleType', label: 'Vehicle type', type: 'select', options: sel(['Sedan', 'SUV', 'Van', 'Luxury']) },
      { name: 'pickupLocation', label: 'Pickup location', type: 'text' },
      { name: 'startDate', label: 'Start date', type: 'date' },
      { name: 'endDate', label: 'End date', type: 'date' },
      { name: 'driver', label: 'Driver', type: 'select', options: sel(['With driver', 'Self-drive']) },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
]

export function getServiceBySlug(slug: string): TravelService | undefined {
  return TRAVEL_SERVICES.find((s) => s.slug === slug)
}
