import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Invitara — Wedding Invitations",
    short_name: "Invitara",
    description: "Beautiful, AI-powered digital wedding invitations.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf6e8",
    theme_color: "#D4A853",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    categories: ["lifestyle", "social", "events"],
  };
}
