import type { Metadata, Viewport } from "next";
import RoomGame from "./game";

export const metadata: Metadata = {
  title: "Room 404 — A Fairbyte Desktop Escape Game",
  description: "Explore an abandoned computer desktop, reconstruct its hidden passcode, and find the door that should not exist.",
  openGraph: { title: "Room 404", description: "The room has no exit. The computer thinks otherwise.", type: "website", url: "/games/room-404/", siteName: "Fairbyte Arcade", images: [{ url: "/arcade/room-404-cover.jpg", width: 1672, height: 941, alt: "Room 404 desktop escape game" }] },
  twitter: { card: "summary_large_image", title: "Room 404", description: "Escape the fake desktop.", images: ["/arcade/room-404-cover.jpg"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#a993e8", colorScheme: "light" };
export default function Room404Page() { return <RoomGame />; }
