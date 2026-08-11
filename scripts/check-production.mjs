/**
 * Plain-English production readiness check.
 *
 * Run this against an environment BEFORE trusting it with real customers:
 *
 *   npm run check:production
 *
 * It never prints secret values - only whether each one is present and shaped
 * correctly. Exit code 1 means "do not take real payments yet".
 */
import 'dotenv/config'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

const results = []
const pass = (label, detail) => results.push({ level: 'pass', label, detail })
const warn = (label, detail, fix) => results.push({ level: 'warn', label, detail, fix })
const fail = (label, detail, fix) => results.push({ level: 'fail', label, detail, fix })
const unknown = (label, detail) => results.push({ level: 'unknown', label, detail })

const env = process.env
const has = (key) => typeof env[key] === 'string' && env[key].trim().length > 0

/**
 * `vercel env pull` returns the literal string "[SENSITIVE]" instead of the real
 * value for any variable marked Sensitive. Treating that as the value produces
 * confident, completely wrong verdicts ("your live keys are test keys"), so any
 * check that depends on the CONTENT of a redacted value must report "cannot
 * verify" rather than pass or fail. Presence checks stay valid - the variable
 * really is set.
 */
const REDACTED = '[SENSITIVE]'
const isRedacted = (key) => env[key] === REDACTED
const redactedCount = Object.keys(env).filter((k) => env[k] === REDACTED).length
const CANNOT_VERIFY = 'Value is hidden by Vercel, so it cannot be checked from here.'

/* ── Core identity ──────────────────────────────────────────────────────── */

const serverUrl = env.NEXT_PUBLIC_SERVER_URL
if (!serverUrl) {
  fail('Website address', 'NEXT_PUBLIC_SERVER_URL is not set.', 'Set it to your live address, e.g. https://trivoxogh.com')
} else if (serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1')) {
  fail('Website address', `Still points at your own computer (${serverUrl}).`, 'Set it to your live https:// address.')
} else if (!serverUrl.startsWith('https://')) {
  fail('Website address', `Not secure (${serverUrl}).`, 'Live sites must use https://')
} else {
  pass('Website address', serverUrl)
}

if (!has('PAYLOAD_SECRET')) {
  fail('Login security key', 'PAYLOAD_SECRET is not set.', 'Generate one: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"')
} else if (isRedacted('PAYLOAD_SECRET')) {
  unknown('Login security key', `Set. ${CANNOT_VERIFY}`)
} else if (env.PAYLOAD_SECRET.length < 32) {
  fail('Login security key', 'PAYLOAD_SECRET is too short to be safe.', 'Use a 64-character random value.')
} else {
  pass('Login security key', 'Set and long enough.')
}

if (!has('CRON_SECRET')) {
  fail(
    'Scheduled-jobs password',
    'CRON_SECRET is not set, so automatic seat-release and email sending are unprotected.',
    'Set a random 16+ character value in Vercel.',
  )
} else if (isRedacted('CRON_SECRET')) {
  unknown('Scheduled-jobs password', `Set. ${CANNOT_VERIFY}`)
} else if (env.CRON_SECRET.length < 16) {
  warn('Scheduled-jobs password', 'CRON_SECRET is shorter than 16 characters.', 'Use a longer random value.')
} else {
  pass('Scheduled-jobs password', 'Set and long enough.')
}

/* ── Payments ───────────────────────────────────────────────────────────── */

const mode = env.PAYSTACK_MODE === 'live' ? 'live' : 'test'
const secretKey = env.PAYSTACK_SECRET_KEY ?? ''
const publicKey = env.PAYSTACK_PUBLIC_KEY ?? ''
const browserKey = env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? ''

if (!secretKey || !publicKey) {
  fail('Paystack payments', 'Paystack keys are missing - customers cannot pay.', 'Add PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY.')
} else if (isRedacted('PAYSTACK_SECRET_KEY') || isRedacted('PAYSTACK_PUBLIC_KEY')) {
  unknown(
    'Paystack payments',
    `Keys are set and PAYSTACK_MODE is "${mode}", but the key values are hidden by Vercel. ` +
      `Whether they are ${mode} keys cannot be checked from here - the app enforces this at runtime.`,
  )
} else if (mode === 'test') {
  const consistent = secretKey.startsWith('sk_test_') && publicKey.startsWith('pk_test_')
  if (!consistent) {
    fail('Paystack payments', 'PAYSTACK_MODE is "test" but the keys are not test keys.', 'Use sk_test_/pk_test_ keys, or set PAYSTACK_MODE=live.')
  } else {
    warn(
      'Paystack payments',
      'Running in TEST mode - real customers cannot actually pay.',
      'When your Paystack account is verified, set PAYSTACK_MODE=live and swap in the sk_live_/pk_live_ keys.',
    )
  }
} else {
  const consistent = secretKey.startsWith('sk_live_') && publicKey.startsWith('pk_live_')
  if (!consistent) {
    fail('Paystack payments', 'PAYSTACK_MODE is "live" but the keys are not live keys.', 'Use sk_live_/pk_live_ keys from your verified Paystack account.')
  } else {
    pass('Paystack payments', 'LIVE mode with live keys - real money will move.')
  }
}

