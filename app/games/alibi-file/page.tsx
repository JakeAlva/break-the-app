import type { Metadata, Viewport } from "next";
import AlibiGame from "./game";

export const metadata: Metadata = {
  title: "Alibi File — A Fairbyte Deduction Game",
  description: "Compare testimony, receipts, messages, and timestamps. Find the one contradiction that breaks each alibi.",
  openGraph: {
    title: "Alibi File",
    description: "Every story works until two details occupy the same minute.",
    type: "website",
    url: "/games/alibi-file/",
    siteName: "Fairbyte Arcade",
    images: [{ url: "/arcade/alibi-file-cover.jpg", width: 1672, height: 941, alt: "Alibi File detective game" }],
  },
  twitter: { card: "summary_large_image", title: "Alibi File", description: "Find the contradiction. Break the alibi.", images: ["/arcade/alibi-file-cover.jpg"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#efe2c5", colorScheme: "light" };

export default function AlibiFilePage() {
  return <AlibiGame />;
}
