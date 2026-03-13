-- Migration: add ad_id to ad_impressions, email_verification_token to users
ALTER TABLE "ad_impressions" ADD COLUMN IF NOT EXISTS "ad_id" varchar(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" varchar(255);
