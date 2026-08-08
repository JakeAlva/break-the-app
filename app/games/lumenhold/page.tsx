import type {Metadata} from "next";
import Lumenhold from "./game";

export const metadata:Metadata={
  title:"Lumenhold — Fairbyte Arcade",
  description:"Build, upgrade, and command a living light-defense network across twelve enemy waves."
};

export default function Page(){return <Lumenhold/>}
