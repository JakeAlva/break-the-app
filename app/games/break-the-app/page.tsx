import type { Metadata, Viewport } from "next";
import BreakTheAppGame from "./game";

export const metadata: Metadata = {
  title: "Break the App — Find the Loophole",
  description: "Four tiny apps. Four hidden loopholes. Break the rules without breaking the interface.",
  openGraph: { title: "Break the App", description: "Find the loophole. The interface is the puzzle.", type: "website", url: "/games/break-the-app/", siteName: "Fairbyte Arcade", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Break the App" }] },
  twitter: { card: "summary_large_image", title: "Break the App", description: "Find the loophole. The interface is the puzzle.", images: ["/og.png"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#070b0e", colorScheme: "dark" };
export default function BreakTheAppPage() { return <BreakTheAppGame />; }
