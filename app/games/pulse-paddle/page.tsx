import type {Metadata} from "next";
import PulsePaddle from "./game";
export const metadata:Metadata={title:"Pulse Paddle — Fairbyte Classics",description:"Deflect a volatile energy pulse and outscore the station defense system."};
export default function Page(){return <PulsePaddle/>}
