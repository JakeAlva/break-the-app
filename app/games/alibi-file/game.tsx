"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGameAudio } from "../../useGameAudio";
import styles from "./game.module.css";

type Evidence = { id: string; kind: string; time: string; title: string; detail: string };
type CaseFile = {
  number: string;
  title: string;
  place: string;
  briefing: string;
  suspect: string;
  statement: string;
  evidence: Evidence[];
  answer: [string, string];
  explanation: string;
  hint: string;
};

const CASES: CaseFile[] = [
  {
    number: "71-04",
    title: "The Marlowe Ledger",
    place: "Marlowe Hotel · Thursday",
    briefing: "A charity ledger disappeared from the manager’s office between 10:20 and 10:35 PM.",
    suspect: "Evelyn Voss",
    statement: "I left the hotel at 10:10. I drove directly across the river and did not return.",
    evidence: [
      { id: "ticket", kind: "PARKING TICKET", time: "10:12 PM", title: "Garage exit", detail: "The hotel garage records Voss’s sedan leaving through Gate B." },
      { id: "bridge", kind: "TOLL RECORD", time: "10:19 PM", title: "East bridge", detail: "Her plate crossed the river heading east. Normal travel time from the hotel is six minutes." },
      { id: "key", kind: "KEY LOG", time: "10:28 PM", title: "Manager’s office", detail: "Voss’s staff key opened the office. The key is physical and cannot be copied remotely." },
      { id: "coffee", kind: "RECEIPT", time: "10:41 PM", title: "Bell Street café", detail: "A cash purchase was made near Voss’s home. No customer name appears." },
    ],
    answer: ["bridge", "key"],
    explanation: "Her car crossed east at 10:19, but her physical key opened the west-side office nine minutes later. The drive back takes at least fourteen minutes.",
    hint: "Ignore evidence that cannot be tied directly to Voss. Compare travel time with physical access.",
  },
  {
    number: "18-92",
    title: "Platform Nine",
    place: "Greybridge Central · Monday",
    briefing: "A sealed prototype vanished from a train locker moments before the 6:40 PM northbound departure.",
    suspect: "Marcus Bell",
    statement: "I boarded at 6:31 and stayed in the dining car until the train departed.",
    evidence: [
      { id: "scan", kind: "TICKET SCAN", time: "6:31 PM", title: "Platform entry", detail: "Bell’s mobile ticket entered Platform Nine through the south gate." },
      { id: "meal", kind: "DINING ORDER", time: "6:34 PM", title: "Table 12", detail: "One coffee was ordered from Bell’s reserved seat using the onboard app." },
      { id: "camera", kind: "CAMERA CLOCK", time: "6:36 PM", title: "Locker corridor", detail: "A person in Bell’s coat entered the locker corridor. The camera clock was later found seven minutes slow." },
      { id: "message", kind: "VOICE MESSAGE", time: "6:38 PM", title: "Station payphone", detail: "Bell left a message from a fixed payphone outside the ticket gates, three minutes from the train." },
    ],
    answer: ["scan", "message"],
    explanation: "Bell entered the platform at 6:31, yet used a fixed payphone outside the gates at 6:38. He could not have stayed aboard as claimed.",
    hint: "One record proves entry. Another proves he later left the secure platform.",
  },
  {
    number: "44-11",
    title: "The Glasshouse Call",
    place: "North Botanical Wing · Saturday",
    briefing: "A rare seed archive was opened during a twelve-minute power failure. Only three staff knew the code.",
    suspect: "Dr. Noa Hale",
    statement: "I was on a continuous video call from my apartment. My colleague can confirm it.",
    evidence: [
      { id: "call", kind: "CALL LOG", time: "8:02–8:26 PM", title: "Video session", detail: "The call lasted twenty-four minutes and never disconnected." },
      { id: "frame", kind: "VIDEO FRAME", time: "8:17 PM", title: "Window reflection", detail: "A city bus appears in the window behind Hale, route display reflected backward." },
      { id: "route", kind: "TRANSIT NOTICE", time: "ALL EVENING", title: "Route 6 diversion", detail: "Route 6 did not pass Hale’s apartment. During roadwork it stopped beside the botanical wing." },
      { id: "meter", kind: "POWER METER", time: "8:10–8:22 PM", title: "Apartment usage", detail: "Hale’s apartment drew normal power throughout the district outage." },
    ],
    answer: ["frame", "route"],
    explanation: "The call was real, but the background was not Hale’s apartment. The reflected Route 6 bus placed Hale beside the botanical wing.",
    hint: "The duration of the call is not the issue. Ask where its background could have been filmed.",
  },
];

