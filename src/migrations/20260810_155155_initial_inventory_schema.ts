import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('super-admin', 'operations', 'content-editor', 'event-manager', 'finance', 'checkin');
  CREATE TYPE "public"."enum_media_category" AS ENUM('accra', 'cape-coast', 'volta', 'eastern-region', 'hiking', 'cycling', 'corporate', 'events', 'food', 'people', 'other');
  CREATE TYPE "public"."enum_destinations_region" AS ENUM('Greater Accra', 'Central Region', 'Volta Region', 'Eastern Region', 'Ashanti Region', 'Western Region', 'Northern Region', 'Other');
  CREATE TYPE "public"."enum_destinations_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__destinations_v_version_region" AS ENUM('Greater Accra', 'Central Region', 'Volta Region', 'Eastern Region', 'Ashanti Region', 'Western Region', 'Northern Region', 'Other');
  CREATE TYPE "public"."enum__destinations_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__destinations_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_experiences_weekdays" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum_experiences_pricing_strategy" AS ENUM('fixed', 'tiered', 'per-group', 'private', 'quote');
  CREATE TYPE "public"."enum_experiences_availability_type" AS ENUM('everyday', 'weekdays', 'specific-dates', 'on-request', 'private-only');
  CREATE TYPE "public"."enum_experiences_difficulty" AS ENUM('easy', 'moderate', 'challenging');
  CREATE TYPE "public"."enum_experiences_badge" AS ENUM('bestseller', 'new', 'popular', 'limited');
  CREATE TYPE "public"."enum_experiences_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experiences_v_version_weekdays" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TYPE "public"."enum__experiences_v_version_pricing_strategy" AS ENUM('fixed', 'tiered', 'per-group', 'private', 'quote');
  CREATE TYPE "public"."enum__experiences_v_version_availability_type" AS ENUM('everyday', 'weekdays', 'specific-dates', 'on-request', 'private-only');
  CREATE TYPE "public"."enum__experiences_v_version_difficulty" AS ENUM('easy', 'moderate', 'challenging');
  CREATE TYPE "public"."enum__experiences_v_version_badge" AS ENUM('bestseller', 'new', 'popular', 'limited');
  CREATE TYPE "public"."enum__experiences_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__experiences_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_reviews_traveller_type" AS ENUM('solo', 'couples', 'friends', 'family', 'corporate');
  CREATE TYPE "public"."enum_reviews_status" AS ENUM('pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_departures_status" AS ENUM('scheduled', 'closed', 'sold-out', 'cancelled');
  CREATE TYPE "public"."enum_bookings_guests_category" AS ENUM('adult', 'child', 'infant');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('draft', 'held', 'pending_payment', 'paid', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refund_pending', 'partially_refunded', 'refunded', 'expired', 'no_show');
  CREATE TYPE "public"."enum_bookings_source" AS ENUM('website', 'whatsapp', 'instagram', 'tiktok', 'facebook', 'phone', 'walk-in', 'corporate', 'referral', 'partner', 'other');
  CREATE TYPE "public"."enum_bookings_inventory_state" AS ENUM('none', 'held', 'confirmed', 'released');
  CREATE TYPE "public"."enum_bookings_payment_state" AS ENUM('paid', 'deposit', 'outstanding');
  CREATE TYPE "public"."enum_coupons_type" AS ENUM('percentage', 'fixed');
  CREATE TYPE "public"."enum_coupons_applies_to" AS ENUM('all', 'experiences', 'events');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('things-to-do', 'travel-planning', 'accra', 'cape-coast', 'volta', 'food-culture', 'adventure', 'events', 'corporate-travel', 'nightlife');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('things-to-do', 'travel-planning', 'accra', 'cape-coast', 'volta', 'food-culture', 'adventure', 'events', 'corporate-travel', 'nightlife');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en');
  CREATE TYPE "public"."enum_corporate_enquiries_services" AS ENUM('venue', 'catering', 'transport', 'hotel', 'av', 'photography', 'branding', 'registration', 'entertainment', 'security', 'logistics', 'event-staffing');
  CREATE TYPE "public"."enum_corporate_enquiries_pipeline_status" AS ENUM('new', 'contacted', 'consultation', 'proposal-preparation', 'proposal-sent', 'negotiation', 'awaiting-deposit', 'confirmed', 'in-progress', 'completed', 'lost');
  CREATE TYPE "public"."enum_corporate_enquiries_event_type" AS ENUM('conference', 'corporate-retreat', 'company-outing', 'team-building', 'product-launch', 'private-event', 'other');
  CREATE TYPE "public"."enum_custom_trip_requests_interests" AS ENUM('history', 'culture', 'food', 'hiking', 'adventure', 'beaches', 'nature', 'nightlife', 'art', 'wellness');
  CREATE TYPE "public"."enum_custom_trip_requests_status" AS ENUM('new', 'in-review', 'itinerary-sent', 'confirmed', 'closed');
  CREATE TYPE "public"."enum_travel_service_requests_status" AS ENUM('new', 'contacted', 'quoted', 'confirmed', 'closed');
  CREATE TYPE "public"."enum_travel_service_requests_service_type" AS ENUM('airport-transfer', 'flights', 'accommodation', 'car-rental');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"category" "enum_media_category",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "destinations_things_to_do" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "destinations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"region" "enum_destinations_region",
  	"featured" boolean DEFAULT false,
  	"hero_image_id" integer,
  	"short_description" varchar,
  	"why_visit" jsonb,
  	"best_time_to_visit" varchar,
  	"travel_tips" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_destinations_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_destinations_v_version_things_to_do" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_destinations_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_region" "enum__destinations_v_version_region",
  	"version_featured" boolean DEFAULT false,
  	"version_hero_image_id" integer,
  	"version_short_description" varchar,
  	"version_why_visit" jsonb,
  	"version_best_time_to_visit" varchar,
  	"version_travel_tips" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__destinations_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__destinations_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "experience_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar,
  	"blurb" varchar,
  	"icon" varchar,
  	"image_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "experiences_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experiences_itinerary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "experiences_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experiences_excluded" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experiences_what_to_bring" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "experiences_price_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"min_guests" numeric,
  	"max_guests" numeric,
  	"price_per_person" numeric,
  	"request_quote" boolean
  );
  
  CREATE TABLE "experiences_weekdays" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_experiences_weekdays",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "experiences_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "experiences_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "experiences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"short_description" varchar,
  	"description" jsonb,
  	"who_for" varchar,
  	"pricing_strategy" "enum_experiences_pricing_strategy" DEFAULT 'fixed',
  	"price_from" numeric,
  	"private_price" numeric,
  	"visitor_pricing_enabled" boolean DEFAULT false,
  	"visitor_pricing_resident_price" numeric,
  	"availability_type" "enum_experiences_availability_type" DEFAULT 'everyday',
  	"include_public_holidays" boolean DEFAULT false,
  	"min_guests" numeric DEFAULT 2,
  	"max_guests" numeric,
  	"min_notice_hours" numeric DEFAULT 24,
  	"max_advance_days" numeric DEFAULT 180,
  	"sold_out" boolean DEFAULT false,
  	"duration" varchar,
  	"difficulty" "enum_experiences_difficulty",
  	"meeting_point" varchar,
  	"pickup_info" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"activity_details_distance_km" numeric,
  	"activity_details_elevation_m" numeric,
  	"activity_details_terrain" varchar,
  	"activity_details_fitness_note" varchar,
  	"activity_details_equipment_provided" varchar,
  	"activity_details_minimum_age" numeric,
  	"activity_details_meal_included" boolean,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"slug" varchar,
  	"category_id" integer,
  	"destination_id" integer,
  	"badge" "enum_experiences_badge",
  	"featured" boolean DEFAULT false,
  	"rating" numeric,
  	"review_count" numeric,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_experiences_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_experiences_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_itinerary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_excluded" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_what_to_bring" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_price_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"min_guests" numeric,
  	"max_guests" numeric,
  	"price_per_person" numeric,
  	"request_quote" boolean,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_weekdays" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__experiences_v_version_weekdays",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_experiences_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_experiences_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_who_for" varchar,
  	"version_pricing_strategy" "enum__experiences_v_version_pricing_strategy" DEFAULT 'fixed',
  	"version_price_from" numeric,
  	"version_private_price" numeric,
  	"version_visitor_pricing_enabled" boolean DEFAULT false,
  	"version_visitor_pricing_resident_price" numeric,
  	"version_availability_type" "enum__experiences_v_version_availability_type" DEFAULT 'everyday',
  	"version_include_public_holidays" boolean DEFAULT false,
  	"version_min_guests" numeric DEFAULT 2,
  	"version_max_guests" numeric,
  	"version_min_notice_hours" numeric DEFAULT 24,
  	"version_max_advance_days" numeric DEFAULT 180,
  	"version_sold_out" boolean DEFAULT false,
  	"version_duration" varchar,
  	"version_difficulty" "enum__experiences_v_version_difficulty",
  	"version_meeting_point" varchar,
  	"version_pickup_info" varchar,
  	"version_latitude" numeric,
  	"version_longitude" numeric,
  	"version_activity_details_distance_km" numeric,
  	"version_activity_details_elevation_m" numeric,
  	"version_activity_details_terrain" varchar,
  	"version_activity_details_fitness_note" varchar,
  	"version_activity_details_equipment_provided" varchar,
  	"version_activity_details_minimum_age" numeric,
  	"version_activity_details_meal_included" boolean,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_slug" varchar,
  	"version_category_id" integer,
  	"version_destination_id" integer,
  	"version_badge" "enum__experiences_v_version_badge",
  	"version_featured" boolean DEFAULT false,
  	"version_rating" numeric,
  	"version_review_count" numeric,
  	"version_hero_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__experiences_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__experiences_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "reviews" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"body" varchar NOT NULL,
  	"rating" numeric NOT NULL,
  	"author_name" varchar NOT NULL,
  	"traveller_type" "enum_reviews_traveller_type",
  	"experience_id" integer,
  	"status" "enum_reviews_status" DEFAULT 'pending',
  	"verified" boolean DEFAULT false,
  	"booking_reference" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "departures" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"experience_id" integer NOT NULL,
  	"starts_at" timestamp(3) with time zone NOT NULL,
  	"time_confirmed" boolean DEFAULT true,
  	"capacity" numeric DEFAULT 15 NOT NULL,
  	"status" "enum_departures_status" DEFAULT 'scheduled' NOT NULL,
  	"auto_created" boolean DEFAULT false,
  	"date_key" varchar,
  	"inventory_key" varchar NOT NULL,
  	"meeting_point_override" varchar,
  	"operations_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bookings_guests" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category" "enum_bookings_guests_category"
  );
  
  CREATE TABLE "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar,
  	"status" "enum_bookings_status" DEFAULT 'draft' NOT NULL,
  	"source" "enum_bookings_source" DEFAULT 'website' NOT NULL,
  	"experience_id" integer NOT NULL,
  	"departure_id" integer,
  	"customer_id" integer,
  	"departure_date" timestamp(3) with time zone NOT NULL,
  	"adults" numeric DEFAULT 2,
  	"children" numeric DEFAULT 0,
  	"inventory_state" "enum_bookings_inventory_state" DEFAULT 'none',
  	"capacity_seats" numeric,
  	"hold_expires_at" timestamp(3) with time zone,
  	"booker_first_name" varchar NOT NULL,
  	"booker_last_name" varchar NOT NULL,
  	"booker_email" varchar NOT NULL,
  	"booker_phone" varchar NOT NULL,
  	"booker_country" varchar,
  	"booker_emergency_contact" varchar,
  	"pickup" varchar,
  	"special_request" varchar,
  	"dietary" varchar,
  	"total_amount" numeric,
  	"payment_state" "enum_bookings_payment_state",
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"country" varchar,
  	"marketing_opt_in" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coupons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"type" "enum_coupons_type" DEFAULT 'percentage' NOT NULL,
  	"value" numeric NOT NULL,
  	"applies_to" "enum_coupons_applies_to" DEFAULT 'all',
  	"min_order" numeric,
  	"valid_from" timestamp(3) with time zone,
  	"valid_to" timestamp(3) with time zone,
  	"max_uses" numeric,
  	"used_count" numeric DEFAULT 0,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "coupons_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"experiences_id" integer,
  	"events_id" integer
  );
  
  CREATE TABLE "events_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "events_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "events_ticket_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"quantity" numeric,
  	"sale_start" timestamp(3) with time zone,
  	"sale_end" timestamp(3) with time zone,
  	"per_order_limit" numeric,
  	"sold_out" boolean DEFAULT false
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"short_description" varchar,
  	"description" jsonb,
  	"cover_image_id" integer,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"venue" varchar,
  	"location" varchar,
  	"destination_id" integer,
  	"about" varchar,
  	"what_to_expect" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_events_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v_version_ticket_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"quantity" numeric,
  	"sale_start" timestamp(3) with time zone,
  	"sale_end" timestamp(3) with time zone,
  	"per_order_limit" numeric,
  	"sold_out" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_short_description" varchar,
  	"version_description" jsonb,
  	"version_cover_image_id" integer,
  	"version_starts_at" timestamp(3) with time zone,
  	"version_ends_at" timestamp(3) with time zone,
  	"version_venue" varchar,
  	"version_location" varchar,
  	"version_destination_id" integer,
  	"version_about" varchar,
  	"version_what_to_expect" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "posts_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"cover_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"slug" varchar,
  	"category" "enum_posts_category",
  	"related_destination_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_v_version_body" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_cover_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_slug" varchar,
  	"version_category" "enum__posts_v_version_category",
  	"version_related_destination_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"subtitle" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_subtitle" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"source" varchar,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "corporate_enquiries_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_corporate_enquiries_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "corporate_enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"pipeline_status" "enum_corporate_enquiries_pipeline_status" DEFAULT 'new',
  	"event_type" "enum_corporate_enquiries_event_type" NOT NULL,
  	"organisation" varchar,
  	"expected_guests" numeric,
  	"preferred_date" timestamp(3) with time zone,
  	"duration_days" numeric,
  	"location" varchar,
  	"budget" varchar,
  	"contact_name" varchar NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"contact_phone" varchar NOT NULL,
  	"message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "custom_trip_requests_interests" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_custom_trip_requests_interests",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "custom_trip_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_custom_trip_requests_status" DEFAULT 'new',
  	"visit_dates" varchar,
  	"travellers" numeric,
  	"days" numeric,
  	"budget" varchar,
  	"needs_accommodation" boolean,
  	"needs_transport" boolean,
  	"needs_airport_transfer" boolean,
  	"needs_private_guide" boolean,
  	"notes" varchar,
  	"contact_name" varchar NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"contact_phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "travel_service_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_travel_service_requests_status" DEFAULT 'new',
  	"service_type" "enum_travel_service_requests_service_type" NOT NULL,
  	"summary" varchar,
  	"contact_name" varchar NOT NULL,
  	"contact_email" varchar NOT NULL,
  	"contact_phone" varchar,
  	"details" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"destinations_id" integer,
  	"experience_categories_id" integer,
  	"experiences_id" integer,
  	"reviews_id" integer,
  	"departures_id" integer,
  	"bookings_id" integer,
  	"customers_id" integer,
  	"coupons_id" integer,
  	"events_id" integer,
  	"posts_id" integer,
  	"pages_id" integer,
  	"newsletter_subscribers_id" integer,
  	"corporate_enquiries_id" integer,
  	"custom_trip_requests_id" integer,
  	"travel_service_requests_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tagline" varchar DEFAULT 'Experience. Explore. Express.',
  	"headline" varchar DEFAULT 'Experience Ghana the Trivoxo Way',
  	"description" varchar,
  	"primary_phone" varchar,
  	"alt_phone" varchar,
  	"whatsapp" varchar,
  	"email" varchar,
  	"address" varchar,
  	"instagram" varchar,
  	"tiktok" varchar,
  	"linkedin" varchar,
  	"facebook" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations_things_to_do" ADD CONSTRAINT "destinations_things_to_do_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destinations" ADD CONSTRAINT "destinations_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "destinations" ADD CONSTRAINT "destinations_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v_version_things_to_do" ADD CONSTRAINT "_destinations_v_version_things_to_do_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_destinations_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_parent_id_destinations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_destinations_v" ADD CONSTRAINT "_destinations_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experience_categories" ADD CONSTRAINT "experience_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences_highlights" ADD CONSTRAINT "experiences_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_itinerary" ADD CONSTRAINT "experiences_itinerary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_included" ADD CONSTRAINT "experiences_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_excluded" ADD CONSTRAINT "experiences_excluded_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_what_to_bring" ADD CONSTRAINT "experiences_what_to_bring_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_price_tiers" ADD CONSTRAINT "experiences_price_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_weekdays" ADD CONSTRAINT "experiences_weekdays_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_faqs" ADD CONSTRAINT "experiences_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences_gallery" ADD CONSTRAINT "experiences_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences_gallery" ADD CONSTRAINT "experiences_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_category_id_experience_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."experience_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "experiences" ADD CONSTRAINT "experiences_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_highlights" ADD CONSTRAINT "_experiences_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_itinerary" ADD CONSTRAINT "_experiences_v_version_itinerary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_included" ADD CONSTRAINT "_experiences_v_version_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_excluded" ADD CONSTRAINT "_experiences_v_version_excluded_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_what_to_bring" ADD CONSTRAINT "_experiences_v_version_what_to_bring_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_price_tiers" ADD CONSTRAINT "_experiences_v_version_price_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_weekdays" ADD CONSTRAINT "_experiences_v_version_weekdays_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_faqs" ADD CONSTRAINT "_experiences_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_gallery" ADD CONSTRAINT "_experiences_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v_version_gallery" ADD CONSTRAINT "_experiences_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_experiences_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_parent_id_experiences_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."experiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_version_category_id_experience_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."experience_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_version_destination_id_destinations_id_fk" FOREIGN KEY ("version_destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_experiences_v" ADD CONSTRAINT "_experiences_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "reviews" ADD CONSTRAINT "reviews_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "departures" ADD CONSTRAINT "departures_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings_guests" ADD CONSTRAINT "bookings_guests_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_departure_id_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."departures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "coupons_rels" ADD CONSTRAINT "coupons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coupons_rels" ADD CONSTRAINT "coupons_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "coupons_rels" ADD CONSTRAINT "coupons_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_highlights" ADD CONSTRAINT "events_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_included" ADD CONSTRAINT "events_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_ticket_types" ADD CONSTRAINT "events_ticket_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_destination_id_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_version_highlights" ADD CONSTRAINT "_events_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_included" ADD CONSTRAINT "_events_v_version_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_ticket_types" ADD CONSTRAINT "_events_v_version_ticket_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_destination_id_destinations_id_fk" FOREIGN KEY ("version_destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_body" ADD CONSTRAINT "posts_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_related_destination_id_destinations_id_fk" FOREIGN KEY ("related_destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_version_body" ADD CONSTRAINT "_posts_v_version_body_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_related_destination_id_destinations_id_fk" FOREIGN KEY ("version_related_destination_id") REFERENCES "public"."destinations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "corporate_enquiries_services" ADD CONSTRAINT "corporate_enquiries_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."corporate_enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "custom_trip_requests_interests" ADD CONSTRAINT "custom_trip_requests_interests_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."custom_trip_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_destinations_fk" FOREIGN KEY ("destinations_id") REFERENCES "public"."destinations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experience_categories_fk" FOREIGN KEY ("experience_categories_id") REFERENCES "public"."experience_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_experiences_fk" FOREIGN KEY ("experiences_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk" FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_departures_fk" FOREIGN KEY ("departures_id") REFERENCES "public"."departures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_corporate_enquiries_fk" FOREIGN KEY ("corporate_enquiries_id") REFERENCES "public"."corporate_enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_custom_trip_requests_fk" FOREIGN KEY ("custom_trip_requests_id") REFERENCES "public"."custom_trip_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_travel_service_requests_fk" FOREIGN KEY ("travel_service_requests_id") REFERENCES "public"."travel_service_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "destinations_things_to_do_order_idx" ON "destinations_things_to_do" USING btree ("_order");
  CREATE INDEX "destinations_things_to_do_parent_id_idx" ON "destinations_things_to_do" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "destinations_slug_idx" ON "destinations" USING btree ("slug");
  CREATE INDEX "destinations_hero_image_idx" ON "destinations" USING btree ("hero_image_id");
  CREATE INDEX "destinations_meta_meta_image_idx" ON "destinations" USING btree ("meta_image_id");
  CREATE INDEX "destinations_updated_at_idx" ON "destinations" USING btree ("updated_at");
  CREATE INDEX "destinations_created_at_idx" ON "destinations" USING btree ("created_at");
  CREATE INDEX "destinations__status_idx" ON "destinations" USING btree ("_status");
  CREATE INDEX "_destinations_v_version_things_to_do_order_idx" ON "_destinations_v_version_things_to_do" USING btree ("_order");
  CREATE INDEX "_destinations_v_version_things_to_do_parent_id_idx" ON "_destinations_v_version_things_to_do" USING btree ("_parent_id");
  CREATE INDEX "_destinations_v_parent_idx" ON "_destinations_v" USING btree ("parent_id");
  CREATE INDEX "_destinations_v_version_version_slug_idx" ON "_destinations_v" USING btree ("version_slug");
  CREATE INDEX "_destinations_v_version_version_hero_image_idx" ON "_destinations_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_destinations_v_version_meta_version_meta_image_idx" ON "_destinations_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_destinations_v_version_version_updated_at_idx" ON "_destinations_v" USING btree ("version_updated_at");
  CREATE INDEX "_destinations_v_version_version_created_at_idx" ON "_destinations_v" USING btree ("version_created_at");
  CREATE INDEX "_destinations_v_version_version__status_idx" ON "_destinations_v" USING btree ("version__status");
  CREATE INDEX "_destinations_v_created_at_idx" ON "_destinations_v" USING btree ("created_at");
  CREATE INDEX "_destinations_v_updated_at_idx" ON "_destinations_v" USING btree ("updated_at");
  CREATE INDEX "_destinations_v_snapshot_idx" ON "_destinations_v" USING btree ("snapshot");
  CREATE INDEX "_destinations_v_published_locale_idx" ON "_destinations_v" USING btree ("published_locale");
  CREATE INDEX "_destinations_v_latest_idx" ON "_destinations_v" USING btree ("latest");
  CREATE UNIQUE INDEX "experience_categories_slug_idx" ON "experience_categories" USING btree ("slug");
  CREATE INDEX "experience_categories_image_idx" ON "experience_categories" USING btree ("image_id");
  CREATE INDEX "experience_categories_updated_at_idx" ON "experience_categories" USING btree ("updated_at");
  CREATE INDEX "experience_categories_created_at_idx" ON "experience_categories" USING btree ("created_at");
  CREATE INDEX "experiences_highlights_order_idx" ON "experiences_highlights" USING btree ("_order");
  CREATE INDEX "experiences_highlights_parent_id_idx" ON "experiences_highlights" USING btree ("_parent_id");
  CREATE INDEX "experiences_itinerary_order_idx" ON "experiences_itinerary" USING btree ("_order");
  CREATE INDEX "experiences_itinerary_parent_id_idx" ON "experiences_itinerary" USING btree ("_parent_id");
  CREATE INDEX "experiences_included_order_idx" ON "experiences_included" USING btree ("_order");
  CREATE INDEX "experiences_included_parent_id_idx" ON "experiences_included" USING btree ("_parent_id");
  CREATE INDEX "experiences_excluded_order_idx" ON "experiences_excluded" USING btree ("_order");
  CREATE INDEX "experiences_excluded_parent_id_idx" ON "experiences_excluded" USING btree ("_parent_id");
  CREATE INDEX "experiences_what_to_bring_order_idx" ON "experiences_what_to_bring" USING btree ("_order");
  CREATE INDEX "experiences_what_to_bring_parent_id_idx" ON "experiences_what_to_bring" USING btree ("_parent_id");
  CREATE INDEX "experiences_price_tiers_order_idx" ON "experiences_price_tiers" USING btree ("_order");
  CREATE INDEX "experiences_price_tiers_parent_id_idx" ON "experiences_price_tiers" USING btree ("_parent_id");
  CREATE INDEX "experiences_weekdays_order_idx" ON "experiences_weekdays" USING btree ("order");
  CREATE INDEX "experiences_weekdays_parent_idx" ON "experiences_weekdays" USING btree ("parent_id");
  CREATE INDEX "experiences_faqs_order_idx" ON "experiences_faqs" USING btree ("_order");
  CREATE INDEX "experiences_faqs_parent_id_idx" ON "experiences_faqs" USING btree ("_parent_id");
  CREATE INDEX "experiences_gallery_order_idx" ON "experiences_gallery" USING btree ("_order");
  CREATE INDEX "experiences_gallery_parent_id_idx" ON "experiences_gallery" USING btree ("_parent_id");
  CREATE INDEX "experiences_gallery_image_idx" ON "experiences_gallery" USING btree ("image_id");
  CREATE INDEX "experiences_meta_meta_image_idx" ON "experiences" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "experiences_slug_idx" ON "experiences" USING btree ("slug");
  CREATE INDEX "experiences_category_idx" ON "experiences" USING btree ("category_id");
  CREATE INDEX "experiences_destination_idx" ON "experiences" USING btree ("destination_id");
  CREATE INDEX "experiences_hero_image_idx" ON "experiences" USING btree ("hero_image_id");
  CREATE INDEX "experiences_updated_at_idx" ON "experiences" USING btree ("updated_at");
  CREATE INDEX "experiences_created_at_idx" ON "experiences" USING btree ("created_at");
  CREATE INDEX "experiences__status_idx" ON "experiences" USING btree ("_status");
  CREATE INDEX "_experiences_v_version_highlights_order_idx" ON "_experiences_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_highlights_parent_id_idx" ON "_experiences_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_itinerary_order_idx" ON "_experiences_v_version_itinerary" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_itinerary_parent_id_idx" ON "_experiences_v_version_itinerary" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_included_order_idx" ON "_experiences_v_version_included" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_included_parent_id_idx" ON "_experiences_v_version_included" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_excluded_order_idx" ON "_experiences_v_version_excluded" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_excluded_parent_id_idx" ON "_experiences_v_version_excluded" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_what_to_bring_order_idx" ON "_experiences_v_version_what_to_bring" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_what_to_bring_parent_id_idx" ON "_experiences_v_version_what_to_bring" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_price_tiers_order_idx" ON "_experiences_v_version_price_tiers" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_price_tiers_parent_id_idx" ON "_experiences_v_version_price_tiers" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_weekdays_order_idx" ON "_experiences_v_version_weekdays" USING btree ("order");
  CREATE INDEX "_experiences_v_version_weekdays_parent_idx" ON "_experiences_v_version_weekdays" USING btree ("parent_id");
  CREATE INDEX "_experiences_v_version_faqs_order_idx" ON "_experiences_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_faqs_parent_id_idx" ON "_experiences_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_gallery_order_idx" ON "_experiences_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_experiences_v_version_gallery_parent_id_idx" ON "_experiences_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_experiences_v_version_gallery_image_idx" ON "_experiences_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_experiences_v_parent_idx" ON "_experiences_v" USING btree ("parent_id");
  CREATE INDEX "_experiences_v_version_meta_version_meta_image_idx" ON "_experiences_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_experiences_v_version_version_slug_idx" ON "_experiences_v" USING btree ("version_slug");
  CREATE INDEX "_experiences_v_version_version_category_idx" ON "_experiences_v" USING btree ("version_category_id");
  CREATE INDEX "_experiences_v_version_version_destination_idx" ON "_experiences_v" USING btree ("version_destination_id");
  CREATE INDEX "_experiences_v_version_version_hero_image_idx" ON "_experiences_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_experiences_v_version_version_updated_at_idx" ON "_experiences_v" USING btree ("version_updated_at");
  CREATE INDEX "_experiences_v_version_version_created_at_idx" ON "_experiences_v" USING btree ("version_created_at");
  CREATE INDEX "_experiences_v_version_version__status_idx" ON "_experiences_v" USING btree ("version__status");
  CREATE INDEX "_experiences_v_created_at_idx" ON "_experiences_v" USING btree ("created_at");
  CREATE INDEX "_experiences_v_updated_at_idx" ON "_experiences_v" USING btree ("updated_at");
  CREATE INDEX "_experiences_v_snapshot_idx" ON "_experiences_v" USING btree ("snapshot");
  CREATE INDEX "_experiences_v_published_locale_idx" ON "_experiences_v" USING btree ("published_locale");
  CREATE INDEX "_experiences_v_latest_idx" ON "_experiences_v" USING btree ("latest");
  CREATE INDEX "_experiences_v_autosave_idx" ON "_experiences_v" USING btree ("autosave");
  CREATE INDEX "reviews_experience_idx" ON "reviews" USING btree ("experience_id");
  CREATE INDEX "reviews_updated_at_idx" ON "reviews" USING btree ("updated_at");
  CREATE INDEX "reviews_created_at_idx" ON "reviews" USING btree ("created_at");
  CREATE INDEX "departures_experience_idx" ON "departures" USING btree ("experience_id");
  CREATE INDEX "departures_starts_at_idx" ON "departures" USING btree ("starts_at");
  CREATE INDEX "departures_status_idx" ON "departures" USING btree ("status");
  CREATE INDEX "departures_date_key_idx" ON "departures" USING btree ("date_key");
  CREATE UNIQUE INDEX "departures_inventory_key_idx" ON "departures" USING btree ("inventory_key");
  CREATE INDEX "departures_updated_at_idx" ON "departures" USING btree ("updated_at");
  CREATE INDEX "departures_created_at_idx" ON "departures" USING btree ("created_at");
  CREATE INDEX "bookings_guests_order_idx" ON "bookings_guests" USING btree ("_order");
  CREATE INDEX "bookings_guests_parent_id_idx" ON "bookings_guests" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "bookings_reference_idx" ON "bookings" USING btree ("reference");
  CREATE INDEX "bookings_experience_idx" ON "bookings" USING btree ("experience_id");
  CREATE INDEX "bookings_departure_idx" ON "bookings" USING btree ("departure_id");
  CREATE INDEX "bookings_customer_idx" ON "bookings" USING btree ("customer_id");
  CREATE INDEX "bookings_inventory_state_idx" ON "bookings" USING btree ("inventory_state");
  CREATE INDEX "bookings_hold_expires_at_idx" ON "bookings" USING btree ("hold_expires_at");
  CREATE INDEX "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");
  CREATE INDEX "coupons_updated_at_idx" ON "coupons" USING btree ("updated_at");
  CREATE INDEX "coupons_created_at_idx" ON "coupons" USING btree ("created_at");
  CREATE INDEX "coupons_rels_order_idx" ON "coupons_rels" USING btree ("order");
  CREATE INDEX "coupons_rels_parent_idx" ON "coupons_rels" USING btree ("parent_id");
  CREATE INDEX "coupons_rels_path_idx" ON "coupons_rels" USING btree ("path");
  CREATE INDEX "coupons_rels_experiences_id_idx" ON "coupons_rels" USING btree ("experiences_id");
  CREATE INDEX "coupons_rels_events_id_idx" ON "coupons_rels" USING btree ("events_id");
  CREATE INDEX "events_highlights_order_idx" ON "events_highlights" USING btree ("_order");
  CREATE INDEX "events_highlights_parent_id_idx" ON "events_highlights" USING btree ("_parent_id");
  CREATE INDEX "events_included_order_idx" ON "events_included" USING btree ("_order");
  CREATE INDEX "events_included_parent_id_idx" ON "events_included" USING btree ("_parent_id");
  CREATE INDEX "events_ticket_types_order_idx" ON "events_ticket_types" USING btree ("_order");
  CREATE INDEX "events_ticket_types_parent_id_idx" ON "events_ticket_types" USING btree ("_parent_id");
  CREATE INDEX "events_cover_image_idx" ON "events" USING btree ("cover_image_id");
  CREATE INDEX "events_destination_idx" ON "events" USING btree ("destination_id");
  CREATE INDEX "events_meta_meta_image_idx" ON "events" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "_events_v_version_highlights_order_idx" ON "_events_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_events_v_version_highlights_parent_id_idx" ON "_events_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_included_order_idx" ON "_events_v_version_included" USING btree ("_order");
  CREATE INDEX "_events_v_version_included_parent_id_idx" ON "_events_v_version_included" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_ticket_types_order_idx" ON "_events_v_version_ticket_types" USING btree ("_order");
  CREATE INDEX "_events_v_version_ticket_types_parent_id_idx" ON "_events_v_version_ticket_types" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_cover_image_idx" ON "_events_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_events_v_version_version_destination_idx" ON "_events_v" USING btree ("version_destination_id");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_snapshot_idx" ON "_events_v" USING btree ("snapshot");
  CREATE INDEX "_events_v_published_locale_idx" ON "_events_v" USING btree ("published_locale");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "posts_body_order_idx" ON "posts_body" USING btree ("_order");
  CREATE INDEX "posts_body_parent_id_idx" ON "posts_body" USING btree ("_parent_id");
  CREATE INDEX "posts_cover_image_idx" ON "posts" USING btree ("cover_image_id");
  CREATE INDEX "posts_meta_meta_image_idx" ON "posts" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_related_destination_idx" ON "posts" USING btree ("related_destination_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE INDEX "_posts_v_version_body_order_idx" ON "_posts_v_version_body" USING btree ("_order");
  CREATE INDEX "_posts_v_version_body_parent_id_idx" ON "_posts_v_version_body" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_cover_image_idx" ON "_posts_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_posts_v_version_meta_version_meta_image_idx" ON "_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_related_destination_idx" ON "_posts_v" USING btree ("version_related_destination_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  CREATE INDEX "corporate_enquiries_services_order_idx" ON "corporate_enquiries_services" USING btree ("order");
  CREATE INDEX "corporate_enquiries_services_parent_idx" ON "corporate_enquiries_services" USING btree ("parent_id");
  CREATE INDEX "corporate_enquiries_updated_at_idx" ON "corporate_enquiries" USING btree ("updated_at");
  CREATE INDEX "corporate_enquiries_created_at_idx" ON "corporate_enquiries" USING btree ("created_at");
  CREATE INDEX "custom_trip_requests_interests_order_idx" ON "custom_trip_requests_interests" USING btree ("order");
  CREATE INDEX "custom_trip_requests_interests_parent_idx" ON "custom_trip_requests_interests" USING btree ("parent_id");
  CREATE INDEX "custom_trip_requests_updated_at_idx" ON "custom_trip_requests" USING btree ("updated_at");
  CREATE INDEX "custom_trip_requests_created_at_idx" ON "custom_trip_requests" USING btree ("created_at");
  CREATE INDEX "travel_service_requests_updated_at_idx" ON "travel_service_requests" USING btree ("updated_at");
  CREATE INDEX "travel_service_requests_created_at_idx" ON "travel_service_requests" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_destinations_id_idx" ON "payload_locked_documents_rels" USING btree ("destinations_id");
  CREATE INDEX "payload_locked_documents_rels_experience_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("experience_categories_id");
  CREATE INDEX "payload_locked_documents_rels_experiences_id_idx" ON "payload_locked_documents_rels" USING btree ("experiences_id");
  CREATE INDEX "payload_locked_documents_rels_reviews_id_idx" ON "payload_locked_documents_rels" USING btree ("reviews_id");
  CREATE INDEX "payload_locked_documents_rels_departures_id_idx" ON "payload_locked_documents_rels" USING btree ("departures_id");
  CREATE INDEX "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_coupons_id_idx" ON "payload_locked_documents_rels" USING btree ("coupons_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_corporate_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("corporate_enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_custom_trip_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("custom_trip_requests_id");
  CREATE INDEX "payload_locked_documents_rels_travel_service_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("travel_service_requests_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "destinations_things_to_do" CASCADE;
  DROP TABLE "destinations" CASCADE;
  DROP TABLE "_destinations_v_version_things_to_do" CASCADE;
  DROP TABLE "_destinations_v" CASCADE;
  DROP TABLE "experience_categories" CASCADE;
  DROP TABLE "experiences_highlights" CASCADE;
  DROP TABLE "experiences_itinerary" CASCADE;
  DROP TABLE "experiences_included" CASCADE;
  DROP TABLE "experiences_excluded" CASCADE;
  DROP TABLE "experiences_what_to_bring" CASCADE;
  DROP TABLE "experiences_price_tiers" CASCADE;
  DROP TABLE "experiences_weekdays" CASCADE;
  DROP TABLE "experiences_faqs" CASCADE;
  DROP TABLE "experiences_gallery" CASCADE;
  DROP TABLE "experiences" CASCADE;
  DROP TABLE "_experiences_v_version_highlights" CASCADE;
  DROP TABLE "_experiences_v_version_itinerary" CASCADE;
  DROP TABLE "_experiences_v_version_included" CASCADE;
  DROP TABLE "_experiences_v_version_excluded" CASCADE;
  DROP TABLE "_experiences_v_version_what_to_bring" CASCADE;
  DROP TABLE "_experiences_v_version_price_tiers" CASCADE;
  DROP TABLE "_experiences_v_version_weekdays" CASCADE;
  DROP TABLE "_experiences_v_version_faqs" CASCADE;
  DROP TABLE "_experiences_v_version_gallery" CASCADE;
  DROP TABLE "_experiences_v" CASCADE;
  DROP TABLE "reviews" CASCADE;
  DROP TABLE "departures" CASCADE;
  DROP TABLE "bookings_guests" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "coupons" CASCADE;
  DROP TABLE "coupons_rels" CASCADE;
  DROP TABLE "events_highlights" CASCADE;
  DROP TABLE "events_included" CASCADE;
  DROP TABLE "events_ticket_types" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "_events_v_version_highlights" CASCADE;
  DROP TABLE "_events_v_version_included" CASCADE;
  DROP TABLE "_events_v_version_ticket_types" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "posts_body" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "_posts_v_version_body" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  DROP TABLE "corporate_enquiries_services" CASCADE;
  DROP TABLE "corporate_enquiries" CASCADE;
  DROP TABLE "custom_trip_requests_interests" CASCADE;
  DROP TABLE "custom_trip_requests" CASCADE;
  DROP TABLE "travel_service_requests" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_media_category";
  DROP TYPE "public"."enum_destinations_region";
  DROP TYPE "public"."enum_destinations_status";
  DROP TYPE "public"."enum__destinations_v_version_region";
  DROP TYPE "public"."enum__destinations_v_version_status";
  DROP TYPE "public"."enum__destinations_v_published_locale";
  DROP TYPE "public"."enum_experiences_weekdays";
  DROP TYPE "public"."enum_experiences_pricing_strategy";
  DROP TYPE "public"."enum_experiences_availability_type";
  DROP TYPE "public"."enum_experiences_difficulty";
  DROP TYPE "public"."enum_experiences_badge";
  DROP TYPE "public"."enum_experiences_status";
  DROP TYPE "public"."enum__experiences_v_version_weekdays";
  DROP TYPE "public"."enum__experiences_v_version_pricing_strategy";
  DROP TYPE "public"."enum__experiences_v_version_availability_type";
  DROP TYPE "public"."enum__experiences_v_version_difficulty";
  DROP TYPE "public"."enum__experiences_v_version_badge";
  DROP TYPE "public"."enum__experiences_v_version_status";
  DROP TYPE "public"."enum__experiences_v_published_locale";
  DROP TYPE "public"."enum_reviews_traveller_type";
  DROP TYPE "public"."enum_reviews_status";
  DROP TYPE "public"."enum_departures_status";
  DROP TYPE "public"."enum_bookings_guests_category";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_bookings_source";
  DROP TYPE "public"."enum_bookings_inventory_state";
  DROP TYPE "public"."enum_bookings_payment_state";
  DROP TYPE "public"."enum_coupons_type";
  DROP TYPE "public"."enum_coupons_applies_to";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum__events_v_published_locale";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_corporate_enquiries_services";
  DROP TYPE "public"."enum_corporate_enquiries_pipeline_status";
  DROP TYPE "public"."enum_corporate_enquiries_event_type";
  DROP TYPE "public"."enum_custom_trip_requests_interests";
  DROP TYPE "public"."enum_custom_trip_requests_status";
  DROP TYPE "public"."enum_travel_service_requests_status";
  DROP TYPE "public"."enum_travel_service_requests_service_type";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
