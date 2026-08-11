import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudinary_public_id" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudinary_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudinary_resource_type" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudinary_format" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "cloudinary_version" numeric;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "original_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "transformed_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_cloudinary_public_id" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_cloudinary_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_cloudinary_resource_type" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_cloudinary_format" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_cloudinary_version" numeric;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_original_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_thumbnail_transformed_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_cloudinary_public_id" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_cloudinary_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_cloudinary_resource_type" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_cloudinary_format" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_cloudinary_version" numeric;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_original_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_card_transformed_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero_cloudinary_public_id" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero_cloudinary_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero_cloudinary_resource_type" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero_cloudinary_format" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero_cloudinary_version" numeric;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero_original_url" varchar;
  ALTER TABLE "media" ADD COLUMN IF NOT EXISTS "sizes_hero_transformed_url" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudinary_public_id";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudinary_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudinary_resource_type";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudinary_format";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "cloudinary_version";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "original_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "transformed_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_cloudinary_public_id";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_cloudinary_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_cloudinary_resource_type";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_cloudinary_format";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_cloudinary_version";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_original_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_thumbnail_transformed_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_cloudinary_public_id";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_cloudinary_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_cloudinary_resource_type";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_cloudinary_format";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_cloudinary_version";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_original_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_card_transformed_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero_cloudinary_public_id";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero_cloudinary_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero_cloudinary_resource_type";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero_cloudinary_format";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero_cloudinary_version";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero_original_url";
  ALTER TABLE "media" DROP COLUMN IF EXISTS "sizes_hero_transformed_url";`)
}
