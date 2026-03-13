import { db } from "./drizzle";
import { aiGenerations, users } from "./schema";
import { eq, desc } from "drizzle-orm";
import { debitCredits, CREDIT_COSTS } from "./credits";

// ━━━ AI GENERATION TYPES ━━━
export interface AIDesignRequest {
  userId: string;
  invitationId?: string;
  prompt: string;
  style?: "traditional" | "modern" | "minimalist" | "ornate" | "rustic" | "royal";
}

export interface AIDesignResult {
  gradient: string;
  colors: {
    primary: string;
    secondary: string;
    bg: string;
    accent: string;
    text: string;
    card: string;
  };
  suggestions: string[];
  cssOverrides?: string;
  layoutHints?: string[];
}

// ━━━ STYLE PRESETS for prompt enrichment ━━━
const STYLE_PROMPTS: Record<string, string> = {
  traditional: "classic Indian wedding, rich golds, deep reds, ornamental borders, paisley motifs",
  modern: "contemporary minimalist, clean typography, subtle gold accents, geometric patterns",
  minimalist: "ultra-clean, lots of whitespace, single gold accent color, elegant simplicity",
  ornate: "heavily decorated, intricate gold filigree, royal patterns, mandala-inspired",
  rustic: "earthy warm tones, natural textures, muted gold, handcrafted feel",
  royal: "regal opulence, deep jewel tones with gold, palace-inspired, majestic",
};

// ━━━ CHECK NANO AVAILABILITY (client-side helper) ━━━
export function getGeminiNanoScript(): string {
  return `
    async function checkNanoAvailability() {
      try {
        if ('ai' in window && 'languageModel' in window.ai) {
          const caps = await window.ai.languageModel.capabilities();
          return caps.available === 'readily' || caps.available === 'after-download';
        }
      } catch (e) {}
      return false;
    }

    async function generateWithNano(prompt) {
      try {
        if (!('ai' in window)) throw new Error('No AI API');
        const session = await window.ai.languageModel.create({
          systemPrompt: \`You are a wedding invitation design expert.
          Generate a JSON response ONLY (no markdown) with:
          {
            "gradient": "CSS linear-gradient string using gold/warm tones",
            "colors": { "primary": "#hex", "secondary": "#hex", "bg": "#hex", "accent": "#hex", "text": "#hex", "card": "#hex" },
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
            "layoutHints": ["hint1", "hint2"]
          }
          Use golden/warm wedding palettes. Keep it elegant.\`
        });
        const result = await session.prompt(prompt);
        session.destroy();
        const parsed = JSON.parse(result);
        return { success: true, data: parsed, model: 'gemini-nano' };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
  `;
}

