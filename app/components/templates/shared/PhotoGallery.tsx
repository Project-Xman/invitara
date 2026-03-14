"use client";

interface PhotoGalleryProps {
  photos: string[];
  accentColor?: string;
}

export function PhotoGallery({ photos, accentColor = "#D4A853" }: PhotoGalleryProps) {
  if (!photos.length) return null;

  return (
    <div className="px-6 py-10">
      <p
        className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[4px]"
        style={{ color: accentColor }}
      >
        Memories
      </p>
      <div
        className={`grid gap-2 ${
          photos.length === 1
            ? "grid-cols-1"
            : photos.length === 2
              ? "grid-cols-2"
              : photos.length <= 4
                ? "grid-cols-2"
                : "grid-cols-3"
        }`}
      >
        {photos.map((url, i) => (
          <div
            key={i}
            className={`overflow-hidden rounded-xl ${
              photos.length === 1 ? "aspect-video" : "aspect-square"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
