"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import styles from "./classic.module.css";

type Props = {
  number: string;
  title: string;
  subtitle: string;
  accent: string;
  score: number | string;
  best: number | string;
  status: string;
  sound: boolean;
  onSound: () => void;
  onRestart: () => void;
  objective: string;
  instructions: string[];
  children: ReactNode;
  controls: ReactNode;
};

export default function ClassicFrame(props: Props) {
  return <main className={styles.shell} style={{"--accent":props.accent} as CSSProperties}>
    <header className={styles.header}>
      <Link href="/arcade/" className={styles.brand}><i/><span>FAIRBYTE<br/><b>CLASSICS</b></span></Link>
      <div className={styles.title}><span>GAME {props.number}</span><h1>{props.title}</h1></div>
      <div className={styles.headerActions}><button onClick={props.onSound} aria-label={props.sound?"Mute game sounds":"Turn on game sounds"}>{props.sound?"SOUND ON":"SOUND OFF"}</button><Link href="/arcade/#classics">EXIT</Link></div>
    </header>
    <section className={styles.marquee}><span>FAIRBYTE RE-CODED</span><p>{props.subtitle}</p><i>FAMILIAR RULES · ORIGINAL WORLD</i></section>
    <section className={styles.gameArea}>
      <aside className={styles.scorecard}><span>SCORE</span><b>{props.score}</b><span>BEST</span><strong>{props.best}</strong><div/><small>{props.status}</small></aside>
      <div className={styles.stage}>{props.children}</div>
      <aside className={styles.guide}><span>OBJECTIVE</span><p>{props.objective}</p><ol>{props.instructions.map((item,index)=><li key={item}><b>{String(index+1).padStart(2,"0")}</b>{item}</li>)}</ol><button onClick={props.onRestart}>RESTART GAME</button></aside>
    </section>
    <section className={styles.touch} aria-label="Game controls">{props.controls}</section>
    <footer className={styles.footer}><span>PLAY INSTANTLY · NO ACCOUNT</span><Link href="/arcade/#classics">MORE CLASSICS →</Link><i>© FAIRBYTE</i></footer>
  </main>;
}
