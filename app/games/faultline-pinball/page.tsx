import type {Metadata} from "next";
import FaultlinePinball from "./game";

export const metadata:Metadata={title:"Faultline Pinball — Fairbyte Arcade",description:"A kinetic neon pinball table with missions, multipliers, and quake-powered multiball."};
export default function Page(){return <FaultlinePinball/>}
