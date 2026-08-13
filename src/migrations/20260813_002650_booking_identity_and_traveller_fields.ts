import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_bookings_traveller_identity_nationality" AS ENUM('ghanaian', 'foreign');
  CREATE TYPE "public"."enum_bookings_traveller_identity_booker_age" AS ENUM('18-plus', '13-17');
  ALTER TABLE "bookings" ALTER COLUMN "adults" SET DEFAULT 4;
  ALTER TABLE "bookings" ADD COLUMN "young_children" numeric DEFAULT 0;
  ALTER TABLE "bookings" ADD COLUMN "pickup_time" varchar;
  ALTER TABLE "bookings" ADD COLUMN "traveller_identity_nationality" "enum_bookings_traveller_identity_nationality";
  ALTER TABLE "bookings" ADD COLUMN "traveller_identity_ghana_card_number" varchar;
  ALTER TABLE "bookings" ADD COLUMN "traveller_identity_passport_number" varchar;
  ALTER TABLE "bookings" ADD COLUMN "traveller_identity_booker_age" "enum_bookings_traveller_identity_booker_age";
  ALTER TABLE "bookings" ADD COLUMN "traveller_identity_consent_adult_name" varchar;
  ALTER TABLE "bookings" ADD COLUMN "traveller_identity_consent_adult_phone" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bookings" ALTER COLUMN "adults" SET DEFAULT 2;
  ALTER TABLE "bookings" DROP COLUMN "young_children";
  ALTER TABLE "bookings" DROP COLUMN "pickup_time";
  ALTER TABLE "bookings" DROP COLUMN "traveller_identity_nationality";
  ALTER TABLE "bookings" DROP COLUMN "traveller_identity_ghana_card_number";
  ALTER TABLE "bookings" DROP COLUMN "traveller_identity_passport_number";
  ALTER TABLE "bookings" DROP COLUMN "traveller_identity_booker_age";
  ALTER TABLE "bookings" DROP COLUMN "traveller_identity_consent_adult_name";
  ALTER TABLE "bookings" DROP COLUMN "traveller_identity_consent_adult_phone";
  DROP TYPE "public"."enum_bookings_traveller_identity_nationality";
  DROP TYPE "public"."enum_bookings_traveller_identity_booker_age";`)
}
