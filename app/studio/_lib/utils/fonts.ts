'use client';

export interface StudioFontOption {
  id: string;
  label: string;
  family: string;
  category: 'built-in' | 'google';
  googleFamily?: string;
}

export const STUDIO_FONT_OPTIONS: StudioFontOption[] = [
  { id: 'inter', label: 'Inter', family: 'Inter, sans-serif', category: 'built-in' },
  { id: 'playfair', label: 'Playfair Display', family: 'Playfair Display, serif', category: 'built-in' },
  { id: 'cormorant', label: 'Cormorant Garamond', family: 'Cormorant Garamond, serif', category: 'built-in' },
  { id: 'cinzel', label: 'Cinzel', family: 'Cinzel, serif', category: 'built-in' },
  { id: 'great-vibes', label: 'Great Vibes', family: 'Great Vibes, cursive', category: 'built-in' },
  { id: 'dancing-script', label: 'Dancing Script', family: 'Dancing Script, cursive', category: 'built-in' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins, sans-serif', category: 'google', googleFamily: 'Poppins:wght@300;400;500;600;700' },
  { id: 'manrope', label: 'Manrope', family: 'Manrope, sans-serif', category: 'google', googleFamily: 'Manrope:wght@300;400;500;600;700;800' },
  { id: 'space-grotesk', label: 'Space Grotesk', family: 'Space Grotesk, sans-serif', category: 'google', googleFamily: 'Space+Grotesk:wght@300;400;500;700' },
  { id: 'outfit', label: 'Outfit', family: 'Outfit, sans-serif', category: 'google', googleFamily: 'Outfit:wght@300;400;500;600;700;800' },
  { id: 'dm-serif', label: 'DM Serif Display', family: 'DM Serif Display, serif', category: 'google', googleFamily: 'DM+Serif+Display:ital@0;1' },
  { id: 'ibm-plex-mono', label: 'IBM Plex Mono', family: 'IBM Plex Mono, monospace', category: 'google', googleFamily: 'IBM+Plex+Mono:wght@300;400;500;600' },
  { id: 'lora', label: 'Lora', family: 'Lora, serif', category: 'google', googleFamily: 'Lora:wght@400;500;600;700' },
  { id: 'sora', label: 'Sora', family: 'Sora, sans-serif', category: 'google', googleFamily: 'Sora:wght@300;400;500;600;700;800' },
];

const loadedGoogleFonts = new Set<string>();

export function ensureStudioFontLoaded(fontFamily: string) {
  const option = STUDIO_FONT_OPTIONS.find((font) => font.family === fontFamily);
  if (!option || option.category !== 'google' || !option.googleFamily) return;
  if (loadedGoogleFonts.has(option.id)) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${option.googleFamily}&display=swap`;
  link.dataset.studioFont = option.id;
  document.head.appendChild(link);
  loadedGoogleFonts.add(option.id);
}
