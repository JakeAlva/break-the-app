"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import DeepFrame from "../shared/DeepFrame";
import deep from "../shared/deep.module.css";
import {useGameAudio} from "../../useGameAudio";
import styles from "./game.module.css";

type Point={x:number;y:number};
type TowerKind="beacon"|"frost"|"arc"|"furnace";
type Tower={pad:number;kind:TowerKind;level:number;cool:number};
type Enemy={id:number;type:"walker"|"runner"|"tank"|"splitter"|"boss";progress:number;hp:number;max:number;speed:number;slow:number;burn:number;reward:number};
type Shot={from:Point;to:Point;color:string;life:number};
type Phase="ready"|"build"|"wave"|"won"|"lost";
type World={phase:Phase;wave:number;light:number;core:number;score:number;towers:Tower[];enemies:Enemy[];shots:Shot[];spawned:number;toSpawn:number;spawnClock:number;nextId:number};

const W=900,H=560;
const PATH:Point[]=[{x:-25,y:120},{x:150,y:120},{x:205,y:235},{x:355,y:235},{x:410,y:105},{x:580,y:105},{x:635,y:330},{x:500,y:400},{x:270,y:375},{x:190,y:480},{x:925,y:480}];
const PADS:Point[]=[{x:90,y:220},{x:245,y:105},{x:305,y:310},{x:430,y:285},{x:510,y:190},{x:710,y:155},{x:730,y:310},{x:585,y:455},{x:380,y:465},{x:115,y:400}];
const TOWER:{[K in TowerKind]:{name:string;cost:number;color:string;range:number;rate:number;damage:number;note:string}}={
  beacon:{name:"Beacon",cost:55,color:"#f5d37b",range:118,rate:34,damage:9,note:"Reliable focused light."},
  frost:{name:"Prism",cost:70,color:"#88e8e0",range:106,rate:48,damage:5,note:"Slows enemies it hits."},
  arc:{name:"Arc",cost:90,color:"#aab8ff",range:130,rate:58,damage:7,note:"Chains through a crowd."},
  furnace:{name:"Furnace",cost:105,color:"#ff7c55",range:92,rate:70,damage:18,note:"Ignites tough targets."}
};
const fresh=():World=>({phase:"ready",wave:0,light:180,core:20,score:0,towers:[],enemies:[],shots:[],spawned:0,toSpawn:0,spawnClock:0,nextId:1});
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const waveSize=(wave:number)=>wave===12?1:7+wave*2;
const enemyAt=(progress:number)=>{let remaining=progress;for(let i=0;i<PATH.length-1;i++){const a=PATH[i],b=PATH[i+1],len=distance(a,b);if(remaining<=len)return{x:a.x+(b.x-a.x)*remaining/len,y:a.y+(b.y-a.y)*remaining/len};remaining-=len}return PATH[PATH.length-1]};
const pathLength=PATH.slice(0,-1).reduce((total,p,index)=>total+distance(p,PATH[index+1]),0);

