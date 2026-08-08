"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useGameAudio } from "../../useGameAudio";
import styles from "./game.module.css";

type AppName = "mail" | "photos" | "settings" | "notes" | "vault" | "browser" | "help";
const APPS: { id: AppName; icon: string; label: string }[] = [
  { id: "mail", icon: "✉", label: "Mail" }, { id: "photos", icon: "▣", label: "Photos" }, { id: "notes", icon: "▤", label: "Notes" }, { id: "settings", icon: "⚙", label: "Settings" }, { id: "vault", icon: "◇", label: "Private" }, { id: "browser", icon: "◎", label: "Browser" }, { id: "help", icon: "?", label: "Recovery" },
];

export default function RoomGame() {
  const audio = useGameAudio();
  const [phase, setPhase] = useState<"intro" | "desktop" | "complete">("intro");
  const [app, setApp] = useState<AppName | null>(null);
  const [photo, setPhoto] = useState(0);
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [notice, setNotice] = useState("Guest session restored from unexpected shutdown.");
  const [seconds, setSeconds] = useState(0);
  const [hints, setHints] = useState(0);
  const [best, setBest] = useState(0);
  useEffect(()=>{const restore=window.setTimeout(()=>{try{setBest(Number(localStorage.getItem("fairbyte:room404:best")||0));}catch{}},0);return()=>window.clearTimeout(restore)},[]);
  useEffect(()=>{if(phase!=="desktop")return;const timer=window.setInterval(()=>setSeconds(v=>v+1),1000);return()=>window.clearInterval(timer)},[phase]);
  const start=()=>{audio.play("navigate");setPhase("desktop");setApp(null);setCode("");setUnlocked(false);setNotice("Guest session restored from unexpected shutdown.");setSeconds(0);setHints(0)};
  const open=(id:AppName)=>{audio.play("navigate");setApp(id);if(id==="mail")setNotice("One unread message opened.");if(id==="photos")setNotice("Photo library mounted in read-only mode.");};
  const submitCode=()=>{if(code==="404614"){audio.play("success");setUnlocked(true);setNotice("Private archive unlocked. A new address has appeared in Browser.");}else{audio.play("error");setCode("");setNotice("Incorrect archive code. The hint was split across three apps.");}};
  const escape=()=>{if(!unlocked){audio.play("error");setNotice("The address does not exist. Private archive access may rewrite it.");return;}audio.play("complete");setBest(old=>{const next=!old?seconds:Math.min(old,seconds);try{localStorage.setItem("fairbyte:room404:best",String(next));}catch{}return next});setPhase("complete")};

  if(phase==="intro")return <main className={styles.intro}><Image src="/arcade/room-404-cover.jpg" alt="A surreal lavender computer room with an impossible doorway" fill priority className={styles.introArt}/><div className={styles.introFog}/><header><Link href="/arcade/">FAIRBYTE ARCADE</Link><span>DESKTOP ESCAPE · GAME 006</span></header><section><span>THE ROOM HAS NO EXIT</span><h1>ROOM<br/><em>404</em></h1><p>An abandoned computer is still running. Search its messages, photographs, settings, and private files. Somewhere inside the desktop is a door.</p><button onClick={start}>RESTORE GUEST SESSION <b>→</b></button><small>No typing commands. Everything you need is visible.</small></section></main>;
  if(phase==="complete")return <main className={styles.complete}><Image src="/arcade/room-404-cover.jpg" alt="An open glass doorway inside a computer screen" fill className={styles.completeArt}/><div className={styles.completeGlow}/><section><span>ADDRESS RESOLVED</span><h1>The door was a link.</h1><p>The browser opened a place the operating system insisted did not exist. Room 404 is empty now.</p><div><b>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</b><small>ESCAPE TIME</small><b>{hints}</b><small>RECOVERY HINTS</small><b>{best?`${Math.floor(Math.min(best,seconds)/60)}:${String(Math.min(best,seconds)%60).padStart(2,"0")}`:"—"}</b><small>BEST</small></div><button onClick={start}>RESTORE AGAIN</button><Link href="/arcade/">RETURN TO ARCADE →</Link></section></main>;

  return <main className={styles.desktop}>
    <Image src="/arcade/room-404-cover.jpg" alt="Room 404 desktop wallpaper" fill priority className={styles.wallpaper}/><div className={styles.wallpaperWash}/>
    <header className={styles.menubar}><button onClick={()=>open("help")} className={styles.orb}>F</button><span>RoomOS · Guest</span><div><span>{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,"0")}</span><button onClick={audio.toggle}>{audio.enabled?"◖))":"×"}</button><Link href="/arcade/">EXIT</Link></div></header>
    <section className={styles.icons} aria-label="Desktop applications">{APPS.map(item=><button key={item.id} onDoubleClick={()=>open(item.id)} onClick={()=>open(item.id)}><i>{item.icon}</i><span>{item.label}</span>{item.id==="mail"&&<b>1</b>}{item.id==="browser"&&unlocked&&<b>!</b>}</button>)}</section>
    {app&&<section className={`${styles.window} ${styles[app]}`} role="dialog" aria-label={`${app} application`}><header><span>{APPS.find(item=>item.id===app)?.icon}</span><b>{APPS.find(item=>item.id===app)?.label}</b><button onClick={()=>setApp(null)}>×</button></header><div className={styles.windowBody}>
      {app==="mail"&&<><aside><button className={styles.activeMail}>● Mara V.<span>Before you forget</span></button><button>Building Admin<span>Lease reminder</span></button><button>System<span>Recovery enabled</span></button></aside><article><span>FROM · MARA VOSS</span><h2>Before you forget again</h2><p>The private archive code is the <strong>room number</strong> followed by the <strong>real time</strong> in the east-window photograph.</p><p>You set the computer clock wrong during the move. I wrote the correction somewhere obvious.</p><blockquote>Do not trust the time printed on the picture.</blockquote><small>— Mara</small></article></>}
      {app==="photos"&&<><aside>{["East window","Moving day","Empty hall"].map((name,i)=><button key={name} className={photo===i?styles.activePhoto:""} onClick={()=>{audio.play("tap");setPhoto(i)}}><i>{i===0?"☀":"▧"}</i>{name}</button>)}</aside><article className={styles.photoView}><div className={styles.photoImage}>{photo===0?<><span className={styles.sun}/><i className={styles.mountains}/><b>EAST WINDOW</b></>:photo===1?<><span className={styles.boxes}>□<br/>□□</span><b>MOVING DAY</b></>:<><span className={styles.door}>▯</span><b>EMPTY HALL</b></>}</div><div><span>CAPTURED</span><b>{photo===0?"05:29":photo===1?"14:08":"23:11"}</b><span>CAMERA</span><b>RoomCam 1.0</b>{photo===0&&<p>★ Marked favorite</p>}</div></article></>}
      {app==="settings"&&<article className={styles.settingsPanel}><h2>Clock & location</h2><div><span>SYSTEM TIME OFFSET</span><b>− 45 MINUTES</b><p>The displayed clock runs forty-five minutes behind local time.</p></div><div><span>DEVICE LOCATION</span><b>ROOM 404</b><p>North Annex · fourth floor</p></div><div><span>AUTOMATIC CORRECTION</span><button>OFF</button></div></article>}
      {app==="notes"&&<article className={styles.notesPanel}><h2>Things that keep disappearing</h2><label><input type="checkbox" checked readOnly/>Keys</label><label><input type="checkbox" checked readOnly/>Fourth-floor map</label><label><input type="checkbox"/>The east hallway</label><label><input type="checkbox"/>A way out</label><p>Six digits. No spaces. The clock lies.</p></article>}
      {app==="vault"&&<article className={styles.vaultPanel}>{unlocked?<><span className={styles.unlockedIcon}>◇</span><h2>Archive unlocked</h2><p>The folder contains one shortcut:</p><button onClick={()=>open("browser")}><b>door.room</b><span>Open in Browser →</span></button></>:<><span className={styles.lockIcon}>◆</span><h2>Private archive</h2><p>Enter the six-digit archive code.</p><input aria-label="Archive code" inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} placeholder="••••••"/><button onClick={submitCode} disabled={code.length!==6}>UNLOCK</button></>}</article>}
      {app==="browser"&&<article className={styles.browserPanel}><div><span>◀</span><span>▶</span><label>{unlocked?"room://door":"room://404-not-found"}</label></div><section className={unlocked?styles.doorPage:""}>{unlocked?<><span>404</span><h2>A door has been found.</h2><p>This address exists outside the desktop.</p><button onClick={escape}>OPEN DOOR →</button></>:<><b>404</b><h2>There is no door here.</h2><p>The requested address could not be found in this room.</p></>}</section></article>}
      {app==="help"&&<article className={styles.helpPanel}><span>?</span><h2>Recovery Assistant</h2><p>{hints===0?"Start with the unread message. It explains the structure of the archive code.":hints===1?"The east-window photo contains a time, but the system clock is inaccurate.":hints===2?"Settings shows both the room number and the amount of time needed to correct the photograph.":"05:29 plus 45 minutes is 06:14. Join 404 and 614."}</p><button onClick={()=>{audio.play("hint");setHints(v=>Math.min(3,v+1))}} disabled={hints===3}>{hints===3?"FULL SOLUTION SHOWN":"ANOTHER HINT"}</button></article>}
    </div></section>}
    <footer className={styles.dock}>{APPS.slice(0,6).map(item=><button key={item.id} onClick={()=>open(item.id)} className={app===item.id?styles.activeDock:""}>{item.icon}</button>)}</footer>
    <div className={styles.notice}>{notice}</div>
  </main>;
}
