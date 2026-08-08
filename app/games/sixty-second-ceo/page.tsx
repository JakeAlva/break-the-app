import type { Metadata, Viewport } from "next";
import CeoGame from "./game";

export const metadata: Metadata = {
  title: "Sixty-Second CEO — A Fairbyte Business Game",
  description: "Run a company for one frantic minute. Make ten decisions and discover what your leadership is worth.",
  openGraph: { title: "Sixty-Second CEO", description: "Ten decisions. Sixty seconds. One extremely nervous board.", type: "website", url: "/games/sixty-second-ceo/", siteName: "Fairbyte Arcade", images: [{ url: "/arcade/sixty-second-ceo-cover.jpg", width: 1672, height: 941, alt: "Sixty-Second CEO strategy game" }] },
  twitter: { card: "summary_large_image", title: "Sixty-Second CEO", description: "Can you run a company for sixty seconds?", images: ["/arcade/sixty-second-ceo-cover.jpg"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f5e7bd", colorScheme: "light" };
export default function SixtySecondCeoPage() { return <CeoGame />; }
