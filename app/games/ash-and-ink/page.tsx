import type {Metadata} from "next";
import AshAndInk from "./game";

export const metadata:Metadata={title:"Ash & Ink — Fairbyte Arcade",description:"A compact three-act deckbuilding roguelite where every card leaves a mark."};
export default function Page(){return <AshAndInk/>}
