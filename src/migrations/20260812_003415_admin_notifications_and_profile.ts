import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_admin_notifications_category" AS ENUM('booking', 'payment', 'review', 'enquiry', 'event_order', 'account');
  CREATE TYPE "public"."enum_admin_notifications_email_status" AS ENUM('pending', 'sent', 'skipped', 'failed');
  CREATE TABLE "admin_notifications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient_id" integer NOT NULL,
  	"category" "enum_admin_notifications_category" NOT NULL,
  	"title" varchar NOT NULL,
  	"message" varchar,
  	"admin_u_r_l" varchar,
  	"read_at" timestamp(3) with time zone,
  	"dedupe_key" varchar NOT NULL,
  	"email_status" "enum_admin_notifications_email_status" DEFAULT 'pending' NOT NULL,
  	"email_error" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "avatar_id" integer;
  ALTER TABLE "users" ADD COLUMN "email_alerts" boolean DEFAULT true;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "admin_notifications_id" integer;
  ALTER TABLE "admin_notifications" ADD CONSTRAINT "admin_notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "admin_notifications_recipient_idx" ON "admin_notifications" USING btree ("recipient_id");
  CREATE INDEX "admin_notifications_category_idx" ON "admin_notifications" USING btree ("category");
  CREATE INDEX "admin_notifications_read_at_idx" ON "admin_notifications" USING btree ("read_at");
  CREATE UNIQUE INDEX "admin_notifications_dedupe_key_idx" ON "admin_notifications" USING btree ("dedupe_key");
  CREATE INDEX "admin_notifications_email_status_idx" ON "admin_notifications" USING btree ("email_status");
  CREATE INDEX "admin_notifications_updated_at_idx" ON "admin_notifications" USING btree ("updated_at");
  CREATE INDEX "admin_notifications_created_at_idx" ON "admin_notifications" USING btree ("created_at");
  ALTER TABLE "users" ADD CONSTRAINT "users_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admin_notifications_fk" FOREIGN KEY ("admin_notifications_id") REFERENCES "public"."admin_notifications"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_avatar_idx" ON "users" USING btree ("avatar_id");
  CREATE INDEX "payload_locked_documents_rels_admin_notifications_id_idx" ON "payload_locked_documents_rels" USING btree ("admin_notifications_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "admin_notifications" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "admin_notifications" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_avatar_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_admin_notifications_fk";
  
  DROP INDEX "users_avatar_idx";
  DROP INDEX "payload_locked_documents_rels_admin_notifications_id_idx";
  ALTER TABLE "users" DROP COLUMN "avatar_id";
  ALTER TABLE "users" DROP COLUMN "email_alerts";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "admin_notifications_id";
  DROP TYPE "public"."enum_admin_notifications_category";
  DROP TYPE "public"."enum_admin_notifications_email_status";`)
}
