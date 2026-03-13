import { useState } from "react";
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

export function AIDesignGenerator({ user, onApply }: {
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
  useState(() => {
    if (typeof window !== "undefined" && "ai" in window) {
      (window as any).ai?.languageModel?.capabilities?.().then((caps: any) => {
        setNanoAvailable(caps?.available === "readily" || caps?.available === "after-download");
      }).catch(() => setNanoAvailable(false));
    } else {
      setNanoAvailable(false);
    }
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Try Gemini Nano first (client-side, 0 credits)
    if (nanoAvailable && typeof window !== "undefined") {
      try {
        setNanoLoading(true);
        const session = await (window as any).ai.languageModel.create({
          systemPrompt: `You are a wedding invitation design expert. Generate ONLY valid JSON (no markdown, no backticks): {"gradient":"CSS linear-gradient","colors":{"primary":"#hex","secondary":"#hex","bg":"#hex","accent":"#hex","text":"#hex","card":"#hex"},"suggestions":["s1","s2","s3"]}`
        });
        const raw = await session.prompt(`Design a ${style} wedding invitation: ${prompt}`);
        session.destroy();
        const parsed = JSON.parse(raw);
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
          <p className="text-xs opacity-40 mt-0.5">
            {nanoAvailable ? "✨ Gemini Nano available — free generations!" : "Server-powered — 1 credit per generation"}
          </p>
        </div>
        <div className="credit-badge">
          ✦ {credits} credits
        </div>
      </div>

      {/* Style selector */}
      <div>
        <label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-3">Design Style</label>
        <div className="grid grid-cols-3 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`p-3 rounded-xl text-center transition-all border ${
                style === s.id
                  ? "bg-gold-700 text-white border-gold-700 shadow-gold"
                  : "bg-cream-50/60 border-gold-200/15 hover:border-gold-400/40"
              }`}
            >
              <span className="text-lg block mb-1">{s.emoji}</span>
              <span className="text-[10px] font-semibold block">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">
          Describe Your Dream Design
        </label>
        <textarea
          className="input-gold min-h-[100px] resize-y"
          placeholder="e.g. A warm golden sunset beach wedding with tropical flowers and elegant calligraphy..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || generate.isPending || nanoLoading || (!nanoAvailable && credits < 1)}
        className="btn-gold w-full !py-3.5 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {generate.isPending || nanoLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </span>
        ) : (
          <span>
            ✨ Generate Design
            {!nanoAvailable && <span className="opacity-60 ml-1">(1 credit)</span>}
            {nanoAvailable && <span className="opacity-60 ml-1">(free with Nano)</span>}
          </span>
        )}
      </button>

      {!nanoAvailable && credits < 1 && (
        <p className="text-xs text-center text-red-500/70">
          Not enough credits. <a href="/account" className="underline font-semibold">Buy more credits →</a>
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Generated Design</h4>
            <span className="text-[10px] px-2 py-1 rounded-full bg-cream-200/60 opacity-50">
              via {result.model === "gemini-nano" ? "Gemini Nano (free)" : "Server (1 credit)"}
            </span>
          </div>

          {/* Preview gradient */}
          <div className="h-40 rounded-2xl overflow-hidden relative" style={{ background: result.gradient }}>
            <div className="absolute inset-0 flex items-center justify-center text-white text-center">
              <div>
                <p className="font-script text-3xl drop-shadow">Preview</p>
                <p className="text-[10px] tracking-[3px] uppercase opacity-60 mt-1">Your design</p>
              </div>
            </div>
          </div>

          {/* Color palette */}
          {result.colors && (
            <div>
              <label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">Color Palette</label>
              <div className="flex gap-2">
                {Object.entries(result.colors).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <div className="w-10 h-10 rounded-lg shadow-sm border border-white/50" style={{ background: v as string }} />
                    <span className="text-[8px] opacity-25 mt-0.5 block capitalize">{k}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions && (
            <div>
              <label className="block text-[10px] font-semibold tracking-[2px] uppercase text-cream-800/40 mb-2">AI Suggestions</label>
              <div className="space-y-1.5">
                {result.suggestions.map((s: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs opacity-55">
                    <span className="text-gold-500 mt-0.5">✦</span>
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
        <p className="text-xs text-center text-red-500/70">Generation failed. Please try again.</p>
      )}
    </div>
  );
}
