-- NOTE: every column below is also added by the hand-written 0001 and 0002.
-- This migration was auto-generated from a snapshot that predated them, so it
-- re-adds all four. Guarded with IF NOT EXISTS: without it, applying the chain
-- to a fresh database always fails on "ad_id already exists".
ALTER TABLE "ad_impressions" ADD COLUMN IF NOT EXISTS "ad_id" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires_at" timestamp;
