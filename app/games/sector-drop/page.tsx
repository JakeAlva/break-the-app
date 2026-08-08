import type { Metadata } from "next";
import SectorDrop from "./game";

export const metadata: Metadata = {title:"Sector Drop — Fairbyte Classics",description:"Rotate falling cargo formations, clear the launch grid, and survive the gravity surge."};
export default function Page(){return <SectorDrop/>}
