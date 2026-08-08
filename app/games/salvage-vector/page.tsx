import type {Metadata} from "next";
import SalvageVector from "./game";
export const metadata:Metadata={title:"Salvage Vector — Fairbyte Arcade",description:"Survive five zero-gravity sectors, recover salvage, and rebuild your ship between waves."};
export default function Page(){return <SalvageVector/>}
