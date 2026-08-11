import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Close Supabase's auto-exposed REST API over the Payload schema.
 *
 * Supabase serves the `public` schema through PostgREST using the `anon` and
 * `authenticated` roles, and its default privileges grant those roles full
 * CRUD on every table created by the owner. Payload creates its tables that
 * way, so on 2026-08-11 the production database answered an unauthenticated
 * request for `/rest/v1/bookings` with real customer rows, and accepted
 * DELETE. Row Level Security was off on all 70 tables, so nothing stopped it.
 *
 * Payload never uses PostgREST - it connects directly as the owner role - so
 * removing this access costs the application nothing.
 *
 * Revoking the DEFAULT privileges is the part that actually matters: without
 * it, every table a future migration creates is granted to `anon` again.
 *
 * Guarded on role existence because `anon` and `authenticated` are Supabase
 * roles. Local Docker Postgres and CI have neither, and REVOKE on a missing
 * role aborts the migration.
 */
export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $revoke$
    DECLARE
      target text;
    BEGIN
      FOREACH target IN ARRAY ARRAY['anon', 'authenticated'] LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = target) THEN
          EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', target);
          EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', target);
          EXECUTE format('REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM %I', target);
          EXECUTE format('REVOKE USAGE ON SCHEMA public FROM %I', target);
          EXECUTE format(
            'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', target);
          EXECUTE format(
            'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', target);
          EXECUTE format(
            'ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM %I', target);
        END IF;
      END LOOP;
    END
    $revoke$;`)
}

/**
 * Deliberately does nothing.
 *
 * The inverse of this migration is "publish every booking, payment and admin
 * user to the internet". A rollback should never do that silently. If the
 * grants are ever genuinely wanted, grant them explicitly - and enable Row
 * Level Security first.
 */
export async function down({ db: _db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  // Intentionally empty - see the note above.
}
