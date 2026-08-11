import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_event_orders_status" AS ENUM('held', 'pending_payment', 'paid', 'cancelled', 'payment_review', 'refunded', 'expired');
  CREATE TYPE "public"."enum_event_orders_inventory_state" AS ENUM('none', 'held', 'confirmed', 'released');
  CREATE TYPE "public"."enum_event_orders_source" AS ENUM('website', 'whatsapp', 'instagram', 'tiktok', 'facebook', 'phone', 'walk-in', 'corporate', 'referral', 'partner', 'other');
  CREATE TYPE "public"."enum_event_orders_payment_state" AS ENUM('paid', 'outstanding', 'refunded');
  CREATE TYPE "public"."enum_event_tickets_status" AS ENUM('valid', 'checked_in', 'void');
  CREATE TABLE "event_orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"ticket_type_name" varchar NOT NULL,
  	"unit_price" numeric NOT NULL,
  	"quantity" numeric NOT NULL
  );
  
  CREATE TABLE "event_orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"status" "enum_event_orders_status" DEFAULT 'held' NOT NULL,
  	"inventory_state" "enum_event_orders_inventory_state" DEFAULT 'none',
  	"hold_expires_at" timestamp(3) with time zone,
  	"source" "enum_event_orders_source" DEFAULT 'website' NOT NULL,
  	"event_id" integer NOT NULL,
  	"buyer_first_name" varchar NOT NULL,
  	"buyer_last_name" varchar NOT NULL,
  	"buyer_email" varchar NOT NULL,
  	"buyer_phone" varchar,
  	"quantity_total" numeric,
  	"total_amount" numeric,
  	"payment_state" "enum_event_orders_payment_state" DEFAULT 'outstanding',
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "event_tickets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"order_id" integer NOT NULL,
  	"event_id" integer NOT NULL,
  	"ticket_type_name" varchar NOT NULL,
  	"attendee_name" varchar,
  	"status" "enum_event_tickets_status" DEFAULT 'valid' NOT NULL,
  	"checked_in_at" timestamp(3) with time zone,
  	"checked_in_by_id" integer,
  	"checked_in_gate" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payments" ALTER COLUMN "booking_id" DROP NOT NULL;
  ALTER TABLE "payments" ADD COLUMN "event_order_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "event_tickets_id" integer;
  ALTER TABLE "event_orders_items" ADD CONSTRAINT "event_orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."event_orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "event_orders" ADD CONSTRAINT "event_orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_order_id_event_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."event_orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_checked_in_by_id_users_id_fk" FOREIGN KEY ("checked_in_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "event_orders_items_order_idx" ON "event_orders_items" USING btree ("_order");
  CREATE INDEX "event_orders_items_parent_id_idx" ON "event_orders_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "event_orders_reference_idx" ON "event_orders" USING btree ("reference");
  CREATE INDEX "event_orders_status_idx" ON "event_orders" USING btree ("status");
  CREATE INDEX "event_orders_inventory_state_idx" ON "event_orders" USING btree ("inventory_state");
  CREATE INDEX "event_orders_hold_expires_at_idx" ON "event_orders" USING btree ("hold_expires_at");
  CREATE INDEX "event_orders_event_idx" ON "event_orders" USING btree ("event_id");
  CREATE INDEX "event_orders_updated_at_idx" ON "event_orders" USING btree ("updated_at");
  CREATE INDEX "event_orders_created_at_idx" ON "event_orders" USING btree ("created_at");
  CREATE UNIQUE INDEX "event_tickets_reference_idx" ON "event_tickets" USING btree ("reference");
  CREATE INDEX "event_tickets_order_idx" ON "event_tickets" USING btree ("order_id");
  CREATE INDEX "event_tickets_event_idx" ON "event_tickets" USING btree ("event_id");
  CREATE INDEX "event_tickets_status_idx" ON "event_tickets" USING btree ("status");
  CREATE INDEX "event_tickets_checked_in_by_idx" ON "event_tickets" USING btree ("checked_in_by_id");
  CREATE INDEX "event_tickets_updated_at_idx" ON "event_tickets" USING btree ("updated_at");
  CREATE INDEX "event_tickets_created_at_idx" ON "event_tickets" USING btree ("created_at");
  ALTER TABLE "payments" ADD CONSTRAINT "payments_event_order_id_event_orders_id_fk" FOREIGN KEY ("event_order_id") REFERENCES "public"."event_orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_orders_fk" FOREIGN KEY ("event_orders_id") REFERENCES "public"."event_orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_event_tickets_fk" FOREIGN KEY ("event_tickets_id") REFERENCES "public"."event_tickets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payments_event_order_idx" ON "payments" USING btree ("event_order_id");
  CREATE INDEX "payload_locked_documents_rels_event_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("event_orders_id");
  CREATE INDEX "payload_locked_documents_rels_event_tickets_id_idx" ON "payload_locked_documents_rels" USING btree ("event_tickets_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "event_orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "event_tickets" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "event_orders_items" CASCADE;
  DROP TABLE "event_orders" CASCADE;
  DROP TABLE "event_tickets" CASCADE;
  ALTER TABLE "payments" DROP CONSTRAINT "payments_event_order_id_event_orders_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_event_tickets_fk";
  
  DROP INDEX "payments_event_order_idx";
  DROP INDEX "payload_locked_documents_rels_event_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_event_tickets_id_idx";
  ALTER TABLE "payments" ALTER COLUMN "booking_id" SET NOT NULL;
  ALTER TABLE "payments" DROP COLUMN "event_order_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "event_tickets_id";
  DROP TYPE "public"."enum_event_orders_status";
  DROP TYPE "public"."enum_event_orders_inventory_state";
  DROP TYPE "public"."enum_event_orders_source";
  DROP TYPE "public"."enum_event_orders_payment_state";
  DROP TYPE "public"."enum_event_tickets_status";`)
}