if (browserKey && publicKey && browserKey !== publicKey) {
  fail('Paystack payments', 'The browser key and server public key do not match.', 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY must equal PAYSTACK_PUBLIC_KEY.')
}
if (secretKey && browserKey.startsWith('sk_')) {
  fail('Paystack payments', 'A SECRET key is exposed to the browser.', 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY must be the pk_ key, never sk_.')
}

/* ── Email, media, monitoring ───────────────────────────────────────────── */

if (!has('RESEND_API_KEY')) {
  warn('Customer emails', 'RESEND_API_KEY is not set - booking confirmations will NOT be emailed.', 'Add a Resend key and verify your sending domain.')
} else if (!has('EMAIL_FROM')) {
  warn('Customer emails', 'RESEND_API_KEY is set but EMAIL_FROM is missing.', 'Set EMAIL_FROM, e.g. "Trivoxo <hello@yourdomain.com>".')
} else {
  pass('Customer emails', 'Resend configured.')
}

const cloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
const cloudinarySet = cloudinary.filter(has)
if (cloudinarySet.length === 0) {
  warn(
    'Uploaded photos',
    'Cloudinary is not configured - images uploaded in the admin will be lost on each deploy.',
    'Add the three CLOUDINARY_ values.',
  )
} else if (cloudinarySet.length < 3) {
  fail('Uploaded photos', 'Cloudinary is only partly configured.', `Missing: ${cloudinary.filter((k) => !has(k)).join(', ')}`)
} else {
  pass('Uploaded photos', 'Cloudinary configured.')
}

if (!has('NEXT_PUBLIC_SENTRY_DSN')) {
  warn('Error alerts', 'Sentry is not configured - you will not be told when something breaks.', 'Optional, but recommended before launch.')
} else {
  pass('Error alerts', 'Sentry configured.')
}

if (!has('KV_REST_API_URL') || !has('KV_REST_API_TOKEN')) {
  warn(
    'Spam protection',
    'Upstash Redis is not configured - rate limiting falls back to per-server memory.',
    'Optional, but recommended so booking forms cannot be flooded.',
  )
} else {
  pass('Spam protection', 'Distributed rate limiting configured.')
}

/* ── Database ───────────────────────────────────────────────────────────── */

function sslOptionFor(uri) {
  const m = /[?&]sslmode=([^&]+)/.exec(uri)?.[1]
  if (!m || m === 'disable') return undefined
  return m === 'require' ? { rejectUnauthorized: false } : true
}

const uri = env.DATABASE_URI
if (!uri) {
  fail('Database', 'DATABASE_URI is not set.', 'Add your Supabase connection pooler URI.')
} else if (isRedacted('DATABASE_URI')) {
  unknown('Database', `Set. ${CANNOT_VERIFY} Schema state cannot be checked from here either.`)
} else {
  const isLocal = uri.includes('localhost') || uri.includes('127.0.0.1')
  if (isLocal) {
    fail('Database', 'Still pointing at the local Docker database on your computer.', 'Use the Supabase connection pooler URI for production.')
  }

  try {
    const client = new pg.Client({ connectionString: uri, ssl: sslOptionFor(uri) })
    await client.connect()
    try {
      if (!isLocal) pass('Database', 'Connected successfully.')

      const { rows: present } = await client.query(
        `SELECT to_regclass('public.payload_migrations') IS NOT NULL AS present`,
      )
      if (!present[0]?.present) {
        fail('Database schema', 'No tables have been created yet.', 'Run: npm run migrate:deploy')
      } else {
        const { rows } = await client.query(`SELECT name, batch FROM payload_migrations`)
        const applied = rows.map((r) => r.name).filter(Boolean)
        const devPush = rows.filter((r) => Number(r.batch) === -1).length

        const local = readdirSync(resolve(process.cwd(), 'src', 'migrations'))
          .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
          .map((f) => f.replace(/\.ts$/, ''))
        const pending = local.filter((n) => !applied.includes(n))

        if (devPush > 0) {
          fail(
            'Database schema',
            'This database was changed directly in development mode, which is unsafe for production.',
            'Do not migrate it blindly - see the Deployment section of README.md.',
          )
        }
        if (pending.length > 0) {
          fail('Database schema', `${pending.length} schema update(s) have not been applied.`, 'Run: npm run migrate:deploy')
        } else if (devPush === 0) {
          pass('Database schema', `Up to date (${applied.length} applied).`)
        }
      }
    } finally {
      await client.end()
    }
  } catch (error) {
    fail('Database', `Could not connect: ${error.message}`, 'Check DATABASE_URI and that the database allows connections.')
  }
}

/* ── Report ─────────────────────────────────────────────────────────────── */

const icon = { pass: 'OK  ', warn: 'WARN', fail: 'STOP', unknown: '????' }
const order = { fail: 0, warn: 1, unknown: 2, pass: 3 }
results.sort((a, b) => order[a.level] - order[b.level])

console.log('\nTrivoxo production readiness\n' + '='.repeat(60))

if (redactedCount > 0) {
  console.log(
    `\nNOTE: ${redactedCount} value(s) are hidden because Vercel does not release\n` +
      'variables marked "Sensitive". Those are reported as ???? (cannot verify),\n' +
      'never as pass or fail. Presence is still confirmed.',
  )
}

for (const r of results) {
  console.log(`\n[${icon[r.level]}] ${r.label}`)
  console.log(`       ${r.detail}`)
  if (r.fix) console.log(`       -> ${r.fix}`)
}

const fails = results.filter((r) => r.level === 'fail').length
const warns = results.filter((r) => r.level === 'warn').length
const unknowns = results.filter((r) => r.level === 'unknown').length

console.log('\n' + '='.repeat(60))
if (fails > 0) {
  console.log(`${fails} blocking problem(s), ${warns} warning(s), ${unknowns} unverifiable.`)
  console.log('NOT ready to take real customer payments yet.\n')
  process.exit(1)
}
console.log(`No blocking problems. ${warns} warning(s), ${unknowns} unverifiable.`)
if (unknowns > 0) {
  console.log('Some settings could not be checked from here - see ???? items above.\n')
} else {
  console.log('Ready to take real customer payments.\n')
}
