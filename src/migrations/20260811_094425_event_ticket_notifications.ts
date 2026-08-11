import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'event_tickets_issued';
  ALTER TABLE "notifications" ADD COLUMN "event_order_id" integer;
  ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_order_id_event_orders_id_fk" FOREIGN KEY ("event_order_id") REFERENCES "public"."event_orders"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "notifications_event_order_idx" ON "notifications" USING btree ("event_order_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "notifications" DROP CONSTRAINT "notifications_event_order_id_event_orders_id_fk";
  DELETE FROM "notifications" WHERE "type" = 'event_tickets_issued';

  ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'booking_confirmed'::text;
  DROP TYPE "public"."enum_notifications_type";
  CREATE TYPE "public"."enum_notifications_type" AS ENUM('booking_confirmed');
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'booking_confirmed'::"public"."enum_notifications_type";
  ALTER TABLE "notifications" ALTER COLUMN "type" SET DATA TYPE "public"."enum_notifications_type" USING "type"::"public"."enum_notifications_type";
  DROP INDEX "notifications_event_order_idx";
  ALTER TABLE "notifications" DROP COLUMN "event_order_id";`)
}
