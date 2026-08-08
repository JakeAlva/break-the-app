import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://play.fairbyte.us"),
  title: "Break the App — Find the loophole",
  description:
    "Four tiny apps. Four hidden loopholes. Break the rules without breaking the interface.",
  openGraph: {
    title: "Break the App",
    description: "Find the loophole. The interface is the puzzle.",
    type: "website",
    url: "/",
    siteName: "Fairbyte Labs",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Break the App by Fairbyte Labs" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Break the App",
    description: "Find the loophole. The interface is the puzzle.",
    images: ["/og.png"],
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
