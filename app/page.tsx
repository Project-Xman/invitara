import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Invitara — Golden Wedding Invitations",
  description:
    "Beautiful, AI-powered wedding invitation websites. Pick a style, add your story, share in minutes.",
};

export default function HomePage() {
  return <HomeClient />;
}
