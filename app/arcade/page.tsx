import type { Metadata, Viewport } from "next";
import ArcadeCatalog from "./catalog";

export const metadata: Metadata = {
  title: "Fairbyte Arcade — Original Games, Instantly Playable",
  description: "A growing catalog of original Fairbyte browser games. No downloads, no accounts—choose a world and play instantly.",
  openGraph: { title: "Fairbyte Arcade", description: "Six original browser games. No downloads. Pick a world and play.", type: "website", url: "/", siteName: "Fairbyte Arcade", images: [{ url: "/arcade/room-404-cover.jpg", width: 1672, height: 941, alt: "Fairbyte Arcade game catalog" }] },
  twitter: { card: "summary_large_image", title: "Fairbyte Arcade", description: "Original browser games, instantly playable.", images: ["/arcade/room-404-cover.jpg"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07080b", colorScheme: "dark" };
export default function ArcadePage() { return <ArcadeCatalog />; }
