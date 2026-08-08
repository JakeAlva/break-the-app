"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGameAudio } from "../../useGameAudio";
import styles from "./game.module.css";
import fineStyles from "./fine.module.css";

type Transmission = { band: string; target: number; origin: string; pattern: string; transcript: string; prompt: string; answers: string[]; correct: number };
const TRANSMISSIONS: Transmission[] = [
  { band: "K-01", target: 187, origin: "LOW RIDGE ARRAY", pattern: "•• — ••", transcript: "THE LIGHTS ARE NOT STARS. COUNT THE DARK SPACES.", prompt: "The sequence contains two pairs separated by one long tone. What follows?", answers: ["One short tone", "Two short tones", "One long tone"], correct: 1 },
  { band: "K-02", target: 342, origin: "FOREST REPEATER", pattern: "— • — —", transcript: "FOUR TOWERS. ONLY THREE CAST SHADOWS.", prompt: "Which tower should the station ignore?", answers: ["The brightest", "The fourth", "The nearest"], correct: 1 },
  { band: "K-03", target: 518, origin: "WEATHER CHANNEL 0", pattern: "• •• •••", transcript: "ONE BECOMES TWO. TWO BECOMES THREE.", prompt: "Complete the transmission’s count.", answers: ["Four short tones", "Three long tones", "Silence"], correct: 0 },
  { band: "K-04", target: 704, origin: "UNMAPPED VALLEY", pattern: "— — • —", transcript: "THE MESSAGE ARRIVES BEFORE WE SEND IT.", prompt: "The timestamp is eleven minutes ahead. What is this?", answers: ["A recording", "An echo", "A warning"], correct: 2 },
  { band: "K-05", target: 881, origin: "RELAY STATION K", pattern: "••• ——— •••", transcript: "DO NOT ANSWER. IT LEARNS THE VOICE THAT ANSWERS.", prompt: "The transmitter requests an open microphone. What do you do?", answers: ["Transmit your name", "Cut the carrier", "Repeat the pattern"], correct: 1 },
];

