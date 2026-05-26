-- ━━━ Production Readiness Migration ━━━
-- New enums
DO $$ BEGIN
  CREATE TYPE "public"."invite_stage" AS ENUM('save_the_date','invite','thank_you');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."guest_side" AS ENUM('groom','bride','both');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."coupon_discount_type" AS ENUM('percent','flat');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."otp_purpose" AS ENUM('login','phone_verify','rsvp');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."referral_reward_status" AS ENUM('pending','credited','void');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Add new analytics events
ALTER TYPE "public"."analytics_event" ADD VALUE IF NOT EXISTS 'guest_link_open';
ALTER TYPE "public"."analytics_event" ADD VALUE IF NOT EXISTS 'gift_intent';
ALTER TYPE "public"."analytics_event" ADD VALUE IF NOT EXISTS 'wish_posted';

-- Users new columns
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "phone_verified" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "plan_expires_at" timestamp,
  ADD COLUMN IF NOT EXISTS "subdomain" varchar(63),
  ADD COLUMN IF NOT EXISTS "referral_code" varchar(20),
  ADD COLUMN IF NOT EXISTS "referred_by_user_id" uuid,
  ADD COLUMN IF NOT EXISTS "preferred_locale" varchar(10) DEFAULT 'en' NOT NULL,
  ADD COLUMN IF NOT EXISTS "cookie_consent_at" timestamp,
  ADD COLUMN IF NOT EXISTS "deleted_at" timestamp,
  ADD COLUMN IF NOT EXISTS "deletion_scheduled_at" timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS "users_subdomain_idx" ON "users" ("subdomain");
CREATE UNIQUE INDEX IF NOT EXISTS "users_referral_code_idx" ON "users" ("referral_code");
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users" ("phone");

-- Invitations new columns
ALTER TABLE "invitations"
  ADD COLUMN IF NOT EXISTS "stage" "invite_stage" DEFAULT 'invite' NOT NULL,
  ADD COLUMN IF NOT EXISTS "livestream_url" text,
  ADD COLUMN IF NOT EXISTS "livestream_provider" varchar(50),
  ADD COLUMN IF NOT EXISTS "upi_id" varchar(100),
  ADD COLUMN IF NOT EXISTS "upi_payee_name" varchar(100),
  ADD COLUMN IF NOT EXISTS "gift_registry_url" text,
  ADD COLUMN IF NOT EXISTS "gift_message" text,
  ADD COLUMN IF NOT EXISTS "guestbook_enabled" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "guestbook_requires_approval" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "gallery_enabled" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "gallery_accepts_uploads" boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "locale" varchar(10) DEFAULT 'en' NOT NULL,
  ADD COLUMN IF NOT EXISTS "rsvp_deadline" timestamp,
  ADD COLUMN IF NOT EXISTS "rsvp_enabled" boolean DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "qr_code_url" text;

CREATE INDEX IF NOT EXISTS "invitations_published_idx" ON "invitations" ("published");

-- Payments new columns + unique constraint
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "razorpay_order_id" varchar(255),
  ADD COLUMN IF NOT EXISTS "coupon_code" varchar(50),
  ADD COLUMN IF NOT EXISTS "discount_amount" numeric(10,2) DEFAULT '0',
  ADD COLUMN IF NOT EXISTS "invoice_number" varchar(50),
  ADD COLUMN IF NOT EXISTS "invoice_url" text,
  ADD COLUMN IF NOT EXISTS "refunded_at" timestamp,
  ADD COLUMN IF NOT EXISTS "refund_reason" text;

-- Unique only over non-null values (Razorpay payment id when set)
CREATE UNIQUE INDEX IF NOT EXISTS "payments_razorpay_id_idx" ON "payments" ("razorpay_payment_id") WHERE "razorpay_payment_id" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "payments_invoice_number_idx" ON "payments" ("invoice_number") WHERE "invoice_number" IS NOT NULL;

-- Guests
CREATE TABLE IF NOT EXISTS "guests" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invitation_id" uuid NOT NULL REFERENCES "invitations"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "phone" varchar(50),
  "email" varchar(255),
  "side" "guest_side" DEFAULT 'both' NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb,
  "allowed_plus_ones" integer DEFAULT 0 NOT NULL,
  "guest_slug" varchar(64) NOT NULL,
  "opened_at" timestamp,
  "rsvp_at" timestamp,
  "invitation_sent_at" timestamp,
  "invitation_channel" varchar(30),
  "note" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "guests_slug_idx" ON "guests" ("invitation_id","guest_slug");
CREATE INDEX IF NOT EXISTS "guests_invitation_idx" ON "guests" ("invitation_id");
CREATE INDEX IF NOT EXISTS "guests_phone_idx" ON "guests" ("phone");

-- Wishes (guestbook)
CREATE TABLE IF NOT EXISTS "wishes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invitation_id" uuid NOT NULL REFERENCES "invitations"("id") ON DELETE CASCADE,
  "guest_id" uuid REFERENCES "guests"("id") ON DELETE SET NULL,
  "name" varchar(255) NOT NULL,
  "message" text NOT NULL,
  "approved" boolean DEFAULT false NOT NULL,
  "flagged" boolean DEFAULT false NOT NULL,
  "ip_address" varchar(50),
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "wishes_invitation_idx" ON "wishes" ("invitation_id");
CREATE INDEX IF NOT EXISTS "wishes_approved_idx" ON "wishes" ("approved");

