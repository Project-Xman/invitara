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
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
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
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("invitations_slug_idx").on(t.slug),
    index("invitations_user_idx").on(t.userId),
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
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("payments_user_idx").on(t.userId)]
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

// ━━━ CREDIT PACKAGES (purchasable) ━━━
export const creditPackages = pgTable("credit_packages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  credits: integer("credits").notNull(),
  priceInr: integer("price_inr").notNull(),
  popular: boolean("popular").notNull().default(false),
  active: boolean("active").notNull().default(true),
});

// ━━━ RELATIONS ━━━
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  invitations: many(invitations),
  payments: many(payments),
  creditTransactions: many(creditTransactions),
  aiGenerations: many(aiGenerations),
  templatePurchases: many(templatePurchases),
}));

export const invitationsRelations = relations(invitations, ({ one, many }) => ({
  user: one(users, { fields: [invitations.userId], references: [users.id] }),
  template: one(templates, { fields: [invitations.templateId], references: [templates.id] }),
  events: many(events),
  rsvps: many(rsvps),
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
