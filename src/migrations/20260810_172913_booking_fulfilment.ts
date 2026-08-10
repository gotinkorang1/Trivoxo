import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_notifications_type" AS ENUM('booking_confirmed');
  CREATE TYPE "public"."enum_notifications_status" AS ENUM('queued', 'processing', 'sent', 'failed', 'dead_letter');
  CREATE TABLE "notifications" (
    "id" serial PRIMARY KEY NOT NULL,
    "notification_key" varchar NOT NULL,
    "type" "enum_notifications_type" DEFAULT 'booking_confirmed' NOT NULL,
    "status" "enum_notifications_status" DEFAULT 'queued' NOT NULL,
    "booking_id" integer,
    "recipient" varchar NOT NULL,
    "access_expires_at" timestamp(3) with time zone NOT NULL,
    "payload_snapshot" jsonb NOT NULL,
    "attempts" numeric DEFAULT 0 NOT NULL,
    "next_attempt_at" timestamp(3) with time zone,
    "locked_at" timestamp(3) with time zone,
    "sent_at" timestamp(3) with time zone,
    "provider_message_id" varchar,
    "last_error" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "notifications_id" integer;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "notifications_notification_key_idx" ON "notifications" USING btree ("notification_key");
  CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");
  CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");
  CREATE INDEX "notifications_booking_idx" ON "notifications" USING btree ("booking_id");
  CREATE INDEX "notifications_recipient_idx" ON "notifications" USING btree ("recipient");
  CREATE INDEX "notifications_next_attempt_at_idx" ON "notifications" USING btree ("next_attempt_at");
  CREATE INDEX "notifications_locked_at_idx" ON "notifications" USING btree ("locked_at");
  CREATE INDEX "notifications_sent_at_idx" ON "notifications" USING btree ("sent_at");
  CREATE INDEX "notifications_updated_at_idx" ON "notifications" USING btree ("updated_at");
  CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_notifications_fk" FOREIGN KEY ("notifications_id") REFERENCES "public"."notifications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("notifications_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_notifications_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_notifications_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "notifications_id";
  ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "notifications" CASCADE;
  DROP TYPE "public"."enum_notifications_type";
  DROP TYPE "public"."enum_notifications_status";`)
}
