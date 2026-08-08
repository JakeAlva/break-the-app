"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameAudio } from "../../useGameAudio";
import styles from "./game.module.css";

type Metrics = { cash: number; morale: number; customers: number; reputation: number };
type Choice = { label: string; detail: string; impact: Partial<Metrics>; result: string };
type Decision = { from: string; icon: string; headline: string; context: string; left: Choice; right: Choice };
const clamp = (value: number) => Math.max(0, Math.min(100, value));

const DECISIONS: Decision[] = [
  { from: "FINANCE", icon: "$", headline: "The runway is shrinking", context: "We have six weeks of cash. A larger competitor offered to buy 18% of the company.", left: { label: "TAKE THE DEAL", detail: "Safety now, less control later", impact: { cash: 24, morale: -4, reputation: 4 }, result: "Fresh cash arrives with fourteen pages of opinions." }, right: { label: "STAY INDEPENDENT", detail: "Keep control and cut spending", impact: { cash: -14, morale: 6, reputation: 3 }, result: "The company remains yours. So does the anxiety." } },
  { from: "PRODUCT", icon: "✦", headline: "The demo is tomorrow", context: "The flashy feature is broken. The boring feature works perfectly and customers actually need it.", left: { label: "SHIP THE FLASH", detail: "High risk, high attention", impact: { customers: 16, reputation: -13, morale: -5 }, result: "The keynote trends for exactly the wrong reason." }, right: { label: "SHIP THE BORING THING", detail: "Useful beats impressive", impact: { customers: 8, reputation: 12, morale: 5 }, result: "Nobody applauds. Customers quietly renew." } },
  { from: "PEOPLE", icon: "☻", headline: "Your star engineer threatens to quit", context: "They want a promotion today. The rest of the team says they make every meeting miserable.", left: { label: "PROMOTE THEM", detail: "Protect output, risk culture", impact: { morale: -18, cash: -6, customers: 8 }, result: "Velocity climbs. Eye contact disappears." }, right: { label: "LET THEM WALK", detail: "Short pain, cultural reset", impact: { morale: 16, cash: 3, customers: -10, reputation: 6 }, result: "The roadmap slips. The team exhales." } },
  { from: "LEGAL", icon: "§", headline: "A competitor copied your landing page", context: "The resemblance is embarrassing, but a lawsuit will consume the quarter.", left: { label: "CALL THE LAWYERS", detail: "Defend the brand loudly", impact: { cash: -15, reputation: 9, morale: -4 }, result: "The cease-and-desist is beautiful and extremely expensive." }, right: { label: "OUTBUILD THEM", detail: "Turn anger into shipping", impact: { cash: -5, reputation: 5, morale: 10, customers: 7 }, result: "The team ships before legal finishes its first draft." } },
  { from: "SALES", icon: "↗", headline: "One customer could double revenue", context: "They want a custom feature that no other customer has requested.", left: { label: "SAY YES", detail: "Take the money, bend the roadmap", impact: { cash: 22, customers: 10, morale: -13 }, result: "Revenue jumps. The product grows a mysterious extra limb." }, right: { label: "PROTECT THE ROADMAP", detail: "Decline politely", impact: { cash: -7, reputation: 9, morale: 8 }, result: "They leave. Three smaller customers thank you later." } },
  { from: "SECURITY", icon: "!", headline: "An intern found a data leak", context: "No evidence suggests anyone exploited it. Disclosing it will dominate the news cycle.", left: { label: "DISCLOSE NOW", detail: "Painful transparency", impact: { reputation: 18, customers: -7, cash: -8, morale: 4 }, result: "The headline stings. Trust survives." }, right: { label: "PATCH QUIETLY", detail: "Hope nobody noticed", impact: { reputation: -22, cash: 4, morale: -7 }, result: "The patch holds. The secret does not." } },
  { from: "BRAND", icon: "◎", headline: "The company name sounds dated", context: "A consultant proposes a vowel-free rebrand and a logo that costs more than a small car.", left: { label: "REBRAND EVERYTHING", detail: "New name, new merch, new confusion", impact: { cash: -13, reputation: 4, customers: -6, morale: 5 }, result: "The hoodies look incredible. Nobody can pronounce the company." }, right: { label: "FIX THE PRODUCT", detail: "Keep the name", impact: { cash: 5, customers: 8, reputation: 5 }, result: "The old logo survives another fiscal year." } },
  { from: "OPERATIONS", icon: "⌂", headline: "The office lease expires today", context: "The team is split between remote work and a downtown headquarters with a suspiciously good espresso machine.", left: { label: "SIGN THE LEASE", detail: "A home base with overhead", impact: { cash: -17, morale: 7, reputation: 4 }, result: "The office is beautiful. The commute remains undefeated." }, right: { label: "GO REMOTE", detail: "Save cash, change the culture", impact: { cash: 16, morale: 3, reputation: -2 }, result: "The lease vanishes. Meetings multiply." } },
  { from: "SUPPORT", icon: "☎", headline: "A complaint is going viral", context: "The customer is partly wrong and completely furious. Your team wants to post the receipts.", left: { label: "WIN THE ARGUMENT", detail: "Publish every screenshot", impact: { reputation: -18, morale: 7, customers: -11 }, result: "You win the thread and lose the week." }, right: { label: "MAKE IT RIGHT", detail: "Refund and listen", impact: { cash: -7, reputation: 16, customers: 9, morale: 2 }, result: "The customer edits the post. The internet moves on." } },
  { from: "THE BOARD", icon: "♛", headline: "Final question: what are we optimizing for?", context: "The board demands one sentence before approving the next year of funding.", left: { label: "GROW AT ALL COSTS", detail: "Scale first, consequences later", impact: { cash: 18, customers: 18, reputation: -10, morale: -12 }, result: "The graph points up. Everything else becomes a footnote." }, right: { label: "BUILD TO LAST", detail: "Slower, stronger, calmer", impact: { cash: 3, customers: 8, reputation: 14, morale: 14 }, result: "The board pauses, then signs." } },
];