export default function AlibiGame() {
  const audio = useGameAudio();
  const [phase, setPhase] = useState<"intro" | "case" | "solved" | "complete">("intro");
  const [caseIndex, setCaseIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(3000);
  const [mistakes, setMistakes] = useState(0);
  const [notice, setNotice] = useState("Select two records that cannot both be true.");
  const [showHint, setShowHint] = useState(false);
  const [best, setBest] = useState(0);
  const file = CASES[caseIndex];

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try { setBest(Number(localStorage.getItem("fairbyte:alibi-file:best") || 0)); } catch { /* storage optional */ }
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  const start = () => {
    audio.play("navigate"); setPhase("case"); setCaseIndex(0); setSelected([]); setScore(3000); setMistakes(0); setNotice("Select two records that cannot both be true."); setShowHint(false);
  };

  const toggleEvidence = (id: string) => {
    audio.play("tap"); setNotice("Select two records that cannot both be true.");
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : [current[1], id]);
  };

  const testContradiction = () => {
    const correct = file.answer.every((id) => selected.includes(id));
    if (correct) { audio.play("success"); setScore((value) => value + 400); setPhase("solved"); return; }
    audio.play("error"); setScore((value) => Math.max(0, value - 175)); setMistakes((value) => value + 1); setSelected([]); setNotice("That pair can coexist. Rebuild the timeline and try again.");
  };

  const nextCase = () => {
    if (caseIndex === CASES.length - 1) {
      const finalScore = score;
      setBest((current) => {
        const next = Math.max(current, finalScore);
        try { localStorage.setItem("fairbyte:alibi-file:best", String(next)); } catch { /* storage optional */ }
        return next;
      });
      audio.play("complete"); setPhase("complete"); return;
    }
    audio.play("navigate"); setCaseIndex((value) => value + 1); setSelected([]); setShowHint(false); setNotice("Select two records that cannot both be true."); setPhase("case");
  };

  const revealHint = () => {
    if (showHint) return;
    audio.play("hint"); setShowHint(true); setScore((value) => Math.max(0, value - 250));
  };

  if (phase === "intro") return (
    <main className={styles.intro}>
      <Image src="/arcade/alibi-file-cover.jpg" alt="A detective desk covered in evidence" fill priority className={styles.introArt} />
      <div className={styles.introShade} />
      <header className={styles.introNav}><Link href="/arcade/">← FAIRBYTE ARCADE</Link><span>CASE ARCHIVE · 03 FILES</span></header>
      <section className={styles.introCopy}>
        <span className={styles.eyebrow}>A DEDUCTION GAME</span>
        <h1>ALIBI<br/><em>FILE</em></h1>
        <p>Every story works until two details occupy the same minute. Compare the evidence. Find the contradiction. Break the alibi.</p>
        <button onClick={start}>OPEN THE FIRST FILE <b>→</b></button>
        <div className={styles.rules}><span><b>01</b> Read the testimony</span><span><b>02</b> Select two records</span><span><b>03</b> Expose the contradiction</span></div>
      </section>
    </main>
  );

  if (phase === "complete") return (
    <main className={styles.complete}>
      <div className={styles.completeCard}><span>ARCHIVE CLOSED</span><h1>{score >= 3800 ? "Chief Inspector" : score >= 3200 ? "Case Breaker" : "Persistent Eye"}</h1><p>Three alibis dismantled. The smallest details made the loudest noise.</p><div className={styles.finalStats}><div><b>{score}</b><span>FINAL SCORE</span></div><div><b>{mistakes}</b><span>FALSE LEADS</span></div><div><b>{Math.max(best, score)}</b><span>BEST</span></div></div><button onClick={start}>REOPEN ARCHIVE</button><Link href="/arcade/">RETURN TO ARCADE →</Link></div>
    </main>
  );

  return (
    <main className={styles.game}>
      <header className={styles.topbar}><Link href="/arcade/">FAIRBYTE / ARCADE</Link><div><span>ALIBI</span> FILE</div><button onClick={audio.toggle}>{audio.enabled ? "SOUND ON" : "SOUND OFF"}</button></header>
      <section className={styles.caseHead}><div><span>CASE {file.number}</span><h1>{file.title}</h1><p>{file.place}</p></div><div className={styles.caseScore}><span>FILE {caseIndex + 1} / {CASES.length}</span><b>{score}</b><small>POINTS</small></div></section>
      <section className={styles.workspace}>
        <aside className={styles.testimony}><span>INCIDENT</span><p>{file.briefing}</p><div className={styles.statement}><small>RECORDED STATEMENT</small><h2>{file.suspect}</h2><blockquote>“{file.statement}”</blockquote><i>SIGNED / TRANSCRIBED</i></div><button onClick={revealHint} disabled={showHint}>{showHint ? "HINT OPEN" : "REQUEST A HINT · −250"}</button>{showHint && <p className={styles.hint}>{file.hint}</p>}</aside>
        <section className={styles.evidenceBoard} aria-label="Evidence records">
          <div className={styles.boardLabel}><span>EVIDENCE BOARD</span><b>{selected.length}/2 SELECTED</b></div>
          <div className={styles.evidenceGrid}>{file.evidence.map((item, index) => <button key={item.id} onClick={() => toggleEvidence(item.id)} className={`${styles.evidence} ${selected.includes(item.id) ? styles.selected : ""}`} style={{ transform: `rotate(${[-1.2, 0.8, 1.3, -0.6][index]}deg)` }}><span>{item.kind}</span><time>{item.time}</time><h3>{item.title}</h3><p>{item.detail}</p><i>{selected.includes(item.id) ? "✓ MARKED" : `EXHIBIT ${String.fromCharCode(65 + index)}`}</i></button>)}</div>
        </section>
      </section>
      <footer className={styles.actionBar}><p className={notice.includes("coexist") ? styles.badNotice : ""}>{notice}</p><button onClick={testContradiction} disabled={selected.length !== 2}>TEST CONTRADICTION →</button></footer>
      {phase === "solved" && <div className={styles.solvedOverlay} role="dialog" aria-modal="true"><div><span>ALIBI BROKEN</span><h2>{file.title}</h2><p>{file.explanation}</p><button onClick={nextCase}>{caseIndex === CASES.length - 1 ? "CLOSE THE ARCHIVE" : "OPEN NEXT FILE"} →</button></div></div>}
    </main>
  );
}
