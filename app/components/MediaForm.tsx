"use client";

import { useState, useRef } from "react";

interface MediaFormProps {
  photos: string[];
  musicUrl: string;
  onSave: (updates: { photos?: string[]; musicUrl?: string }) => void;
  maxPhotos?: number;
}

export function MediaForm({ photos, musicUrl, onSave, maxPhotos = 8 }: MediaFormProps) {
  const [uploading, setUploading] = useState<"photo" | "music" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, type: "photo" | "music") {
    setError(null);
    setUploading(type);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      return json.url as string;
    } finally {
      setUploading(null);
    }
  }

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      setError(`Maximum ${maxPhotos} photos allowed.`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    try {
      const urls = await Promise.all(toUpload.map((f) => uploadFile(f, "photo")));
      onSave({ photos: [...photos, ...urls] });
    } catch (err: any) {
      setError(err.message);
    }
    e.target.value = "";
  }

  async function handleMusic(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file, "music");
      onSave({ musicUrl: url });
    } catch (err: any) {
      setError(err.message);
    }
    e.target.value = "";
  }

  function removePhoto(idx: number) {
    onSave({ photos: photos.filter((_, i) => i !== idx) });
  }

  function removeMusic() {
    onSave({ musicUrl: "" });
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Photo Gallery */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
            Photo Gallery
          </label>
          <span className="text-[10px] text-cream-800/30">
            {photos.length}/{maxPhotos}
          </span>
        </div>

        {photos.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {photos.map((url, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < maxPhotos && (
          <>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotos}
            />
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading === "photo"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold-200/40 bg-cream-50/40 py-4 text-[11px] font-semibold text-cream-800/40 transition-colors hover:border-gold-400/50 hover:text-gold-600 disabled:cursor-wait"
            >
              {uploading === "photo" ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
                  Uploading…
                </>
              ) : (
                <>📸 Add Photos (max 5 MB each)</>
              )}
            </button>
          </>
        )}
        <p className="mt-1.5 text-[9px] text-cream-800/25">
          JPEG, PNG or WebP. Up to {maxPhotos} photos, 5 MB each.
        </p>
      </section>

      {/* Background Music */}
      <section>
        <label className="mb-3 block text-[10px] font-semibold uppercase tracking-[2px] text-cream-800/40">
          Background Music
        </label>

        {musicUrl ? (
          <div className="rounded-xl border border-gold-200/20 bg-cream-50/60 p-4">
            <audio src={musicUrl} controls className="mb-2 w-full" />
            <button
              onClick={removeMusic}
              className="text-[10px] text-red-400/70 underline hover:text-red-500"
            >
              Remove music
            </button>
          </div>
        ) : (
          <>
            <input
              ref={musicInputRef}
              type="file"
              accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg"
              className="hidden"
              onChange={handleMusic}
            />
            <button
              onClick={() => musicInputRef.current?.click()}
              disabled={uploading === "music"}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gold-200/40 bg-cream-50/40 py-4 text-[11px] font-semibold text-cream-800/40 transition-colors hover:border-gold-400/50 hover:text-gold-600 disabled:cursor-wait"
            >
              {uploading === "music" ? (
                <>
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-300 border-t-gold-700" />
                  Uploading…
                </>
              ) : (
                <>🎵 Upload MP3 / WAV (max 20 MB)</>
              )}
            </button>
          </>
        )}
        <p className="mt-1.5 text-[9px] text-cream-800/25">
          Plays automatically when guests open your invitation.
        </p>
      </section>
    </div>
  );
}