-- Gallery photos
CREATE TABLE IF NOT EXISTS "gallery_photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "invitation_id" uuid NOT NULL REFERENCES "invitations"("id") ON DELETE CASCADE,
  "uploader_name" varchar(255),
  "uploader_guest_id" uuid REFERENCES "guests"("id") ON DELETE SET NULL,
  "url" text NOT NULL,
  "thumbnail_url" text,
  "caption" text,
  "approved" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "gallery_invitation_idx" ON "gallery_photos" ("invitation_id");

-- Coupons
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" serial PRIMARY KEY NOT NULL,
  "code" varchar(50) NOT NULL,
  "discount_type" "coupon_discount_type" NOT NULL,
  "discount_value" integer NOT NULL,
  "applies_to" jsonb DEFAULT '{}'::jsonb,
  "min_amount" integer DEFAULT 0 NOT NULL,
  "max_redemptions" integer,
  "redemptions" integer DEFAULT 0 NOT NULL,
  "per_user_limit" integer DEFAULT 1 NOT NULL,
  "starts_at" timestamp,
  "expires_at" timestamp,
  "active" boolean DEFAULT true NOT NULL,
  "created_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" ("code");

CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "coupon_id" integer NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "payment_id" uuid REFERENCES "payments"("id") ON DELETE SET NULL,
  "discount_amount" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "coupon_redemptions_coupon_idx" ON "coupon_redemptions" ("coupon_id");
CREATE INDEX IF NOT EXISTS "coupon_redemptions_user_idx" ON "coupon_redemptions" ("user_id");

-- Referrals
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" serial PRIMARY KEY NOT NULL,
  "referrer_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "referred_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "code" varchar(20) NOT NULL,
  "signup_reward_status" "referral_reward_status" DEFAULT 'pending' NOT NULL,
  "purchase_reward_status" "referral_reward_status" DEFAULT 'pending' NOT NULL,
  "signup_credits_awarded" integer DEFAULT 0 NOT NULL,
  "purchase_credits_awarded" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "referrals_referrer_referred_idx" ON "referrals" ("referrer_user_id","referred_user_id");
CREATE INDEX IF NOT EXISTS "referrals_code_idx" ON "referrals" ("code");

-- OTP codes
CREATE TABLE IF NOT EXISTS "otp_codes" (
  "id" serial PRIMARY KEY NOT NULL,
  "identifier" varchar(255) NOT NULL,
  "code_hash" text NOT NULL,
  "purpose" "otp_purpose" NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "consumed" boolean DEFAULT false NOT NULL,
  "expires_at" timestamp NOT NULL,
  "ip_address" varchar(50),
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "otp_identifier_idx" ON "otp_codes" ("identifier");
CREATE INDEX IF NOT EXISTS "otp_expires_idx" ON "otp_codes" ("expires_at");

-- Webhook events (idempotency)
CREATE TABLE IF NOT EXISTS "webhook_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider" varchar(50) NOT NULL,
  "event_id" varchar(255) NOT NULL,
  "event_type" varchar(100) NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb,
  "processed_at" timestamp DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "webhook_events_provider_id_idx" ON "webhook_events" ("provider","event_id");

-- Message outbox
CREATE TABLE IF NOT EXISTS "message_outbox" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "invitation_id" uuid REFERENCES "invitations"("id") ON DELETE CASCADE,
  "guest_id" uuid REFERENCES "guests"("id") ON DELETE SET NULL,
  "channel" varchar(20) NOT NULL,
  "recipient" varchar(255) NOT NULL,
  "template_name" varchar(100),
  "payload" jsonb DEFAULT '{}'::jsonb,
  "status" varchar(20) DEFAULT 'queued' NOT NULL,
  "provider_message_id" varchar(255),
  "error_message" text,
  "attempts" integer DEFAULT 0 NOT NULL,
  "send_after" timestamp DEFAULT now() NOT NULL,
  "sent_at" timestamp,
  "delivered_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "outbox_status_send_after_idx" ON "message_outbox" ("status","send_after");
CREATE INDEX IF NOT EXISTS "outbox_user_idx" ON "message_outbox" ("user_id");

-- Plan history
CREATE TABLE IF NOT EXISTS "plan_history" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "from_plan" "user_plan",
  "to_plan" "user_plan" NOT NULL,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp,
  "payment_id" uuid REFERENCES "payments"("id") ON DELETE SET NULL,
  "reason" varchar(100)
);
CREATE INDEX IF NOT EXISTS "plan_history_user_idx" ON "plan_history" ("user_id");

-- Feature flags
CREATE TABLE IF NOT EXISTS "feature_flags" (
  "key" varchar(100) PRIMARY KEY NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "rollout_percent" integer DEFAULT 0 NOT NULL,
  "description" text,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
