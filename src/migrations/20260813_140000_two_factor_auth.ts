import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_enabled" boolean DEFAULT false;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_secret" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_pending_secret" varchar;
  ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "two_factor_recovery_codes" jsonb;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "users" DROP COLUMN IF EXISTS "two_factor_enabled";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "two_factor_secret";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "two_factor_pending_secret";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "two_factor_recovery_codes";`)
}
