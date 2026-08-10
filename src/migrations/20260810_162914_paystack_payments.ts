import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_payments_gateway" AS ENUM('paystack');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('initializing', 'initialized', 'pending', 'succeeded', 'failed', 'abandoned', 'review', 'refunded');
  CREATE TYPE "public"."enum_payments_currency" AS ENUM('GHS');
  ALTER TYPE "public"."enum_bookings_status" ADD VALUE 'payment_review' BEFORE 'confirmed';
  CREATE TABLE "payments" (
    "id" serial PRIMARY KEY NOT NULL,
    "reference" varchar NOT NULL,
    "booking_id" integer NOT NULL,
    "gateway" "enum_payments_gateway" DEFAULT 'paystack' NOT NULL,
    "status" "enum_payments_status" DEFAULT 'initializing' NOT NULL,
    "amount_minor" numeric NOT NULL,
    "currency" "enum_payments_currency" DEFAULT 'GHS' NOT NULL,
    "gateway_reference" varchar,
    "gateway_transaction_id" varchar,
    "channel" varchar,
    "checkout_u_r_l" varchar,
    "paid_at" timestamp(3) with time zone,
    "last_verified_at" timestamp(3) with time zone,
    "review_reason" varchar,
    "failure_reason" varchar,
    "verification_snapshot" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "payments_id" integer;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "payments_reference_idx" ON "payments" USING btree ("reference");
  CREATE INDEX "payments_booking_idx" ON "payments" USING btree ("booking_id");
  CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");
  CREATE INDEX "payments_gateway_reference_idx" ON "payments" USING btree ("gateway_reference");
  CREATE INDEX "payments_gateway_transaction_id_idx" ON "payments" USING btree ("gateway_transaction_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_payments_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_payments_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "payments_id";
  ALTER TABLE "payments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payments" CASCADE;

  UPDATE "bookings" SET "status" = 'cancelled' WHERE "status" = 'payment_review';
  ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_bookings_status";
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('draft', 'held', 'pending_payment', 'paid', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refund_pending', 'partially_refunded', 'refunded', 'expired', 'no_show');
  ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_bookings_status";
  ALTER TABLE "bookings" ALTER COLUMN "status" SET DATA TYPE "public"."enum_bookings_status" USING "status"::"public"."enum_bookings_status";
  DROP TYPE "public"."enum_payments_gateway";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_payments_currency";`)
}