export default function Lumenhold(){
  const audio=useGameAudio();
  const canvas=useRef<HTMLCanvasElement>(null);
  const world=useRef<World>(fresh());
  const [phase,setPhaseState]=useState<Phase>("ready");
  const [wave,setWave]=useState(0);
  const [light,setLight]=useState(180);
  const [core,setCore]=useState(20);
  const [score,setScore]=useState(0);
  const [best,setBest]=useState(0);
  const [towers,setTowers]=useState<Tower[]>([]);
  const [selected,setSelected]=useState<number|null>(null);
  const [tool,setTool]=useState<TowerKind>("beacon");

  const sync=useCallback(()=>{const w=world.current;setPhaseState(w.phase);setWave(w.wave);setLight(w.light);setCore(w.core);setScore(w.score);setTowers(w.towers.map(tower=>({...tower})))},[]);
  const setPhase=useCallback((value:Phase)=>{world.current.phase=value;setPhaseState(value)},[]);
  useEffect(()=>{try{setBest(Number(localStorage.getItem("fairbyte:lumenhold:best")||0))}catch{}},[]);
  const saveBest=useCallback(()=>{const value=world.current.score;setBest(old=>{const next=Math.max(old,value);try{localStorage.setItem("fairbyte:lumenhold:best",String(next))}catch{}return next})},[]);
  const restart=useCallback(()=>{world.current=fresh();world.current.phase="build";setSelected(null);sync();audio.play("navigate")},[audio,sync]);

  const startWave=()=>{const w=world.current;if(w.phase!=="build"||w.wave>=12)return;w.wave++;w.phase="wave";w.spawned=0;w.toSpawn=waveSize(w.wave);w.spawnClock=0;sync();audio.play("success")};
  const place=()=>{if(selected===null)return;const w=world.current;if(w.phase!=="build")return;const existing=w.towers.find(t=>t.pad===selected);if(existing)return;const data=TOWER[tool];if(w.light<data.cost)return;w.light-=data.cost;w.towers.push({pad:selected,kind:tool,level:1,cool:8});sync();audio.play("good")};
  const upgrade=()=>{if(selected===null)return;const w=world.current,tower=w.towers.find(t=>t.pad===selected);if(!tower||tower.level>=3)return;const cost=45+tower.level*35;if(w.light<cost)return;w.light-=cost;tower.level++;sync();audio.play("success")};
  const sell=()=>{if(selected===null)return;const w=world.current,tower=w.towers.find(t=>t.pad===selected);if(!tower)return;w.light+=Math.round(TOWER[tower.kind].cost*.6+tower.level*20);w.towers=w.towers.filter(t=>t!==tower);sync();audio.play("navigate")};
  const choosePad=(event:React.PointerEvent<HTMLCanvasElement>)=>{const box=event.currentTarget.getBoundingClientRect(),p={x:(event.clientX-box.left)*W/box.width,y:(event.clientY-box.top)*H/box.height};let pick=-1,bestDistance=42;PADS.forEach((pad,index)=>{const d=distance(p,pad);if(d<bestDistance){pick=index;bestDistance=d}});if(pick>=0){setSelected(pick);audio.play("tap")}};

  useEffect(()=>{let request=0,last=performance.now();const ctx=canvas.current?.getContext("2d");if(!ctx)return;const tick=(now:number)=>{const dt=Math.min(2,(now-last)/16.67);last=now;const w=world.current;if(w.phase==="wave"){
      w.spawnClock-=dt;if(w.spawned<w.toSpawn&&w.spawnClock<=0){const boss=w.wave===12;const roll=(w.spawned+w.wave)%7;const type=boss?"boss":roll===0?"tank":roll===2?"runner":roll===5?"splitter":"walker";const base=type==="boss"?900:type==="tank"?75:type==="runner"?24:type==="splitter"?42:34;const max=Math.round(base*(1+w.wave*.17));w.enemies.push({id:w.nextId++,type,progress:0,hp:max,max,speed:type==="boss"?.47:type==="tank"?.55:type==="runner"?1.25:type==="splitter"?.76:.83,slow:0,burn:0,reward:type==="boss"?500:type==="tank"?22:type==="runner"?11:15});w.spawned++;w.spawnClock=type==="boss"?100:32-Math.min(12,w.wave)}
      w.enemies.forEach(enemy=>{enemy.slow=Math.max(0,enemy.slow-dt);enemy.burn=Math.max(0,enemy.burn-dt);if(enemy.burn>0)enemy.hp-=.11*dt;enemy.progress+=enemy.speed*(enemy.slow>0?.55:1)*dt});
      const escaped=w.enemies.filter(enemy=>enemy.progress>=pathLength);if(escaped.length){w.core-=escaped.reduce((loss,enemy)=>loss+(enemy.type==="boss"?10:enemy.type==="tank"?2:1),0);w.enemies=w.enemies.filter(enemy=>enemy.progress<pathLength);audio.play("error")}
      w.towers.forEach(tower=>{tower.cool-=dt;if(tower.cool>0)return;const data=TOWER[tower.kind],origin=PADS[tower.pad],targets=w.enemies.filter(enemy=>distance(origin,enemyAt(enemy.progress))<data.range).sort((a,b)=>b.progress-a.progress);const target=targets[0];if(!target)return;tower.cool=data.rate/(1+(tower.level-1)*.18);const damage=data.damage*(1+(tower.level-1)*.65);target.hp-=damage;if(tower.kind==="frost")target.slow=75;if(tower.kind==="furnace")target.burn=150;if(tower.kind==="arc")targets.slice(1,1+tower.level).forEach(extra=>{extra.hp-=damage*.55;w.shots.push({from:enemyAt(target.progress),to:enemyAt(extra.progress),color:data.color,life:7})});w.shots.push({from:origin,to:enemyAt(target.progress),color:data.color,life:7})});
      const defeated=w.enemies.filter(enemy=>enemy.hp<=0);if(defeated.length){for(const enemy of defeated){w.light+=enemy.reward;w.score+=enemy.reward*10}w.enemies=w.enemies.filter(enemy=>enemy.hp>0)}w.shots.forEach(shot=>shot.life-=dt);w.shots=w.shots.filter(shot=>shot.life>0);
      if(w.core<=0){w.phase="lost";saveBest();sync();audio.play("error")}else if(w.spawned>=w.toSpawn&&w.enemies.length===0){w.score+=w.wave*200;w.light+=35+w.wave*3;if(w.wave>=12){w.phase="won";w.score+=3000;saveBest();audio.play("complete")}else{w.phase="build";audio.play("success")}sync()}
    }
    ctx.fillStyle="#06100d";ctx.fillRect(0,0,W,H);const glow=ctx.createRadialGradient(470,290,30,470,290,520);glow.addColorStop(0,"#193d2c");glow.addColorStop(1,"#030706");ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);ctx.strokeStyle="#173029";ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    ctx.strokeStyle="#23342f";ctx.lineWidth=48;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();PATH.forEach((p,index)=>index?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.strokeStyle="#82734b";ctx.lineWidth=2;ctx.setLineDash([8,13]);ctx.stroke();ctx.setLineDash([]);
    PADS.forEach((pad,index)=>{const tower=w.towers.find(t=>t.pad===index);ctx.beginPath();ctx.arc(pad.x,pad.y,selected===index?21:17,0,Math.PI*2);ctx.fillStyle=tower?"#17251f":"#0a1511";ctx.fill();ctx.strokeStyle=selected===index?"#fff0b2":"#506a5e";ctx.lineWidth=selected===index?3:1;ctx.stroke();if(tower){const data=TOWER[tower.kind];ctx.fillStyle=data.color;ctx.shadowColor=data.color;ctx.shadowBlur=12;ctx.fillRect(pad.x-5-tower.level,pad.y-13,10+tower.level*2,26);ctx.beginPath();ctx.arc(pad.x,pad.y-12,7+tower.level,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}});
    w.enemies.forEach(enemy=>{const p=enemyAt(enemy.progress),r=enemy.type==="boss"?25:enemy.type==="tank"?16:enemy.type==="runner"?9:12;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(now/650+enemy.id);ctx.fillStyle=enemy.type==="boss"?"#df3f69":enemy.burn>0?"#ff8855":enemy.slow>0?"#82e8e3":"#c94d65";ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=enemy.type==="boss"?20:8;ctx.beginPath();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.restore();ctx.shadowBlur=0;ctx.fillStyle="#101511";ctx.fillRect(p.x-r,p.y-r-9,r*2,3);ctx.fillStyle="#f5d37b";ctx.fillRect(p.x-r,p.y-r-9,r*2*Math.max(0,enemy.hp/enemy.max),3)});w.shots.forEach(shot=>{ctx.globalAlpha=shot.life/7;ctx.strokeStyle=shot.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(shot.from.x,shot.from.y);ctx.lineTo(shot.to.x,shot.to.y);ctx.stroke()});ctx.globalAlpha=1;
    ctx.fillStyle="#f5d37b";ctx.shadowColor="#f5d37b";ctx.shadowBlur=30;ctx.beginPath();ctx.arc(870,480,23,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;request=requestAnimationFrame(tick)};request=requestAnimationFrame(tick);return()=>cancelAnimationFrame(request)},[audio,saveBest,selected,sync]);

  const current=selected===null?undefined:towers.find(t=>t.pad===selected);
  const controls=<><button onClick={()=>setTool("beacon")}>BEACON</button><button onClick={()=>setTool("frost")}>PRISM</button><button onClick={()=>setTool("arc")}>ARC</button><button onClick={()=>setTool("furnace")}>FURNACE</button></>;
  const side=<><div className={styles.selected}><span>SELECTED NODE</span>{selected===null?<p>Tap a circular foundation on the map.</p>:current?<><b>{TOWER[current.kind].name} · LV {current.level}</b><p>{TOWER[current.kind].note}</p><div><button onClick={upgrade} disabled={phase!=="build"||current.level>=3}>UPGRADE {current.level<3?45+current.level*35:"MAX"}</button><button onClick={sell} disabled={phase!=="build"}>SELL</button></div></>:<><b>EMPTY FOUNDATION</b><p>{TOWER[tool].note}</p><div><button onClick={place} disabled={phase!=="build"||light<TOWER[tool].cost}>BUILD {TOWER[tool].cost}</button></div></>}</div><div className={styles.legend}><span><i style={{background:"#c94d65"}}/>WALKER</span><span><i style={{background:"#82e8e3"}}/>SLOWED</span><span><i style={{background:"#ff8855"}}/>BURNING</span></div></>;
  return <DeepFrame number="014" title="Lumenhold" collection="TACTICAL TOWER DEFENSE" tagline="Build the light. Hold the long night." accent="#f5d37b" accent2="#88e8e0" status={phase==="wave"?`WAVE ${wave} ACTIVE`:phase==="build"?`BUILD PHASE · WAVE ${wave+1}`:phase.toUpperCase()} stats={[{label:"LIGHT",value:light},{label:"CORE",value:core},{label:"BEST",value:best}]} sound={audio.enabled} onSound={audio.toggle} onRestart={restart} objective="Keep the final light alive through twelve escalating waves." instructions={["Select a foundation, pick one of four tower roles, then build.","Upgrade focused defenses between waves; selling refunds part of the cost.","Runners, tanks, splitters, and the Night Crown demand different coverage."]} controls={controls} side={side}>
    <div className={`${deep.board} ${styles.map}`}><canvas ref={canvas} width={W} height={H} className={deep.canvas} onPointerDown={choosePad} aria-label="Lumenhold tactical defense map"/><div className={styles.topbar}><span>CORE ROUTE · WEST GATE → LAST LIGHT</span><span>WAVE {wave}/12 · SCORE {score}</span></div>{(phase==="build"||phase==="wave")&&<div className={styles.dock}>{(Object.keys(TOWER) as TowerKind[]).map(kind=><button key={kind} className={tool===kind?styles.active:""} onClick={()=>setTool(kind)} disabled={phase!=="build"}><i>◆</i><b>{TOWER[kind].name}</b><small>{TOWER[kind].cost} LIGHT</small></button>)}<button className={styles.wave} onClick={startWave} disabled={phase!=="build"}>{wave>=11?"CALL THE NIGHT CROWN":"START NEXT WAVE"}</button></div>}{(phase==="ready"||phase==="won"||phase==="lost")&&<div className={deep.overlay}><div><span className={phase==="won"?styles.victory:""}>{phase==="won"?"THE LAST LIGHT HOLDS":phase==="lost"?"THE NIGHT BROKE THROUGH":"GAME 014 · LUMENHOLD"}</span><h2>{phase==="won"?"Dawn answers.":phase==="lost"?"Rebuild the line.":"Twelve waves. One light."}</h2><p>Four tower classes, three upgrade tiers, five enemy roles, an economy that rewards clean defenses, and a final boss wave.</p><button onClick={restart}>{phase==="ready"?"LIGHT THE BEACONS":"BUILD AGAIN"}</button></div></div>}</div>
  </DeepFrame>
}
