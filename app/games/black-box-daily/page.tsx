import type {Metadata} from "next";
import BlackBoxDaily from "./game";
export const metadata:Metadata={title:"Black Box Daily — Fairbyte Arcade",description:"Probe a mysterious machine, infer its hidden rule, and protect your daily streak."};
export default function Page(){return <BlackBoxDaily/>}
