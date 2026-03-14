import { db } from "./drizzle";
import { templates, creditPackages, plans, ads } from "./schema";
import { DEFAULT_CREDIT_PACKAGES } from "./credits";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed templates
  const tmplData = [
    {
      id: "beach",
      name: "Beach Bliss",
      category: "Hindu Weddings",
      price: 3999,
      emoji: "🏖️",
      description: "Tropical elegance with wave-like flowing sections.",
      gradient: "linear-gradient(135deg,#0A6B7A 0%,#2AA198 30%,#F5D5A0 65%,#FFE4B5 100%)",
      colors: {
        primary: "#0A6B7A",
        secondary: "#D4A853",
        bg: "#FFF9F0",
        accent: "#E8F0F0",
        text: "#2A3A3A",
        card: "#FFFFFF",
      },
      isFree: true,
      sortOrder: 1,
    },
    {
      id: "city",
      name: "City Royale",
      category: "Hindu Weddings",
      price: 3999,
      emoji: "🏙️",
      description: "Metropolitan sophistication with Art Deco gold.",
      gradient: "linear-gradient(180deg,#1A1A1A 0%,#2C2218 40%,#4A3520 70%,#D4A853 100%)",
      colors: {
        primary: "#D4A853",
        secondary: "#FFD466",
        bg: "#0F0F0F",
        accent: "#1E1A14",
        text: "#F5F0E8",
        card: "#1A1714",
      },
      isFree: true,
      sortOrder: 2,
    },
    {
      id: "mountain",
      name: "Mountain Gold",
      category: "Hindu Weddings",
      price: 3999,
      emoji: "🏔️",
      description: "Rustic mountain retreat with earthy forest greens.",
      gradient: "linear-gradient(180deg,#1A3325 0%,#2D5A3E 35%,#7A9B6D 65%,#D4A853 100%)",
      colors: {
        primary: "#2D5A3E",
        secondary: "#D4A853",
        bg: "#F5F8F3",
        accent: "#E0E8D8",
        text: "#1A2A1A",
        card: "#FAFDF7",
      },
      isFree: false,
      sortOrder: 3,
    },
    {
      id: "royal",
      name: "Royal Palace",
      category: "Hindu Weddings",
      price: 4999,
      emoji: "👑",
      description: "Opulent regal design for grand celebrations.",
      gradient: "linear-gradient(135deg,#7A1A3A 0%,#C73866 30%,#D4A853 60%,#FFD466 100%)",
      colors: {
        primary: "#7A1A3A",
        secondary: "#D4A853",
        bg: "#FFF5F7",
        accent: "#FFE5EB",
        text: "#3A0B1D",
        card: "#FFFDF5",
      },
      isFree: false,
      isPremium: true,
      sortOrder: 4,
    },
    {
      id: "garden",
      name: "Golden Garden",
      category: "Christian Weddings",
      price: 3999,
      emoji: "🌿",
      description: "Whimsical garden romance with golden accents.",
      gradient: "linear-gradient(135deg,#4D6B3A 0%,#8BAA6B 35%,#D4A853 70%,#FFE49A 100%)",
      colors: {
        primary: "#4D6B3A",
        secondary: "#D4A853",
        bg: "#FAFDF5",
        accent: "#E8F0DC",
        text: "#2A3A1A",
        card: "#FFFDF5",
      },
      isFree: false,
      sortOrder: 5,
    },
    {
      id: "chapel",
      name: "Chapel Grace",
      category: "Christian Weddings",
      price: 3999,
      emoji: "⛪",
      description: "Classic elegance with golden spiritual grace.",
      gradient: "linear-gradient(135deg,#4A3A6B 0%,#7A6AAB 35%,#D4A853 70%,#FFD466 100%)",
      colors: {
        primary: "#4A3A6B",
        secondary: "#D4A853",
        bg: "#FAF8FD",
        accent: "#E8E0F0",
        text: "#2A1A3A",
        card: "#FFFDF5",
      },
      isFree: false,
      sortOrder: 6,
    },
    {
      id: "meenaya",
      name: "Meenaya",
      category: "South-Indian Weddings",
      price: 3999,
      emoji: "🪔",
      description: "Traditional South-Indian grandeur with rangoli borders.",
      gradient: "linear-gradient(135deg,#5C0A0A 0%,#8B1A1A 30%,#C44040 55%,#D4A853 100%)",
      colors: {
        primary: "#8B1A1A",
        secondary: "#D4A853",
        bg: "#FDF5F0",
        accent: "#F0DCC0",
        text: "#3A0A0A",
        card: "#FFF8F0",
      },
      isFree: false,
      sortOrder: 7,
    },
    {
      id: "nikah",
      name: "Raabta",
      category: "Muslim Weddings",
      price: 3999,
      emoji: "🌙",
      description: "Elegant Islamic design with arabesque arches.",
      gradient: "linear-gradient(135deg,#0A3A2A 0%,#145A42 35%,#D4A853 70%,#FFE49A 100%)",
      colors: {
        primary: "#0A3A2A",
        secondary: "#D4A853",
        bg: "#F5FDF8",
        accent: "#D8F0E0",
        text: "#0A2A1A",
        card: "#FFFDF5",
      },
      isFree: false,
      sortOrder: 8,
    },
    {
      id: "anand",
      name: "Laavan",
      category: "Sikh Weddings",
      price: 3999,
      emoji: "☬",
      description: "Sacred Sikh celebration with four Laavan section.",
      gradient: "linear-gradient(135deg,#B85C1A 0%,#E88A2A 30%,#FFB347 55%,#FFF0D0 100%)",
      colors: {
        primary: "#B85C1A",
        secondary: "#E88A2A",
        bg: "#FFF8F0",
        accent: "#FFE8CC",
        text: "#4A2A0A",
        card: "#FFFDF5",
      },
      isFree: false,
      sortOrder: 9,
    },
    {
      id: "cherry",
      name: "Cherry Blossom",
      category: "Hindu Weddings",
      price: 3999,
      emoji: "🌸",
      description: "Soft cherry blossoms with golden hues.",
      gradient: "linear-gradient(135deg,#E8668E 0%,#FF99B5 30%,#D4A853 65%,#FFE49A 100%)",
      colors: {
        primary: "#C73866",
        secondary: "#D4A853",
        bg: "#FFF5F7",
        accent: "#FFE5EB",
        text: "#3A0B1D",
        card: "#FFFDF5",
      },
      isFree: false,
      sortOrder: 10,
    },
    {
      id: "savethedate",
      name: "Save the Date",
      category: "Save the Date",
      price: 1999,
      emoji: "💌",
      description: "Minimal golden save-the-date.",
      gradient: "linear-gradient(135deg,#D4A853 0%,#FFE49A 40%,#D4A853 70%,#A67C2E 100%)",
      colors: {
        primary: "#A67C2E",
        secondary: "#D4A853",
        bg: "#FFFDF5",
        accent: "#FFF0C2",
        text: "#4D3812",
        card: "#FFFFFF",
      },
      isFree: true,
      sortOrder: 11,
    },
    {
      id: "whimsical",
      name: "Whimsical Dream",
      category: "Hindu Weddings",
      price: 3999,
      emoji: "🦋",
      description: "Dreamy pastels with organic flowing shapes.",
      gradient: "linear-gradient(135deg,#E8A0C8 0%,#C8B0E8 30%,#A0D8E0 55%,#D4A853 100%)",
      colors: {
        primary: "#C47DB5",
        secondary: "#D4A853",
        bg: "#FFF5FA",
        accent: "#F0E5F5",
        text: "#3A2A35",
        card: "#FFFBFE",
      },
      isFree: false,
      sortOrder: 12,
    },
    {
      id: "city2",
      name: "City Minimal",
      category: "Hindu Weddings",
      price: 3999,
      emoji: "🖤",
      description: "Ultra-minimal design with clean typography.",
      gradient: "linear-gradient(180deg,#FFFFFF 0%,#F5F5F5 40%,#1A1A1A 70%,#D4A853 100%)",
      colors: {
        primary: "#1A1A1A",
        secondary: "#D4A853",
        bg: "#FFFFFF",
        accent: "#F5F5F5",
        text: "#1A1A1A",
        card: "#FAFAFA",
      },
      isFree: false,
      sortOrder: 13,
    },
  ];

  for (const t of tmplData) {
    await db.insert(templates).values(t).onConflictDoNothing();
  }
  console.log(`  ✅ ${tmplData.length} templates seeded`);

  // Seed credit packages
  for (const pkg of DEFAULT_CREDIT_PACKAGES) {
    await db.insert(creditPackages).values(pkg).onConflictDoNothing();
  }
  console.log(`  ✅ ${DEFAULT_CREDIT_PACKAGES.length} credit packages seeded`);

  // Seed plans
  await db.insert(plans).values([
    {
      id: "free", name: "Free", price: 0, showAds: true, credits: 3,
      maxPublished: 1, maxEvents: 2, maxPhotos: 3, sortOrder: 0,
      features: ["2 Free Templates", "1 Published Invitation", "Up to 2 Events", "Basic Photo Gallery", "RSVP via WhatsApp", "Invitara Branding", "Ads Shown", "3 AI Credits"],
    },
    {
      id: "starter", name: "Starter", price: 2999, showAds: false, credits: 5,
      maxPublished: 3, maxEvents: 5, maxPhotos: 8, sortOrder: 1,
      features: ["Purchase Templates Individually", "Up to 3 Published Invitations", "Up to 5 Events", "Photo Gallery (8 photos)", "RSVP Dashboard", "No Ads", "Remove Branding", "5 Bonus AI Credits"],
    },
    {
      id: "premium", name: "Premium", price: 3999, showAds: false, credits: 15,
      maxPublished: 10, maxEvents: 0, maxPhotos: 20, badge: "Most Popular", sortOrder: 2,
      features: ["ALL Templates Included", "Up to 10 Published Invitations", "Unlimited Events", "Photo Gallery (20 photos)", "RSVP Dashboard + Analytics", "No Ads", "Custom Domain", "Background Music", "15 Bonus AI Credits", "Priority Support"],
    },
    {
      id: "royal", name: "Royal", price: 6999, showAds: false, credits: 50,
      maxPublished: 0, maxEvents: 0, maxPhotos: 50, sortOrder: 3,
      features: ["Everything in Premium", "Unlimited Published Invitations", "Custom Design Tweaks", "Video Background", "Multi-language Support", "Guest Management CRM", "QR Code Invites", "50 Bonus AI Credits", "Concierge Setup", "Dedicated Manager"],
    },
  ]).onConflictDoNothing();
  console.log("  ✅ 4 plans seeded");

  // Seed ads
  await db.insert(ads).values([
    { id: "upgrade-premium", slot: "hero_banner", title: "Go Premium", description: "Remove ads, unlock all templates, get AI design credits & custom domain.", ctaText: "Upgrade Now", ctaLink: "/pricing", gradient: "linear-gradient(135deg, #A67C2E 0%, #D4A853 50%, #FFD466 100%)", icon: "", priority: 10 },
    { id: "ai-credits", slot: "editor_bottom", title: "AI-Powered Designs", description: "Let AI generate unique color palettes and design suggestions for your invite.", ctaText: "Try AI Design", ctaLink: "/ai-generate", gradient: "linear-gradient(135deg, #4A3A6B 0%, #7A6AAB 50%, #D4A853 100%)", icon: "", priority: 8 },
    { id: "credit-sale", slot: "dashboard_top", title: "Credit Sale!", description: "Get 15 AI generation credits for just \u20B9249.", ctaText: "Buy Credits", ctaLink: "/account", gradient: "linear-gradient(135deg, #C73866 0%, #E8668E 50%, #D4A853 100%)", icon: "", priority: 7 },
    { id: "share-invite", slot: "preview_footer", title: "Love your invite?", description: "Share Invitara with friends & earn 2 free AI credits per referral!", ctaText: "Share & Earn", ctaLink: "/account", gradient: "linear-gradient(135deg, #1A4A3A 0%, #2A7A5A 50%, #D4A853 100%)", icon: "", priority: 5 },
    { id: "template-new", slot: "template_sidebar", title: "New: Cherry Blossom", description: "Our newest template — golden cherry blossoms for spring weddings.", ctaText: "Preview Template", ctaLink: "/templates", gradient: "linear-gradient(135deg, #E8668E 0%, #FF99B5 50%, #D4A853 100%)", icon: "", priority: 6 },
    { id: "between-events-upgrade", slot: "between_events", title: "Remove this ad", description: "Upgrade to Premium for an ad-free experience.", ctaText: "Go Ad-Free", ctaLink: "/pricing", gradient: "linear-gradient(135deg, #D4A853 0%, #FFE49A 100%)", icon: "", priority: 3 },
  ]).onConflictDoNothing();
  console.log("  ✅ 6 ads seeded");

  console.log("✨ Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
