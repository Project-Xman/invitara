import { useState, useEffect } from "react";
import Link from "next/link";
import { useGenerateAIDesign } from "~/lib/queries";
import type { SafeUser } from "~/lib/auth";

const STYLES = [
  { id: "traditional", label: "Traditional", emoji: "🪔", desc: "Classic Indian wedding motifs" },
  { id: "modern", label: "Modern", emoji: "🏙️", desc: "Contemporary minimalist" },
  { id: "minimalist", label: "Minimalist", emoji: "✦", desc: "Clean & elegant" },
  { id: "ornate", label: "Ornate", emoji: "👑", desc: "Heavily decorated gold" },
  { id: "rustic", label: "Rustic", emoji: "🏔️", desc: "Earthy warm tones" },
  { id: "royal", label: "Royal", emoji: "🏰", desc: "Regal opulence" },
];

export function AIDesignGenerator({
  user,
  onApply,
}: {
  user: SafeUser | null;
  onApply?: (result: { gradient: string; colors: Record<string, string> }) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("traditional");
  const [result, setResult] = useState<any>(null);
  const [nanoAvailable, setNanoAvailable] = useState<boolean | null>(null);
  const [nanoLoading, setNanoLoading] = useState(false);
  const generate = useGenerateAIDesign();

  // Check Nano availability on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "ai" in window) {
      (window as any).ai?.languageModel
        ?.capabilities?.()
        .then((caps: any) => {
          setNanoAvailable(caps?.available === "readily" || caps?.available === "after-download");
        })
        .catch(() => setNanoAvailable(false));
    } else {
      setNanoAvailable(false);
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Try Gemini Nano first (client-side, 0 credits)
    if (nanoAvailable && typeof window !== "undefined") {
      try {
        setNanoLoading(true);
        const session = await (window as any).ai.languageModel.create({
          systemPrompt: `You are a wedding invitation design expert. Generate ONLY valid JSON (no markdown, no backticks): {"gradient":"CSS linear-gradient","colors":{"primary":"#hex","secondary":"#hex","bg":"#hex","accent":"#hex","text":"#hex","card":"#hex"},"suggestions":["s1","s2","s3"]}`,
        });
        const raw = await session.prompt(`Design a ${style} wedding invitation: ${prompt}`);
        session.destroy();
        // Strip any accidental markdown fences before parsing
        const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        if (!parsed?.gradient || !parsed?.colors?.primary) {
          throw new Error("Nano returned incomplete design object");
        }
        setResult({ ...parsed, model: "gemini-nano", creditsCost: 0 });
        setNanoLoading(false);
        return;
      } catch {
        setNanoLoading(false);
        // Fall through to server
      }
    }

    // Server-side fallback (costs 1 credit)
    generate.mutate(
      { prompt, style },
      {
        onSuccess: (res) => {
          if (res.success && res.result) {
            setResult({ ...res.result, model: "server-fallback", creditsCost: 1 });
          }
        },
      }
    );
  };

  const credits = user?.credits ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold">AI Design Generator</h3>
          <p className="mt-0.5 text-xs opacity-40">
            {nanoAvailable
              ? "✨ Gemini Nano available — free generations!"
              : "Server-powered — 1 credit per generation"}
          </p>
        </div>
        <div className="credit-badge">✦ {credits} credits</div>
      </div>

      {/* Style selector */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
          Design Style
        </p>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`rounded-xl border p-3 text-center transition-all ${
                style === s.id
                  ? "border-gold-700 bg-gold-700 text-white shadow-gold"
                  : "border-gold-200/15 bg-cream-50/60 hover:border-gold-400/40"
              }`}
            >
              <span className="mb-1 block text-lg">{s.emoji}</span>
              <span className="block text-[10px] font-semibold">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label htmlFor="ai-prompt" className="mb-2 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
          Describe Your Dream Design
        </label>
        <textarea
          id="ai-prompt"
          className="input-gold min-h-[100px] resize-y"
          placeholder="e.g. A warm golden sunset beach wedding with tropical flowers and elegant calligraphy..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={
          !prompt.trim() || generate.isPending || nanoLoading || (!nanoAvailable && credits < 1)
        }
        className="btn-gold w-full !py-3.5 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {generate.isPending || nanoLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Generating...
          </span>
        ) : (
          <span>
            ✨ Generate Design
            {!nanoAvailable && <span className="ml-1 opacity-60">(1 credit)</span>}
            {nanoAvailable && <span className="ml-1 opacity-60">(free with Nano)</span>}
          </span>
        )}
      </button>

      {!nanoAvailable && credits < 1 && (
        <p className="text-center text-xs text-red-500/70">
          Not enough credits.{" "}
          <Link href="/account" className="font-semibold underline">
            Buy more credits →
          </Link>
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="animate-fade-up space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Generated Design</h4>
            <span className="rounded-full bg-cream-200/60 px-2 py-1 text-[10px] opacity-50">
              via {result.model === "gemini-nano" ? "Gemini Nano (free)" : "Server (1 credit)"}
            </span>
          </div>

          {/* Preview gradient */}
          <div
            className="relative h-40 overflow-hidden rounded-2xl"
            style={{ background: result.gradient }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-center text-white">
              <div>
                <p className="font-script text-3xl drop-shadow">Preview</p>
                <p className="mt-1 text-[10px] uppercase tracking-[3px] opacity-60">Your design</p>
              </div>
            </div>
          </div>

          {/* Color palette */}
          {result.colors && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
                Color Palette
              </p>
              <div className="flex gap-2">
                {Object.entries(result.colors).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <div
                      className="h-10 w-10 rounded-lg border border-white/50 shadow-sm"
                      style={{ background: v as string }}
                    />
                    <span className="mt-0.5 block text-[8px] capitalize opacity-25">{k}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
                AI Suggestions
              </p>
              <div className="space-y-1.5">
                {result.suggestions.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs opacity-55">
                    <span className="mt-0.5 text-gold-500">✦</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Apply button */}
          {onApply && result.colors && (
            <button
              onClick={() => onApply({ gradient: result.gradient, colors: result.colors })}
              className="btn-gold-outline w-full !py-3"
            >
              Apply This Design
            </button>
          )}
        </div>
      )}

      {generate.isError && (
        <p className="text-center text-xs text-red-500/70">Generation failed. Please try again.</p>
      )}
    </div>
  );
}