// ━━━ SERVER-SIDE FALLBACK GENERATION ━━━
// When Gemini Nano is unavailable, use algorithmic generation
function generateDesignFallback(prompt: string, style?: string): AIDesignResult {
  const p = prompt.toLowerCase();
  const s = style || "traditional";

  // Seed-based color generation from prompt
  let seed = 0;
  for (let i = 0; i < p.length; i++) seed = ((seed << 5) - seed + p.charCodeAt(i)) | 0;
  const hue = Math.abs(seed % 60) + 20; // Gold range: 20-80
  const sat = 40 + Math.abs((seed >> 8) % 30);

  const palettes: Record<string, AIDesignResult> = {
    traditional: {
      gradient: `linear-gradient(135deg, hsl(${hue},${sat}%,25%) 0%, hsl(${hue},${sat + 10}%,45%) 35%, hsl(${hue + 5},${sat + 15}%,65%) 65%, hsl(${hue},${sat}%,35%) 100%)`,
      colors: {
        primary: `hsl(${hue},${sat}%,30%)`,
        secondary: "#D4A853",
        bg: "#FDF8F0",
        accent: "#F5E6CC",
        text: "#3A2A10",
        card: "#FFFDF5",
      },
      suggestions: [
        "Add ornate borders with paisley motifs",
        "Use Devanagari script accents for headings",
        "Include traditional marigold decorations",
      ],
      layoutHints: ["Center-aligned with ornamental dividers", "Gold borders on event cards"],
    },
    modern: {
      gradient: `linear-gradient(135deg, #2A2A2A 0%, hsl(${hue},${sat}%,40%) 50%, #1A1A1A 100%)`,
      colors: {
        primary: "#1A1A1A",
        secondary: "#D4A853",
        bg: "#FAFAFA",
        accent: "#F0F0F0",
        text: "#1A1A1A",
        card: "#FFFFFF",
      },
      suggestions: [
        "Use asymmetric layout for a contemporary feel",
        "Pair gold accents with clean sans-serif type",
        "Add subtle animation on scroll",
      ],
      layoutHints: ["Left-aligned text with right image", "Minimal ornaments"],
    },
    minimalist: {
      gradient: `linear-gradient(135deg, #D4A853 0%, #FFE49A 50%, #C49A3D 100%)`,
      colors: {
        primary: "#A67C2E",
        secondary: "#D4A853",
        bg: "#FFFFFF",
        accent: "#FAF8F5",
        text: "#333333",
        card: "#FFFFFF",
      },
      suggestions: [
        "Let whitespace do the talking",
        "Single font family throughout",
        "Gold only for key accents",
      ],
      layoutHints: ["Maximum whitespace", "Single column layout"],
    },
    ornate: {
      gradient: `linear-gradient(135deg, #4D1A1A 0%, #8B2A2A 25%, #D4A853 55%, #FFD466 80%, #A67C2E 100%)`,
      colors: {
        primary: "#6B1A1A",
        secondary: "#D4A853",
        bg: "#FDF5F0",
        accent: "#F0DCC0",
        text: "#3A1010",
        card: "#FFF8F2",
      },
      suggestions: [
        "Layer multiple gold border ornaments",
        "Add mandala watermarks behind text",
        "Use gradient gold text for couple names",
      ],
      layoutHints: ["Heavily decorated borders", "Multiple overlay decorations"],
    },
    rustic: {
      gradient: `linear-gradient(135deg, #5C4A2A 0%, #8B7A5A 35%, #C4A06A 65%, #D4A853 100%)`,
      colors: {
        primary: "#5C4A2A",
        secondary: "#C4A06A",
        bg: "#F8F5F0",
        accent: "#E8DCC8",
        text: "#3A2A10",
        card: "#FFFDF8",
      },
      suggestions: [
        "Add paper texture background",
        "Use hand-drawn style icons",
        "Earth tone flowers in gallery",
      ],
      layoutHints: ["Organic shapes", "Textured backgrounds"],
    },
    royal: {
      gradient: `linear-gradient(135deg, #1A0A2A 0%, #3A1A5A 25%, #D4A853 55%, #FFD466 80%, #A67C2E 100%)`,
      colors: {
        primary: "#2A1040",
        secondary: "#D4A853",
        bg: "#FAF5FF",
        accent: "#E8D8F0",
        text: "#1A0A2A",
        card: "#FFFDF5",
      },
      suggestions: [
        "Crown motifs for couple names",
        "Royal purple with gold accents",
        "Palace-inspired arch frames",
      ],
      layoutHints: ["Symmetrical royal layout", "Framed sections"],
    },
  };

  return palettes[s] || palettes.traditional;
}

// ━━━ GENERATE DESIGN (Main entry) ━━━
export async function generateDesign(
  request: AIDesignRequest
): Promise<{ success: boolean; result?: AIDesignResult; generationId?: string; error?: string }> {
  const { userId, invitationId, prompt, style } = request;

  // Check credits
  const [user] = await db
    .select({ credits: users.credits })
    .from(users)
    .where(eq(users.id, userId));
  if (!user || user.credits < CREDIT_COSTS.AI_DESIGN_GENERATE) {
    return {
      success: false,
      error: "Insufficient credits. Please purchase more credits to generate designs.",
    };
  }

  const startTime = Date.now();

  // Create generation record
  const [gen] = await db
    .insert(aiGenerations)
    .values({
      userId,
      invitationId: invitationId || null,
      prompt,
      style,
      creditsUsed: CREDIT_COSTS.AI_DESIGN_GENERATE,
      status: "processing",
      modelUsed: "fallback-algorithmic",
    })
    .returning();

  try {
    // Server-side: use algorithmic fallback
    // Client-side: Gemini Nano will be attempted first via the script above
    const enrichedPrompt = style ? `${prompt}. Style: ${STYLE_PROMPTS[style] || style}` : prompt;
    const result = generateDesignFallback(enrichedPrompt, style);

    // Debit credits
    const debited = await debitCredits(
      userId,
      CREDIT_COSTS.AI_DESIGN_GENERATE,
      "AI design generation",
      gen.id
    );
    if (!debited) {
      await db.update(aiGenerations).set({ status: "failed" }).where(eq(aiGenerations.id, gen.id));
      return { success: false, error: "Failed to debit credits" };
    }

    // Update generation record
    const processingTime = Date.now() - startTime;
    await db
      .update(aiGenerations)
      .set({
        result,
        status: "completed",
        processingTimeMs: processingTime,
      })
      .where(eq(aiGenerations.id, gen.id));

    return { success: true, result, generationId: gen.id };
  } catch (err) {
    await db.update(aiGenerations).set({ status: "failed" }).where(eq(aiGenerations.id, gen.id));
    return { success: false, error: "Generation failed" };
  }
}

// ━━━ GET USER GENERATIONS ━━━
export async function getUserGenerations(userId: string, limit = 20) {
  return db
    .select()
    .from(aiGenerations)
    .where(eq(aiGenerations.userId, userId))
    .orderBy(desc(aiGenerations.createdAt))
    .limit(limit);
}
