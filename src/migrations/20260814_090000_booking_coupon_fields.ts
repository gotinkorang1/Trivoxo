import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "coupon_code" varchar;
  ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "coupon_discount" numeric;
  ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "coupon_redeemed" boolean DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "bookings" DROP COLUMN IF EXISTS "coupon_code";
  ALTER TABLE "bookings" DROP COLUMN IF EXISTS "coupon_discount";
  ALTER TABLE "bookings" DROP COLUMN IF EXISTS "coupon_redeemed";`)
}
