import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// System / media
import { Users } from './collections/Users'
import { Media } from './collections/Media'
// Catalogue
import { Destinations } from './collections/Destinations'
import { ExperienceCategories } from './collections/ExperienceCategories'
import { Experiences } from './collections/Experiences'
import { Reviews } from './collections/Reviews'
// Operations
import { Bookings } from './collections/Bookings'
import { Departures } from './collections/Departures'
import { Customers } from './collections/Customers'
import { Coupons } from './collections/Coupons'
import { Payments } from './collections/Payments'
import { Notifications } from './collections/Notifications'
// Events
import { Events } from './collections/Events'
import { EventOrders } from './collections/EventOrders'
import { EventTickets } from './collections/EventTickets'
// Content
import { Posts } from './collections/Posts'
import { Pages } from './collections/Pages'
import { NewsletterSubscribers } from './collections/NewsletterSubscribers'
// Enquiries
import { CorporateEnquiries } from './collections/CorporateEnquiries'
import { CustomTripRequests } from './collections/CustomTripRequests'
import { TravelServiceRequests } from './collections/TravelServiceRequests'
// Globals
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: '— Trivoxo Admin',
    },
    components: {
      graphics: {
        Icon: '/components/admin/dashboard-stats#AdminIcon',
        Logo: '/components/admin/dashboard-stats#AdminLogo',
      },
      views: {
        dashboard: {
          Component: '/components/admin/dashboard-stats#AdminDashboard',
        },
        checkIn: {
          Component: '/components/admin/check-in-view#CheckInView',
          path: '/check-in',
        },
      },
      afterNavLinks: ['/components/admin/check-in-nav#CheckInNavLink'],
    },
  },
  collections: [
    // Operations
    Departures,
    Bookings,
    Payments,
    Notifications,
    Customers,
    Coupons,
    // Enquiries
    CorporateEnquiries,
    CustomTripRequests,
    TravelServiceRequests,
    // Catalogue
    Experiences,
    Destinations,
    ExperienceCategories,
    Reviews,
    // Events
    Events,
    EventOrders,
    EventTickets,
    // Content
    Media,
    Posts,
    Pages,
    NewsletterSubscribers,
    // System
    Users,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  localization: {
    locales: ['en'],
    fallback: true,
    defaultLocale: 'en',
  },
})
