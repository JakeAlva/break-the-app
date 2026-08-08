import type { Metadata, Viewport } from "next";
import DispatchGame from "./game";

export const metadata: Metadata = {
  title: "2:17 AM — Emergency Dispatch Strategy",
  description:
    "A tense, turn-based emergency dispatch game. Four response units, one dark city, and eight minutes of decisions.",
  openGraph: {
    title: "2:17 AM",
    description: "Four units. A city full of calls. Who gets there in time?",
    type: "website",
    url: "/games/2-17-am/",
    siteName: "Fairbyte Arcade",
    images: [
      {
        url: "/arcade/2-17-am-cover.jpg",
        width: 1672,
        height: 941,
        alt: "2:17 AM emergency dispatch game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "2:17 AM",
    description: "Four units. A city full of calls. Who gets there in time?",
    images: ["/arcade/2-17-am-cover.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080c11",
  colorScheme: "dark",
};

export default function TwoSeventeenPage() {
  return <DispatchGame />;
}
