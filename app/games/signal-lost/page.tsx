import type { Metadata, Viewport } from "next";
import SignalGame from "./game";

export const metadata: Metadata = {
  title: "Signal Lost — A Fairbyte Radio Mystery",
  description: "Tune through the static, lock five impossible transmissions, and decode what the abandoned station is trying to tell you.",
  openGraph: { title: "Signal Lost", description: "There should be nothing broadcasting from Relay Station K.", type: "website", url: "/games/signal-lost/", siteName: "Fairbyte Arcade", images: [{ url: "/arcade/signal-lost-cover.jpg", width: 1672, height: 941, alt: "Signal Lost radio mystery game" }] },
  twitter: { card: "summary_large_image", title: "Signal Lost", description: "Tune the impossible transmission.", images: ["/arcade/signal-lost-cover.jpg"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#090b08", colorScheme: "dark" };
export default function SignalLostPage() { return <SignalGame />; }
