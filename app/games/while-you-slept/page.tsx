import type {Metadata} from "next";
import WhileYouSlept from "./game";

export const metadata:Metadata={title:"While You Slept — Fairbyte Arcade",description:"A persistent pocket kingdom that keeps growing between visits."};
export default function Page(){return <WhileYouSlept/>}
