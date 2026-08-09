import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://play.fairbyte.us"),
  title: "Fairbyte Arcade — Original Games, Instantly Playable",
  description:
    "A growing catalog of original browser games and re-coded arcade classics. No downloads and no accounts.",
  openGraph: {
    title: "Fairbyte Arcade",
    description: "Eighteen browser games. No downloads. Pick a world and play.",
    type: "website",
    url: "/",
    siteName: "Fairbyte Arcade",
    images: [{ url: "/arcade/fairbyte-arcade-18.png", width: 1200, height: 630, alt: "Fairbyte Arcade — 18 games, play instantly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fairbyte Arcade",
    description: "Original games and re-coded classics, instantly playable.",
    images: ["/arcade/fairbyte-arcade-18.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#070b0e",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
