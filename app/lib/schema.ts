import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  decimal,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ━━━ ENUMS ━━━
export const userPlanEnum = pgEnum("user_plan", ["free", "starter", "premium", "royal"]);
export const rsvpStatusEnum = pgEnum("rsvp_status", ["attending", "pending", "declined"]);
export const purchaseTypeEnum = pgEnum("purchase_type", ["template", "credits", "subscription"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);
export const aiGenStatusEnum = pgEnum("ai_gen_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);
export const analyticsEventEnum = pgEnum("analytics_event", [
  "page_view",
  "template_view",
  "invite_view",
  "invite_share",
  "rsvp_submit",
  "link_click",
  "qr_scan",
  "ad_impression",
  "ad_click",
  "guest_link_open",
  "gift_intent",
  "wish_posted",
]);

export const inviteStageEnum = pgEnum("invite_stage", [
  "save_the_date",
  "invite",
  "thank_you",
]);

export const guestSideEnum = pgEnum("guest_side", ["groom", "bride", "both"]);

export const couponDiscountTypeEnum = pgEnum("coupon_discount_type", ["percent", "flat"]);

export const otpPurposeEnum = pgEnum("otp_purpose", [
  "login",
  "phone_verify",
  "rsvp",
]);

export const referralRewardStatusEnum = pgEnum("referral_reward_status", [
  "pending",
  "credited",
  "void",
]);

// ━━━ USERS ━━━
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    avatarUrl: text("avatar_url"),
    plan: userPlanEnum("plan").notNull().default("free"),
    credits: integer("credits").notNull().default(3),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    emailVerified: boolean("email_verified").notNull().default(false),
    emailVerificationToken: varchar("email_verification_token", { length: 255 }),
    resetPasswordToken: varchar("reset_password_token", { length: 255 }),
    resetPasswordExpiresAt: timestamp("reset_password_expires_at"),
    showAds: boolean("show_ads").notNull().default(true),
    banned: boolean("banned").notNull().default(false),
    phoneVerified: boolean("phone_verified").notNull().default(false),
    planExpiresAt: timestamp("plan_expires_at"),
    subdomain: varchar("subdomain", { length: 63 }),
    referralCode: varchar("referral_code", { length: 20 }),
    referredByUserId: uuid("referred_by_user_id"),
    preferredLocale: varchar("preferred_locale", { length: 10 }).notNull().default("en"),
    cookieConsentAt: timestamp("cookie_consent_at"),
    deletedAt: timestamp("deleted_at"),
    deletionScheduledAt: timestamp("deletion_scheduled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_subdomain_idx").on(t.subdomain),
    uniqueIndex("users_referral_code_idx").on(t.referralCode),
    index("users_phone_idx").on(t.phone),
  ]
);

// ━━━ SESSIONS ━━━
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("sessions_token_idx").on(t.token), index("sessions_user_idx").on(t.userId)]
);