export default function SignalGame() {
  const audio = useGameAudio();
  const contextRef = useRef<AudioContext | null>(null);
  const [phase, setPhase] = useState<"intro" | "tuning" | "decode" | "complete">("intro");
  const [index, setIndex] = useState(0);
  const [dial, setDial] = useState(126);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [note, setNote] = useState("Sweep the band. The interference thins near a carrier.");
  const [best, setBest] = useState(0);
  const signal = TRANSMISSIONS[index];
  const distance = Math.abs(dial - signal.target);
  const clarity = Math.max(0, Math.round(100 - distance * 1.35));
  const bars = useMemo(() => Array.from({ length: 48 }, (_, i) => 14 + Math.abs(Math.sin((i + dial / 13) * .52)) * (clarity * .62) + ((i * 17) % 13)), [dial, clarity]);

  useEffect(() => { const restore=window.setTimeout(()=>{try { setBest(Number(localStorage.getItem("fairbyte:signal:best") || 0)); } catch { /* optional */ }},0); return () => { window.clearTimeout(restore); if (contextRef.current?.state !== "closed") void contextRef.current?.close(); }; }, []);
  const playCarrier = () => {
    if (!audio.enabled || typeof window.AudioContext === "undefined") return;
    if (!contextRef.current) contextRef.current = new window.AudioContext();
    const context = contextRef.current; if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    [0,.17,.34].forEach((delay,i)=>{ const osc=context.createOscillator(); const gain=context.createGain(); osc.type=i===1?"square":"sine"; const detune=(dial-signal.target)*1.7; osc.frequency.setValueAtTime(240 + index*44 + detune,now+delay); gain.gain.setValueAtTime(.0001,now+delay); gain.gain.exponentialRampToValueAtTime(.018 + clarity/6500,now+delay+.015); gain.gain.exponentialRampToValueAtTime(.0001,now+delay+.12); osc.connect(gain); gain.connect(context.destination); osc.start(now+delay); osc.stop(now+delay+.14); });
    audio.play(clarity > 88 ? "hint" : "tap");
  };
  const start = () => { audio.play("navigate"); setIndex(0); setDial(126); setScore(0); setAttempts(0); setNote("Sweep the band. The interference thins near a carrier."); setPhase("tuning"); };
  const lock = () => { setAttempts((v)=>v+1); if (clarity < 88) { audio.play("error"); setScore((v)=>Math.max(0,v-60)); setNote(clarity > 60 ? "A voice is almost forming. Fine-tune the carrier." : "Only static. Continue sweeping the band."); return; } audio.play("success"); setScore((v)=>v+Math.round(clarity*7)); setPhase("decode"); };
  const answer = (choice: number) => { setAttempts((v)=>v+1); if (choice !== signal.correct) { audio.play("error"); setScore((v)=>Math.max(0,v-120)); setNote("The signal rejects that interpretation. Listen to the wording again."); return; } audio.play("good"); setScore((v)=>v+500); if (index === TRANSMISSIONS.length-1) { window.setTimeout(()=>{ audio.play("complete"); setPhase("complete"); },120); return; } const next=index+1; setIndex(next); setDial(Math.max(100,TRANSMISSIONS[next].target-110)); setNote("New carrier detected. Sweep slowly."); setPhase("tuning"); };
  useEffect(()=>{ if(phase!=="complete")return; const save=window.setTimeout(()=>{setBest((old)=>{const next=Math.max(old,score);try{localStorage.setItem("fairbyte:signal:best",String(next));}catch{}return next;});},0);return()=>window.clearTimeout(save)},[phase,score]);

  if (phase === "intro") return <main className={styles.intro}><Image src="/arcade/signal-lost-cover.jpg" alt="An abandoned shortwave listening station at night" fill priority className={styles.art}/><div className={styles.shade}/><header><Link href="/arcade/">← FAIRBYTE ARCADE</Link><span>RELAY STATION K · OFFLINE SINCE 1983</span></header><section><span>AN AUDIO MYSTERY</span><h1>SIGNAL<br/><em>LOST</em></h1><p>The abandoned receiver activated at 01:06. Five carriers are hiding inside the static. Find them before something finds the return channel.</p><button onClick={start}>POWER THE RECEIVER <b>◉</b></button><small>Headphones recommended · Visual clues included</small></section></main>;
  if (phase === "complete") return <main className={styles.complete}><Image src="/arcade/signal-lost-cover.jpg" alt="Radio towers beyond the abandoned station" fill className={styles.completeArt}/><div className={styles.completeShade}/><section><span>CARRIER TERMINATED</span><h1>You did not answer.</h1><p>The final signal asked for your voice. You cut the carrier before it could learn who was listening.</p><div><b>{score}</b><small>SIGNAL SCORE</small><b>{attempts}</b><small>INPUTS</small><b>{Math.max(best,score)}</b><small>BEST</small></div><button onClick={start}>RETUNE THE NIGHT</button><Link href="/arcade/">RETURN TO ARCADE →</Link></section></main>;

  return <main className={styles.game}>
    <header className={styles.topbar}><Link href="/arcade/">F / ARCADE</Link><div><i/> RELAY STATION K</div><button onClick={audio.toggle}>{audio.enabled ? "AUDIO LIVE" : "AUDIO MUTED"}</button></header>
    <section className={styles.station}>
      <aside className={styles.log}><span>RECEIVER LOG</span><h2>UNKNOWN<br/>CARRIERS</h2>{TRANSMISSIONS.map((item,i)=><div key={item.band} className={i<index?styles.done:i===index?styles.current:""}><b>{item.band}</b><span>{i<index?"DECODED":i===index?"ACTIVE":"NO DATA"}</span></div>)}<p>“No broadcast license exists for these frequencies.”</p></aside>
      <section className={styles.console}>
        <div className={styles.scope}><div className={styles.scopeGrid}/><div className={styles.wave}>{bars.map((height,i)=><i key={i} style={{height:`${Math.min(92,height)}%`,opacity:.35+clarity/160}}/>)}</div><div className={styles.scanline}/><span>{phase === "decode" ? "CARRIER LOCKED" : `${clarity}% SIGNAL CLARITY`}</span></div>
        {phase === "tuning" ? <div className={styles.tuner}><div className={styles.frequency}><small>SHORTWAVE BAND</small><b>{dial.toFixed(1)}</b><span>kHz</span></div><input aria-label="Tuning frequency" type="range" min="100" max="950" step="1" value={dial} onChange={(e)=>setDial(Number(e.target.value))}/><div className={styles.scale}><span>100</span><span>300</span><span>500</span><span>700</span><span>950</span></div><div className={fineStyles.fineTune} aria-label="Fine tuning controls"><button onClick={()=>setDial(v=>Math.max(100,v-10))}>−10</button><button onClick={()=>setDial(v=>Math.max(100,v-1))}>−1</button><span>FINE TUNE</span><button onClick={()=>setDial(v=>Math.min(950,v+1))}>+1</button><button onClick={()=>setDial(v=>Math.min(950,v+10))}>+10</button></div><div className={styles.tuneActions}><button onClick={playCarrier}>▶ MONITOR SIGNAL</button><button onClick={lock}>LOCK CARRIER ↯</button></div><p>{note}</p></div> : <div className={styles.decode}><div className={styles.transmission}><span>{signal.band} · {signal.origin}</span><b>{signal.pattern}</b><blockquote>“{signal.transcript}”</blockquote></div><h2>{signal.prompt}</h2><div>{signal.answers.map((item,i)=><button key={item} onClick={()=>answer(i)}><span>{String.fromCharCode(65+i)}</span>{item}</button>)}</div>{note.includes("rejects")&&<p>{note}</p>}</div>}
      </section>
      <aside className={styles.visual}><div className={styles.stationArt}><Image src="/arcade/signal-lost-cover.jpg" alt="Shortwave equipment and mountain radio towers" fill sizes="300px"/></div><div><span>ORIGIN ESTIMATE</span><b>{signal.origin}</b></div><div><span>FREQUENCY</span><b>{phase === "decode"?`${signal.target}.0 kHz`:"UNRESOLVED"}</b></div><div><span>DECODE SCORE</span><b>{score.toString().padStart(4,"0")}</b></div></aside>
    </section>
  </main>;
}
