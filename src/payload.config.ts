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
// Events
import { Events } from './collections/Events'
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
      beforeDashboard: ['/components/admin/dashboard-stats#DashboardStats'],
    },
  },
  collections: [
    // System
    Users,
    Media,
    // Catalogue
    Destinations,
    ExperienceCategories,
    Experiences,
    Reviews,
    // Operations
    Departures,
    Bookings,
    Customers,
    Coupons,
    // Events
    Events,
    // Content
    Posts,
    Pages,
    NewsletterSubscribers,
    // Enquiries
    CorporateEnquiries,
    CustomTripRequests,
    TravelServiceRequests,
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
