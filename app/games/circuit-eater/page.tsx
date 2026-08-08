import type {Metadata} from "next";
import CircuitEater from "./game";
export const metadata:Metadata={title:"Circuit Eater — Fairbyte Classics",description:"Consume every charge node in an original security maze before the drones close in."};
export default function Page(){return <CircuitEater/>}
