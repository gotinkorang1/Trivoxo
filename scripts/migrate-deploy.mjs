/**
 * Deliberate, gated migration step (run BEFORE deploying the code that needs it).
 *
 * Schema changes are intentionally NOT part of `next build` — a build runs on
 * every deployment, including previews, so migrating from it means any preview
 * pointed at a shared DATABASE_URI silently migrates that database.
 *
 * This runner never answers a prompt for you. Payload asks exactly one question
 * during `migrate`: the "you've run in dev push mode … data loss will occur"
 * confirmation, which only appears when the target database carries a dev-push
 * marker (a `payload_migrations` row with batch = -1). Auto-accepting that hid
 * the very signal worth alerting on, so we detect it up front and refuse.
 */
import 'dotenv/config'
import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

const connectionString = process.env.DATABASE_URI

if (!connectionString) {
  console.error('DATABASE_URI is not set. Refusing to run migrations.')
  process.exit(1)
}

/**
 * libpq semantics: `require` encrypts without verifying the CA, `verify-ca` /
 * `verify-full` verify it. node-postgres verifies by default, so only relax it
 * when the connection string explicitly asked for the weaker mode (Supabase's
 * pooler hostnames commonly do).
 */
function sslOptionFor(uri) {
  const mode = /[?&]sslmode=([^&]+)/.exec(uri)?.[1]
  if (!mode || mode === 'disable') return undefined
  return mode === 'require' ? { rejectUnauthorized: false } : true
}

/** Migration names as Payload records them: the .ts filename without extension. */
function localMigrationNames() {
  return readdirSync(resolve(process.cwd(), 'src', 'migrations'))
    .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
    .map((file) => file.replace(/\.ts$/, ''))
    .sort()
}

async function readMigrationState() {
  const client = new pg.Client({ connectionString, ssl: sslOptionFor(connectionString) })
  await client.connect()
  try {
    const { rows: existsRows } = await client.query(
      `SELECT to_regclass('public.payload_migrations') IS NOT NULL AS present`,
    )
    if (!existsRows[0]?.present) return { applied: [], devPushMarkers: 0 }

    const { rows } = await client.query(`SELECT name, batch FROM payload_migrations`)
    return {
      applied: rows.map((row) => row.name).filter(Boolean),
      devPushMarkers: rows.filter((row) => Number(row.batch) === -1).length,
    }
  } finally {
    await client.end()
  }
}

function runPayloadMigrate() {
  return new Promise((resolvePromise) => {
    const payloadCli = resolve(process.cwd(), 'node_modules', 'payload', 'bin.js')
    const child = spawn(process.execPath, [payloadCli, 'migrate'], {
      env: {
        ...process.env,
        CI: 'true',
        NODE_OPTIONS: [process.env.NODE_OPTIONS, '--no-deprecation'].filter(Boolean).join(' '),
      },
      // stdin is closed: nothing can be auto-confirmed on our behalf.
      stdio: ['ignore', 'inherit', 'inherit'],
    })

    child.on('error', (error) => {
      console.error('Could not start the Payload migration runner.', error)
      resolvePromise(1)
    })
    child.on('exit', (code, signal) => {
      if (signal) {
        console.error(`Payload migration runner stopped with signal ${signal}.`)
        resolvePromise(1)
        return
      }
      resolvePromise(code ?? 1)
    })
  })
}

const local = localMigrationNames()
const before = await readMigrationState()

if (before.devPushMarkers > 0) {
  console.error(
    [
      '',
      'Refusing to migrate: this database carries a dev push-mode marker.',
      '',
      `Found ${before.devPushMarkers} payload_migrations row(s) with batch = -1, which Payload`,
      'writes only when a schema was pushed directly in dev mode. Running migrations',
      'against it is what triggers Payload’s "data loss will occur" prompt.',
      '',
      'A production database should never carry this marker. Investigate how it got',
      'there (a dev process pointed at this DATABASE_URI?) and reconcile the schema',
      'deliberately — with a backup taken first — before migrating.',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

const appliedSet = new Set(before.applied)
const pending = local.filter((name) => !appliedSet.has(name))
const unknownToCheckout = before.applied.filter((name) => !local.includes(name))

if (unknownToCheckout.length > 0) {
  console.warn(
    `Warning: the database has ${unknownToCheckout.length} migration(s) not in this checkout ` +
      `(${unknownToCheckout.join(', ')}). The database is ahead of this code — confirm you are ` +
      'not deploying a rollback over a newer schema.',
  )
}

if (pending.length === 0) {
  console.log('No pending migrations. Database schema is up to date.')
  process.exit(0)
}

console.log(`Applying ${pending.length} pending migration(s):`)
for (const name of pending) console.log(`  - ${name}`)

const exitCode = await runPayloadMigrate()

if (exitCode !== 0) {
  console.error(`Payload migration runner exited with code ${exitCode}.`)
  process.exit(exitCode)
}

// A clean exit code is not proof the work happened: if Payload ever prompts with
// stdin closed it cancels and exits 0. Verify against the database instead.
const after = await readMigrationState()
const stillMissing = pending.filter((name) => !after.applied.includes(name))

if (stillMissing.length > 0) {
  console.error(
    `Migration runner exited cleanly but ${stillMissing.length} migration(s) were not recorded: ` +
      `${stillMissing.join(', ')}. Treat this deployment as not migrated.`,
  )
  process.exit(1)
}

console.log(`Applied ${pending.length} migration(s) successfully.`)
