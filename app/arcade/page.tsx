import type { Metadata, Viewport } from "next";
import ArcadeCatalog from "./catalog";

export const metadata: Metadata = {
  title: "Fairbyte Arcade — Original Games, Instantly Playable",
  description: "A growing catalog of original Fairbyte browser games. No downloads, no accounts—choose a world and play instantly.",
  openGraph: { title: "Fairbyte Arcade", description: "Eighteen browser games—from daily logic and roguelites to local multiplayer and re-coded classics. No downloads.", type: "website", url: "/", siteName: "Fairbyte Arcade", images: [{ url: "/arcade/fairbyte-arcade-18.png", width: 1200, height: 630, alt: "Fairbyte Arcade — 18 games, play instantly" }] },
  twitter: { card: "summary_large_image", title: "Fairbyte Arcade", description: "Eighteen original browser games, instantly playable.", images: ["/arcade/fairbyte-arcade-18.png"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#07080b", colorScheme: "dark" };
export default function ArcadePage() { return <ArcadeCatalog />; }
