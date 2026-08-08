"use client";

import Link from "next/link";
import type {CSSProperties,ReactNode} from "react";
import styles from "./deep.module.css";

type Stat={label:string;value:string|number};
type Props={number:string;title:string;collection:string;tagline:string;accent:string;accent2?:string;status:string;stats:Stat[];sound:boolean;onSound:()=>void;onRestart:()=>void;objective:string;instructions:string[];children:ReactNode;controls?:ReactNode;side?:ReactNode};

export default function DeepFrame(props:Props){return <main className={styles.shell} style={{"--accent":props.accent,"--accent2":props.accent2||props.accent} as CSSProperties}>
  <header className={styles.header}><Link href="/arcade/" className={styles.brand}><i/><span><b>FAIRBYTE</b><small>ARCADE</small></span></Link><div className={styles.identity}><span>GAME {props.number} · {props.collection}</span><h1>{props.title}</h1></div><div className={styles.actions}><button onClick={props.onSound} aria-label={props.sound?"Mute game sounds":"Turn on game sounds"}>{props.sound?"SOUND ON":"SOUND OFF"}</button><Link href="/arcade/">CATALOG</Link></div></header>
  <section className={styles.signal}><span>{props.collection}</span><p>{props.tagline}</p><i>{props.status}</i></section>
  <section className={styles.layout}><aside className={styles.stats}>{props.stats.map(stat=><div key={stat.label}><span>{stat.label}</span><b>{stat.value}</b></div>)}<small>{props.status}</small></aside><section className={styles.stage}>{props.children}</section><aside className={styles.guide}><span>FIELD GUIDE</span><h2>{props.objective}</h2><ol>{props.instructions.map((line,index)=><li key={line}><b>{index+1}</b><span>{line}</span></li>)}</ol>{props.side}<button onClick={props.onRestart}>RESTART RUN</button></aside></section>
  {props.controls&&<section className={styles.controls} aria-label="Game controls">{props.controls}</section>}
  <footer className={styles.footer}><span>NO DOWNLOAD · PROGRESS SAVES HERE</span><Link href="/arcade/">ALL GAMES →</Link><i>FAIRBYTE GAME {props.number}</i></footer>
 </main>}