// ━━━ TEMPLATES ━━━
export const templates = pgTable(
  "templates",
  {
    id: varchar("id", { length: 100 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    price: integer("price").notNull().default(3999),
    emoji: varchar("emoji", { length: 10 }).notNull(),
    description: text("description").notNull(),
    gradient: text("gradient").notNull(),
    colors: jsonb("colors").notNull().$type<{
      primary: string;
      secondary: string;
      bg: string;
      accent: string;
      text: string;
      card: string;
    }>(),
    isFree: boolean("is_free").notNull().default(false),
    isPremium: boolean("is_premium").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    previewImages: jsonb("preview_images").$type<string[]>().default([]),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("templates_category_idx").on(t.category)]
);

// ━━━ TEMPLATE PURCHASES ━━━
export const templatePurchases = pgTable(
  "template_purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: varchar("template_id", { length: 100 })
      .notNull()
      .references(() => templates.id),
    purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("user_template_idx").on(t.userId, t.templateId)]
);

// ━━━ PLANS ━━━
export const plans = pgTable("plans", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  price: integer("price").notNull().default(0),
  showAds: boolean("show_ads").notNull().default(false),
  credits: integer("credits").notNull().default(0),
  maxPublished: integer("max_published").notNull().default(1),
  maxEvents: integer("max_events").notNull().default(2),
  maxPhotos: integer("max_photos").notNull().default(3),
  badge: varchar("badge", { length: 100 }),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ━━━ ADS ━━━
export const ads = pgTable("ads", {
  id: varchar("id", { length: 100 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  ctaText: varchar("cta_text", { length: 100 }).notNull(),
  ctaLink: text("cta_link").notNull(),
  gradient: text("gradient").notNull(),
  icon: varchar("icon", { length: 50 }).notNull().default(""),
  slot: varchar("slot", { length: 50 }).notNull(),
  priority: integer("priority").notNull().default(0),
  active: boolean("active").notNull().default(true),
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ━━━ INVITATIONS ━━━
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: varchar("template_id", { length: 100 })
      .notNull()
      .references(() => templates.id),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    groomName: varchar("groom_name", { length: 255 }).notNull(),
    brideName: varchar("bride_name", { length: 255 }).notNull(),
    groomFamily: text("groom_family"),
    brideFamily: text("bride_family"),
    blessingFrom: text("blessing_from"),
    mantra: text("mantra"),
    message: text("message"),
    hashtag: varchar("hashtag", { length: 100 }),
    weddingDate: timestamp("wedding_date"),
    venue: text("venue"),
    mapLink: text("map_link"),
    instagramLink: text("instagram_link"),
    whatsappNumber: varchar("whatsapp_number", { length: 50 }),
    customCss: text("custom_css"),
    musicUrl: text("music_url"),
    photos: jsonb("photos").$type<string[]>().default([]),
    published: boolean("published").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    stage: inviteStageEnum("stage").notNull().default("invite"),
    livestreamUrl: text("livestream_url"),
    livestreamProvider: varchar("livestream_provider", { length: 50 }),
    upiId: varchar("upi_id", { length: 100 }),
    upiPayeeName: varchar("upi_payee_name", { length: 100 }),
    giftRegistryUrl: text("gift_registry_url"),
    giftMessage: text("gift_message"),
    guestbookEnabled: boolean("guestbook_enabled").notNull().default(true),
    guestbookRequiresApproval: boolean("guestbook_requires_approval").notNull().default(true),
    galleryEnabled: boolean("gallery_enabled").notNull().default(false),
    galleryAcceptsUploads: boolean("gallery_accepts_uploads").notNull().default(false),
    locale: varchar("locale", { length: 10 }).notNull().default("en"),
    rsvpDeadline: timestamp("rsvp_deadline"),
    rsvpEnabled: boolean("rsvp_enabled").notNull().default(true),
    qrCodeUrl: text("qr_code_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("invitations_slug_idx").on(t.slug),
    index("invitations_user_idx").on(t.userId),
    index("invitations_published_idx").on(t.published),
  ]
);

// ━━━ EVENTS ━━━
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    date: text("date"),
    venue: text("venue"),
    time: text("time"),
    icon: varchar("icon", { length: 10 }).notNull().default("🎉"),
    color: varchar("color", { length: 20 }).notNull().default("#D4A853"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("events_invitation_idx").on(t.invitationId)]
);

// ━━━ RSVPS ━━━
export const rsvps = pgTable(
  "rsvps",
  {
    id: serial("id").primaryKey(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    guests: integer("guests").notNull().default(1),
    status: rsvpStatusEnum("status").notNull().default("pending"),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    message: text("message"),
    eventsAttending: jsonb("events_attending").$type<string[]>().default([]),
    respondedAt: timestamp("responded_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("rsvps_invitation_idx").on(t.invitationId)]
);

// ━━━ PAYMENTS ━━━
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: purchaseTypeEnum("type").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
    razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
    razorpayOrderId: varchar("razorpay_order_id", { length: 255 }),
    couponCode: varchar("coupon_code", { length: 50 }),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    invoiceUrl: text("invoice_url"),
    refundedAt: timestamp("refunded_at"),
    refundReason: text("refund_reason"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("payments_user_idx").on(t.userId),
    uniqueIndex("payments_razorpay_id_idx").on(t.razorpayPaymentId),
    uniqueIndex("payments_invoice_number_idx").on(t.invoiceNumber),
  ]
);

// ━━━ CREDIT TRANSACTIONS ━━━
export const creditTransactions = pgTable(
  "credit_transactions",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(), // positive = credit, negative = debit
    balance: integer("balance").notNull(),
    reason: varchar("reason", { length: 255 }).notNull(),
    referenceId: varchar("reference_id", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("credits_user_idx").on(t.userId)]
);

// ━━━ AI GENERATIONS ━━━
export const aiGenerations = pgTable(
  "ai_generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitationId: uuid("invitation_id").references(() => invitations.id, { onDelete: "set null" }),
    prompt: text("prompt").notNull(),
    style: varchar("style", { length: 100 }),
    result: jsonb("result").$type<{
      html?: string;
      css?: string;
      gradient?: string;
      colors?: Record<string, string>;
      suggestions?: string[];
    }>(),
    creditsUsed: integer("credits_used").notNull().default(1),
    status: aiGenStatusEnum("status").notNull().default("pending"),
    modelUsed: varchar("model_used", { length: 100 }).default("gemini-nano"),
    processingTimeMs: integer("processing_time_ms"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("ai_gen_user_idx").on(t.userId)]
);

// ━━━ ANALYTICS ━━━
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: serial("id").primaryKey(),
    invitationId: uuid("invitation_id").references(() => invitations.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    event: analyticsEventEnum("event").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    country: varchar("country", { length: 10 }),
    device: varchar("device", { length: 50 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("analytics_invitation_idx").on(t.invitationId),
    index("analytics_event_idx").on(t.event),
    index("analytics_created_idx").on(t.createdAt),
    index("analytics_user_created_idx").on(t.userId, t.createdAt),
  ]
);

// ━━━ AD IMPRESSIONS ━━━
export const adImpressions = pgTable("ad_impressions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  adSlot: varchar("ad_slot", { length: 100 }).notNull(),
  adId: varchar("ad_id", { length: 100 }),
  adProvider: varchar("ad_provider", { length: 50 }).notNull().default("internal"),
  clicked: boolean("clicked").notNull().default(false),
  revenue: decimal("revenue", { precision: 10, scale: 4 }).default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ━━━ ADMIN AUDIT LOG ━━━
export const adminAuditLog = pgTable(
  "admin_audit_log",
  {
    id: serial("id").primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: varchar("target_id", { length: 255 }).notNull(),
    details: jsonb("details").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_admin_idx").on(t.adminId), index("audit_created_idx").on(t.createdAt)]
);

// ━━━ CREDIT PACKAGES (purchasable) ━━━
export const creditPackages = pgTable("credit_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  credits: integer("credits").notNull(),
  priceInr: integer("price_inr").notNull(),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

// ━━━ GUESTS (personalized invite links + tracking) ━━━
export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    side: guestSideEnum("side").notNull().default("both"),
    tags: jsonb("tags").$type<string[]>().default([]),
    allowedPlusOnes: integer("allowed_plus_ones").notNull().default(0),
    guestSlug: varchar("guest_slug", { length: 64 }).notNull(),
    openedAt: timestamp("opened_at"),
    rsvpAt: timestamp("rsvp_at"),
    invitationSentAt: timestamp("invitation_sent_at"),
    invitationChannel: varchar("invitation_channel", { length: 30 }),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("guests_slug_idx").on(t.invitationId, t.guestSlug),
    index("guests_invitation_idx").on(t.invitationId),
    index("guests_phone_idx").on(t.phone),
  ]
);

// ━━━ WISHES (guestbook) ━━━
export const wishes = pgTable(
  "wishes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    message: text("message").notNull(),
    approved: boolean("approved").notNull().default(false),
    flagged: boolean("flagged").notNull().default(false),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("wishes_invitation_idx").on(t.invitationId),
    index("wishes_approved_idx").on(t.approved),
  ]
);

// ━━━ GALLERY PHOTOS (post-wedding, guest uploads) ━━━
export const galleryPhotos = pgTable(
  "gallery_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    uploaderName: varchar("uploader_name", { length: 255 }),
    uploaderGuestId: uuid("uploader_guest_id").references(() => guests.id, {
      onDelete: "set null",
    }),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    caption: text("caption"),
    approved: boolean("approved").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("gallery_invitation_idx").on(t.invitationId)]
);

// ━━━ COUPONS ━━━
export const coupons = pgTable(
  "coupons",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    discountType: couponDiscountTypeEnum("discount_type").notNull(),
    discountValue: integer("discount_value").notNull(),
    appliesTo: jsonb("applies_to").$type<{
      types?: ("template" | "credits" | "subscription")[];
      planIds?: string[];
    }>().default({}),
    minAmount: integer("min_amount").notNull().default(0),
    maxRedemptions: integer("max_redemptions"),
    redemptions: integer("redemptions").notNull().default(0),
    perUserLimit: integer("per_user_limit").notNull().default(1),
    startsAt: timestamp("starts_at"),
    expiresAt: timestamp("expires_at"),
    active: boolean("active").notNull().default(true),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("coupons_code_idx").on(t.code)]
);

export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: serial("id").primaryKey(),
    couponId: integer("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    discountAmount: integer("discount_amount").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("coupon_redemptions_coupon_idx").on(t.couponId),
    index("coupon_redemptions_user_idx").on(t.userId),
  ]
);

// ━━━ REFERRALS ━━━
export const referrals = pgTable(
  "referrals",
  {
    id: serial("id").primaryKey(),
    referrerUserId: uuid("referrer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredUserId: uuid("referred_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    code: varchar("code", { length: 20 }).notNull(),
    signupRewardStatus: referralRewardStatusEnum("signup_reward_status").notNull().default("pending"),
    purchaseRewardStatus: referralRewardStatusEnum("purchase_reward_status").notNull().default("pending"),
    signupCreditsAwarded: integer("signup_credits_awarded").notNull().default(0),
    purchaseCreditsAwarded: integer("purchase_credits_awarded").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("referrals_referrer_referred_idx").on(t.referrerUserId, t.referredUserId),
    index("referrals_code_idx").on(t.code),
  ]
);

// ━━━ OTP CODES (phone / email OTP login) ━━━
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: serial("id").primaryKey(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    codeHash: text("code_hash").notNull(),
    purpose: otpPurposeEnum("purpose").notNull(),
    attempts: integer("attempts").notNull().default(0),
    consumed: boolean("consumed").notNull().default(false),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 50 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("otp_identifier_idx").on(t.identifier),
    index("otp_expires_idx").on(t.expiresAt),
  ]
);

// ━━━ WEBHOOK EVENTS (idempotency log) ━━━
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: serial("id").primaryKey(),
    provider: varchar("provider", { length: 50 }).notNull(),
    eventId: varchar("event_id", { length: 255 }).notNull(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    processedAt: timestamp("processed_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("webhook_events_provider_id_idx").on(t.provider, t.eventId)]
);

// ━━━ MESSAGE OUTBOX (WhatsApp/SMS/Email bulk sends) ━━━
export const messageOutbox = pgTable(
  "message_outbox",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitationId: uuid("invitation_id").references(() => invitations.id, { onDelete: "cascade" }),
    guestId: uuid("guest_id").references(() => guests.id, { onDelete: "set null" }),
    channel: varchar("channel", { length: 20 }).notNull(),
    recipient: varchar("recipient", { length: 255 }).notNull(),
    templateName: varchar("template_name", { length: 100 }),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
    status: varchar("status", { length: 20 }).notNull().default("queued"),
    providerMessageId: varchar("provider_message_id", { length: 255 }),
    errorMessage: text("error_message"),
    attempts: integer("attempts").notNull().default(0),
    sendAfter: timestamp("send_after").notNull().defaultNow(),
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("outbox_status_send_after_idx").on(t.status, t.sendAfter),
    index("outbox_user_idx").on(t.userId),
  ]
);

// ━━━ PLAN HISTORY (subscription audit + renewal) ━━━
export const planHistory = pgTable(
  "plan_history",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fromPlan: userPlanEnum("from_plan"),
    toPlan: userPlanEnum("to_plan").notNull(),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    reason: varchar("reason", { length: 100 }),
  },
  (t) => [index("plan_history_user_idx").on(t.userId)]
);

// ━━━ FEATURE FLAGS ━━━
export const featureFlags = pgTable(
  "feature_flags",
  {
    key: varchar("key", { length: 100 }).primaryKey(),
    enabled: boolean("enabled").notNull().default(false),
    rolloutPercent: integer("rollout_percent").notNull().default(0),
    description: text("description"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

// ━━━ RELATIONS ━━━
export const usersRelations = relations(users, ({ many, one }) => ({
  sessions: many(sessions),
  invitations: many(invitations),
  payments: many(payments),
  creditTransactions: many(creditTransactions),
  aiGenerations: many(aiGenerations),
  templatePurchases: many(templatePurchases),
  planHistory: many(planHistory),
  referralsMade: many(referrals, { relationName: "referrer" }),
  couponRedemptions: many(couponRedemptions),
  referredBy: one(users, {
    fields: [users.referredByUserId],
    references: [users.id],
    relationName: "referrer_self",
  }),
}));

export const invitationsRelations = relations(invitations, ({ one, many }) => ({
  user: one(users, { fields: [invitations.userId], references: [users.id] }),
  template: one(templates, { fields: [invitations.templateId], references: [templates.id] }),
  events: many(events),
  rsvps: many(rsvps),
  guests: many(guests),
  wishes: many(wishes),
  galleryPhotos: many(galleryPhotos),
  analytics: many(analyticsEvents),
  aiGenerations: many(aiGenerations),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  invitation: one(invitations, { fields: [events.invitationId], references: [invitations.id] }),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  invitation: one(invitations, { fields: [rsvps.invitationId], references: [invitations.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const templatePurchasesRelations = relations(templatePurchases, ({ one }) => ({
  user: one(users, { fields: [templatePurchases.userId], references: [users.id] }),
  template: one(templates, { fields: [templatePurchases.templateId], references: [templates.id] }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  invitation: one(invitations, { fields: [analyticsEvents.invitationId], references: [invitations.id] }),
  user: one(users, { fields: [analyticsEvents.userId], references: [users.id] }),
}));

export const aiGenerationsRelations = relations(aiGenerations, ({ one }) => ({
  user: one(users, { fields: [aiGenerations.userId], references: [users.id] }),
  invitation: one(invitations, { fields: [aiGenerations.invitationId], references: [invitations.id] }),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  invitation: one(invitations, { fields: [guests.invitationId], references: [invitations.id] }),
  wishes: many(wishes),
}));

export const wishesRelations = relations(wishes, ({ one }) => ({
  invitation: one(invitations, { fields: [wishes.invitationId], references: [invitations.id] }),
  guest: one(guests, { fields: [wishes.guestId], references: [guests.id] }),
}));

export const galleryPhotosRelations = relations(galleryPhotos, ({ one }) => ({
  invitation: one(invitations, { fields: [galleryPhotos.invitationId], references: [invitations.id] }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  redemptions: many(couponRedemptions),
}));

export const couponRedemptionsRelations = relations(couponRedemptions, ({ one }) => ({
  coupon: one(coupons, { fields: [couponRedemptions.couponId], references: [coupons.id] }),
  user: one(users, { fields: [couponRedemptions.userId], references: [users.id] }),
  payment: one(payments, { fields: [couponRedemptions.paymentId], references: [payments.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, { fields: [referrals.referrerUserId], references: [users.id] }),
  referred: one(users, { fields: [referrals.referredUserId], references: [users.id] }),
}));

export const messageOutboxRelations = relations(messageOutbox, ({ one }) => ({
  user: one(users, { fields: [messageOutbox.userId], references: [users.id] }),
  invitation: one(invitations, { fields: [messageOutbox.invitationId], references: [invitations.id] }),
  guest: one(guests, { fields: [messageOutbox.guestId], references: [guests.id] }),
}));

export const planHistoryRelations = relations(planHistory, ({ one }) => ({
  user: one(users, { fields: [planHistory.userId], references: [users.id] }),
  payment: one(payments, { fields: [planHistory.paymentId], references: [payments.id] }),
}));