export default function CeoGame() {
  const audio = useGameAudio();
  const [phase, setPhase] = useState<"intro" | "playing" | "result">("intro");
  const [seconds, setSeconds] = useState(60);
  const [index, setIndex] = useState(0);
  const [metrics, setMetrics] = useState<Metrics>({ cash: 52, morale: 52, customers: 52, reputation: 52 });
  const [history, setHistory] = useState<string[]>([]);
  const [best, setBest] = useState(0);
  const decision = DECISIONS[index];
  const valuation = useMemo(() => Math.round((metrics.cash * 1.25 + metrics.customers * 1.4 + metrics.reputation * 1.15 + metrics.morale) * 42000), [metrics]);

  useEffect(() => { const restore=window.setTimeout(()=>{try { setBest(Number(localStorage.getItem("fairbyte:ceo:best") || 0)); } catch { /* optional */ }},0); return()=>window.clearTimeout(restore); }, []);
  const finish = useCallback(() => { setPhase("result"); audio.play("complete"); }, [audio]);
  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setSeconds((value) => { if (value <= 1) { window.clearInterval(timer); window.setTimeout(finish, 0); return 0; } return value - 1; }), 1000);
    return () => window.clearInterval(timer);
  }, [phase, finish]);
  useEffect(() => { if (phase !== "result") return; const save=window.setTimeout(()=>{setBest((current) => { const next = Math.max(current, valuation); try { localStorage.setItem("fairbyte:ceo:best", String(next)); } catch { /* optional */ } return next; });},0); return()=>window.clearTimeout(save); }, [phase, valuation]);

  const start = () => { audio.play("navigate"); setSeconds(60); setIndex(0); setMetrics({ cash: 52, morale: 52, customers: 52, reputation: 52 }); setHistory([]); setPhase("playing"); };
  const choose = (choice: Choice) => {
    audio.play("good"); setMetrics((current) => ({ cash: clamp(current.cash + (choice.impact.cash || 0)), morale: clamp(current.morale + (choice.impact.morale || 0)), customers: clamp(current.customers + (choice.impact.customers || 0)), reputation: clamp(current.reputation + (choice.impact.reputation || 0)) })); setHistory((current) => [choice.result, ...current].slice(0, 3));
    if (index === DECISIONS.length - 1) { window.setTimeout(finish, 50); } else setIndex((value) => value + 1);
  };

  if (phase === "intro") return <main className={styles.intro}><Image src="/arcade/sixty-second-ceo-cover.jpg" alt="A frantic executive office and giant countdown clock" fill priority className={styles.introArt}/><div className={styles.introWash}/><header><Link href="/arcade/">FAIRBYTE ARCADE</Link><span>GAME 004 · BUSINESS PANIC</span></header><section><span>WELCOME, INTERIM EXECUTIVE</span><h1><em>60</em> SECOND<br/>CEO</h1><p>Ten decisions. One minute. Keep cash, customers, morale, and reputation alive long enough to face the board.</p><button onClick={start}>TAKE THE CORNER OFFICE <b>↗</b></button><small>Every decision changes the company. There are no perfect answers.</small></section></main>;

  if (phase === "result") {
    const weakest = (Object.entries(metrics) as [keyof Metrics, number][]).sort((a,b)=>a[1]-b[1])[0][0];
    const title = valuation >= 10500000 ? "Market Visionary" : valuation >= 8500000 ? "Competent Adult" : valuation >= 6500000 ? "Chaos Manager" : "Future Podcast Host";
    return <main className={styles.result}><div className={styles.resultCard}><span>EMERGENCY BOARD REVIEW</span><h1>{title}</h1><div className={styles.valuation}><small>FINAL VALUATION</small><b>${(valuation/1000000).toFixed(1)}M</b></div><p>The company survived {index + 1} decisions. Its weakest department was <strong>{weakest}</strong>, which will absolutely be discussed after you leave.</p><div className={styles.resultMetrics}>{Object.entries(metrics).map(([key,value])=><div key={key}><span>{key}</span><b>{value}</b></div>)}</div><div className={styles.resultActions}><button onClick={start}>TRY ANOTHER QUARTER</button><Link href="/arcade/">ARCADE ↗</Link></div><small>PERSONAL BEST · ${(Math.max(best,valuation)/1000000).toFixed(1)}M</small></div></main>;
  }

  return <main className={styles.game}>
    <header className={styles.topbar}><Link href="/arcade/">F / ARCADE</Link><div className={styles.clock}><span>BOARD CALL IN</span><b>{seconds === 60 ? "01:00" : `00:${String(seconds).padStart(2,"0")}`}</b></div><button onClick={audio.toggle}>{audio.enabled ? "◖))" : "MUTED"}</button></header>
    <section className={styles.dashboard}>
      <aside className={styles.metrics}><h2>LIVE COMPANY</h2>{Object.entries(metrics).map(([key,value])=><div className={styles.metric} key={key}><span>{key.toUpperCase()}</span><b>{value}</b><i><u style={{width:`${value}%`}}/></i></div>)}<div className={styles.liveValuation}><span>EST. VALUE</span><b>${(valuation/1000000).toFixed(1)}M</b></div></aside>
      <section className={styles.decision}><div className={styles.memoTop}><span>{decision.from}</span><b>DECISION {index + 1} / {DECISIONS.length}</b></div><div className={styles.icon}>{decision.icon}</div><h1>{decision.headline}</h1><p>{decision.context}</p><div className={styles.choices}><button onClick={()=>choose(decision.left)}><span>A</span><h3>{decision.left.label}</h3><p>{decision.left.detail}</p><b>CHOOSE →</b></button><button onClick={()=>choose(decision.right)}><span>B</span><h3>{decision.right.label}</h3><p>{decision.right.detail}</p><b>CHOOSE →</b></button></div></section>
      <aside className={styles.ticker}><h2>OFFICE WIRE</h2><div className={styles.cityCrop}><Image src="/arcade/sixty-second-ceo-cover.jpg" alt="City model in the executive boardroom" fill sizes="260px"/></div>{history.length ? history.map((item,i)=><p key={item+i}><span>JUST IN</span>{item}</p>) : <p><span>09:00:00</span>The board is watching. Try to look decisive.</p>}<small>QUARTER SPEED · EXTREMELY UNREALISTIC</small></aside>
    </section>
  </main>;
}
