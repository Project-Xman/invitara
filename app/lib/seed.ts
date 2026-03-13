import { db } from "./drizzle";
import { templates, creditPackages } from "./schema";
import { DEFAULT_CREDIT_PACKAGES } from "./credits";

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed templates
  const tmplData = [
    { id: "beach", name: "Beach Bliss", category: "Hindu Weddings", price: 3999, emoji: "🏖️", description: "Tropical elegance meets timeless tradition.", gradient: "linear-gradient(135deg,#A67C2E 0%,#D4A853 35%,#FFE49A 65%,#C49A3D 100%)", colors: { primary: "#A67C2E", secondary: "#D4A853", bg: "#FDF8F0", accent: "#F5E6CC", text: "#3A2A10", card: "#FFFDF5" }, isFree: true, sortOrder: 1 },
    { id: "city", name: "City Royale", category: "Hindu Weddings", price: 3999, emoji: "🏙️", description: "Metropolitan sophistication with golden finish.", gradient: "linear-gradient(135deg,#3A2A10 0%,#7A5A1E 40%,#D4A853 70%,#FFD466 100%)", colors: { primary: "#7A5A1E", secondary: "#D4A853", bg: "#FFFDF5", accent: "#FAF0E0", text: "#3A2A10", card: "#FFFFFF" }, isFree: true, sortOrder: 2 },
    { id: "mountain", name: "Mountain Gold", category: "Hindu Weddings", price: 3999, emoji: "🏔️", description: "Rustic grandeur in golden mountain light.", gradient: "linear-gradient(135deg,#4D3812 0%,#A67C2E 40%,#D4A853 70%,#FFE49A 100%)", colors: { primary: "#6B5C3E", secondary: "#D4A853", bg: "#FFFEFB", accent: "#F5E6CC", text: "#3A2A10", card: "#FFFDF5" }, isFree: false, sortOrder: 3 },
    { id: "royal", name: "Royal Palace", category: "Hindu Weddings", price: 4999, emoji: "👑", description: "Opulent regal design for grand celebrations.", gradient: "linear-gradient(135deg,#7A1A3A 0%,#C73866 30%,#D4A853 60%,#FFD466 100%)", colors: { primary: "#7A1A3A", secondary: "#D4A853", bg: "#FFF5F7", accent: "#FFE5EB", text: "#3A0B1D", card: "#FFFDF5" }, isFree: false, isPremium: true, sortOrder: 4 },
    { id: "garden", name: "Golden Garden", category: "Christian Weddings", price: 3999, emoji: "🌿", description: "Whimsical garden romance with golden accents.", gradient: "linear-gradient(135deg,#4D6B3A 0%,#8BAA6B 35%,#D4A853 70%,#FFE49A 100%)", colors: { primary: "#4D6B3A", secondary: "#D4A853", bg: "#FAFDF5", accent: "#E8F0DC", text: "#2A3A1A", card: "#FFFDF5" }, isFree: false, sortOrder: 5 },
    { id: "chapel", name: "Chapel Grace", category: "Christian Weddings", price: 3999, emoji: "⛪", description: "Classic elegance with golden spiritual grace.", gradient: "linear-gradient(135deg,#4A3A6B 0%,#7A6AAB 35%,#D4A853 70%,#FFD466 100%)", colors: { primary: "#4A3A6B", secondary: "#D4A853", bg: "#FAF8FD", accent: "#E8E0F0", text: "#2A1A3A", card: "#FFFDF5" }, isFree: false, sortOrder: 6 },
    { id: "meenaya", name: "Meenaya", category: "South-Indian Weddings", price: 3999, emoji: "🪔", description: "Traditional South-Indian grandeur.", gradient: "linear-gradient(135deg,#8B1A1A 0%,#C44040 30%,#D4A853 65%,#FFD466 100%)", colors: { primary: "#8B1A1A", secondary: "#D4A853", bg: "#FDF8F0", accent: "#F0E0C0", text: "#3A0A0A", card: "#FFF8F0" }, isFree: false, sortOrder: 7 },
    { id: "nikah", name: "Nikah Noor", category: "Muslim Weddings", price: 3999, emoji: "🌙", description: "Blessed celebrations with golden crescent.", gradient: "linear-gradient(135deg,#1A4A3A 0%,#2A7A5A 35%,#D4A853 70%,#FFE49A 100%)", colors: { primary: "#1A4A3A", secondary: "#D4A853", bg: "#F5FDF8", accent: "#D8F0E0", text: "#0A2A1A", card: "#FFFDF5" }, isFree: false, sortOrder: 8 },
    { id: "anand", name: "Anand Karaj", category: "Sikh Weddings", price: 3999, emoji: "☬", description: "Vibrant Sikh celebration in gold.", gradient: "linear-gradient(135deg,#B85C1A 0%,#E88A2A 35%,#D4A853 65%,#FFE49A 100%)", colors: { primary: "#B85C1A", secondary: "#D4A853", bg: "#FDF8F0", accent: "#F5E6CC", text: "#4A2A0A", card: "#FFF8F0" }, isFree: false, sortOrder: 9 },
    { id: "cherry", name: "Cherry Blossom", category: "Hindu Weddings", price: 3999, emoji: "🌸", description: "Soft cherry blossoms with golden hues.", gradient: "linear-gradient(135deg,#E8668E 0%,#FF99B5 30%,#D4A853 65%,#FFE49A 100%)", colors: { primary: "#C73866", secondary: "#D4A853", bg: "#FFF5F7", accent: "#FFE5EB", text: "#3A0B1D", card: "#FFFDF5" }, isFree: false, sortOrder: 10 },
    { id: "savethedate", name: "Save the Date", category: "Save the Date", price: 1999, emoji: "💌", description: "Minimal golden save-the-date.", gradient: "linear-gradient(135deg,#D4A853 0%,#FFE49A 40%,#D4A853 70%,#A67C2E 100%)", colors: { primary: "#A67C2E", secondary: "#D4A853", bg: "#FFFDF5", accent: "#FFF0C2", text: "#4D3812", card: "#FFFFFF" }, isFree: true, sortOrder: 11 },
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

  console.log("✨ Seed complete!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
