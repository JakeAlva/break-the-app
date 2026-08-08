import type {Metadata} from "next";
import Coilfield from "./game";
export const metadata:Metadata={title:"Coilfield — Fairbyte Classics",description:"Grow a neon signal coil through a wrapping field of charge cells and dead pixels."};
export default function Page(){return <Coilfield/>}
