ALTER TABLE "ad_impressions" ADD COLUMN "ad_id" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_expires_at" timestamp;