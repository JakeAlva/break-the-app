import type {Metadata} from "next";
import TwofoldArena from "./game";

export const metadata:Metadata={title:"Twofold Arena — Fairbyte Arcade",description:"A neon objective arena for solo play or two players on one keyboard."};
export default function Page(){return <TwofoldArena/>}
