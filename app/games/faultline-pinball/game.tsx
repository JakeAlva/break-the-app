"use client";

import {useCallback,useEffect,useRef,useState} from "react";
import DeepFrame from "../shared/DeepFrame";
import deep from "../shared/deep.module.css";
import {useGameAudio} from "../../useGameAudio";
import styles from "./game.module.css";

type Point={x:number;y:number};
type Ball=Point&{vx:number;vy:number;r:number;held:boolean;live:boolean;hitLock:number;skill:boolean;trail:Point[]};
type Bumper=Point&{r:number;color:string;value:number};
type Phase="ready"|"playing"|"over";
type World={phase:Phase;balls:Ball[];ballNumber:number;score:number;multiplier:number;quake:number;stations:boolean[];combo:number;comboClock:number;charge:number;nudgeCount:number;tilt:number;flash:number;shake:number;lastChargeUi:number};

const W=720,H=760;
const BUMPERS:Bumper[]=[
  {x:245,y:248,r:35,color:"#fd75cf",value:250},
  {x:468,y:224,r:34,color:"#7ffcff",value:250},
  {x:355,y:354,r:41,color:"#ffdc65",value:400},
  {x:179,y:427,r:26,color:"#8e77ff",value:180},
  {x:521,y:418,r:26,color:"#ff6b72",value:180},
];
const STATIONS:Point[]=[{x:150,y:160},{x:350,y:120},{x:550,y:160}];
const POSTS:Point[]=[{x:211,y:620},{x:489,y:620},{x:112,y:522},{x:588,y:522}];
const leftRest=.24,leftActive=-.48,rightRest=Math.PI-.24,rightActive=Math.PI+.48;
const fresh=():World=>({phase:"ready",balls:[],ballNumber:1,score:0,multiplier:1,quake:0,stations:[false,false,false],combo:0,comboClock:0,charge:0,nudgeCount:0,tilt:0,flash:0,shake:0,lastChargeUi:-1});
const makeBall=(held=true):Ball=>({x:648,y:675,vx:0,vy:0,r:9,held,live:true,hitLock:0,skill:false,trail:[]});
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

function circleCollision(ball:Ball,center:Point,radius:number,kick:number){
  const dx=ball.x-center.x,dy=ball.y-center.y,distance=Math.hypot(dx,dy),minimum=ball.r+radius;
  if(distance>=minimum)return false;
  const nx=dx/(distance||1),ny=dy/(distance||1),dot=ball.vx*nx+ball.vy*ny;
  if(dot<0){ball.vx-=2*dot*nx;ball.vy-=2*dot*ny}
  ball.vx+=nx*kick;ball.vy+=ny*kick;
  ball.x=center.x+nx*(minimum+1);ball.y=center.y+ny*(minimum+1);
  return true;
}

function segmentCollision(ball:Ball,a:Point,b:Point,width=7,restitution=.88){
  const dx=b.x-a.x,dy=b.y-a.y,lengthSquared=dx*dx+dy*dy;
  const t=clamp(((ball.x-a.x)*dx+(ball.y-a.y)*dy)/lengthSquared,0,1);
  const point={x:a.x+t*dx,y:a.y+t*dy},nx0=ball.x-point.x,ny0=ball.y-point.y,distance=Math.hypot(nx0,ny0),minimum=ball.r+width;
  if(distance>=minimum)return false;
  const nx=nx0/(distance||1),ny=ny0/(distance||1),dot=ball.vx*nx+ball.vy*ny;
  if(dot<0){ball.vx-=(1+restitution)*dot*nx;ball.vy-=(1+restitution)*dot*ny}
  ball.x=point.x+nx*(minimum+.5);ball.y=point.y+ny*(minimum+.5);
  return true;
}

function flipperCollision(ball:Ball,pivot:Point,angle:number,active:boolean,left:boolean){
  const tip={x:pivot.x+Math.cos(angle)*112,y:pivot.y+Math.sin(angle)*112};
  if(!segmentCollision(ball,pivot,tip,11,.78))return false;
  if(active){ball.vy=Math.min(ball.vy-7.6,-7.2);ball.vx+=(left?1:-1)*1.15}
  return true;
}

export default function FaultlinePinball(){
  const audio=useGameAudio();
  const canvas=useRef<HTMLCanvasElement>(null);
  const world=useRef<World>(fresh());
  const input=useRef({left:false,right:false,launch:false});
  const [phase,setPhase]=useState<Phase>("ready");
  const [score,setScore]=useState(0);
  const [ballNumber,setBallNumber]=useState(1);
  const [activeBalls,setActiveBalls]=useState(0);
  const [waiting,setWaiting]=useState(false);
  const [charge,setCharge]=useState(0);
  const [nudges,setNudges]=useState(0);
  const [multiplier,setMultiplier]=useState(1);
  const [quake,setQuake]=useState(0);
  const [stations,setStations]=useState([false,false,false]);
  const [best,setBest]=useState(0);

  useEffect(()=>{const timer=window.setTimeout(()=>{try{setBest(Number(localStorage.getItem("fairbyte:faultline:best")||0))}catch{}},0);return()=>window.clearTimeout(timer)},[]);
  const sync=useCallback(()=>{const w=world.current;setScore(w.score);setBallNumber(w.ballNumber);setActiveBalls(w.balls.length);setWaiting(w.balls.some(ball=>ball.held));setCharge(Math.round(w.charge));setNudges(w.nudgeCount);setMultiplier(w.multiplier);setQuake(w.quake);setStations([...w.stations])},[]);
  const saveBest=useCallback((value:number)=>setBest(old=>{const next=Math.max(old,value);try{localStorage.setItem("fairbyte:faultline:best",String(next))}catch{}return next}),[]);
  const restart=useCallback(()=>{const next=fresh();next.phase="playing";next.balls=[makeBall()];world.current=next;input.current={left:false,right:false,launch:false};setPhase("playing");sync();audio.play("success")},[audio,sync]);

  const releasePlunger=useCallback(()=>{input.current.launch=false;const w=world.current,held=w.balls.find(ball=>ball.held);if(w.phase!=="playing"||!held)return;held.held=false;held.vx=-.15;held.vy=-(10.8+w.charge*.082);w.charge=0;w.lastChargeUi=-1;sync();audio.play("success")},[audio,sync]);
  const pressPlunger=useCallback(()=>{if(world.current.phase!=="playing")return;input.current.launch=true},[]);
  const setFlipper=useCallback((side:"left"|"right",down:boolean)=>{input.current[side]=down},[]);
  const nudge=useCallback(()=>{const w=world.current;if(w.phase!=="playing"||w.tilt>0||w.balls.every(ball=>ball.held))return;w.nudgeCount++;if(w.nudgeCount>=3){w.tilt=240;audio.play("error")}else{w.balls.forEach(ball=>{if(!ball.held){ball.vy-=2.2;ball.vx+=(Math.random()-.5)*2.4}});w.shake=18;audio.play("navigate")}sync()},[audio,sync]);

  useEffect(()=>{const down=(event:KeyboardEvent)=>{const key=event.key.toLowerCase();if(["arrowleft","arrowright","arrowup","a","d","w"," ","arrowdown"].includes(key))event.preventDefault();if((key===" "||key==="arrowdown")&&world.current.phase!=="playing"){if(!event.repeat)restart();return}if(key==="arrowleft"||key==="a")setFlipper("left",true);if(key==="arrowright"||key==="d")setFlipper("right",true);if(key===" "||key==="arrowdown")pressPlunger();if((key==="arrowup"||key==="w")&&!event.repeat)nudge()};const up=(event:KeyboardEvent)=>{const key=event.key.toLowerCase();if(key==="arrowleft"||key==="a")setFlipper("left",false);if(key==="arrowright"||key==="d")setFlipper("right",false);if(key===" "||key==="arrowdown")releasePlunger()};window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)}},[nudge,pressPlunger,releasePlunger,restart,setFlipper]);

  useEffect(()=>{let frame=0,last=performance.now();const ctx=canvas.current?.getContext("2d");if(!ctx)return;
    const award=(value:number)=>{const w=world.current;w.combo++;w.comboClock=105;const comboFactor=1+Math.floor(w.combo/5);w.score+=value*w.multiplier*comboFactor;w.quake=Math.min(100,w.quake+value/68);w.flash=5;if(w.quake>=100&&w.balls.filter(ball=>!ball.held).length===1){w.quake=0;w.balls.push({...makeBall(false),x:330,y:320,vx:-5.3,vy:-7.5},{...makeBall(false),x:385,y:330,vx:5.1,vy:-7.1});w.multiplier=Math.min(8,w.multiplier+1);w.shake=42;audio.play("complete")}sync()};
    const drainBall=()=>{const w=world.current;w.balls=w.balls.filter(ball=>ball.live);if(w.balls.length)return;if(w.ballNumber<3){w.ballNumber++;w.balls=[makeBall()];w.multiplier=1;w.combo=0;w.charge=0;w.nudgeCount=0;w.tilt=0;audio.play("error");sync()}else{w.phase="over";setPhase("over");saveBest(w.score);audio.play("complete");sync()}};
    const loop=(now:number)=>{const dt=Math.min(1.7,(now-last)/16.67);last=now;const w=world.current;
      if(w.phase==="playing"){
        w.comboClock=Math.max(0,w.comboClock-dt);if(w.comboClock===0)w.combo=0;w.flash=Math.max(0,w.flash-dt);w.shake=Math.max(0,w.shake-dt);w.tilt=Math.max(0,w.tilt-dt);
        const held=w.balls.find(ball=>ball.held);if(held){if(input.current.launch)w.charge=Math.min(100,w.charge+1.55*dt);held.x=648;held.y=675+w.charge*.22;held.vx=held.vy=0;const band=Math.floor(w.charge/4);if(band!==w.lastChargeUi){w.lastChargeUi=band;setCharge(Math.round(w.charge))}}
        const leftOn=input.current.left&&w.tilt<=0,rightOn=input.current.right&&w.tilt<=0;
        const leftAngle=leftOn?leftActive:leftRest,rightAngle=rightOn?rightActive:rightRest;
        const substeps=3,step=dt/substeps;
        for(let sub=0;sub<substeps;sub++)for(const ball of w.balls){if(!ball.live||ball.held)continue;ball.hitLock=Math.max(0,ball.hitLock-step);ball.vy+=.235*step;ball.vx*=Math.pow(.9992,step);ball.vy*=Math.pow(.9992,step);ball.x+=ball.vx*step;ball.y+=ball.vy*step;
          if(ball.x-ball.r<43){ball.x=43+ball.r;ball.vx=Math.abs(ball.vx)*.88}if(ball.x+ball.r>677){ball.x=677-ball.r;ball.vx=-Math.abs(ball.vx)*.88}if(ball.y-ball.r<42){ball.y=42+ball.r;ball.vy=Math.abs(ball.vy)*.9}
          if(ball.x>600&&ball.y<118){if(!ball.skill){ball.skill=true;award(750);audio.play("good")}ball.x=598;ball.vx=-6.2-Math.min(2,Math.abs(ball.vy)*.08);ball.vy=2.4}
          if(ball.y>128&&ball.y<712)segmentCollision(ball,{x:606,y:128},{x:606,y:712},5,.9);
          segmentCollision(ball,{x:44,y:480},{x:188,y:577},6,.82);segmentCollision(ball,{x:676,y:480},{x:512,y:577},6,.82);
          const leftSling=segmentCollision(ball,{x:146,y:535},{x:230,y:594},9,.94),rightSling=segmentCollision(ball,{x:554,y:535},{x:470,y:594},9,.94);if((leftSling||rightSling)&&ball.hitLock<=0){ball.vy-=2.6;ball.vx+=(leftSling?2.1:-2.1);ball.hitLock=8;award(140);audio.play("tap")}
          POSTS.forEach(post=>circleCollision(ball,post,8,1.1));
          for(const bumper of BUMPERS)if(circleCollision(ball,bumper,bumper.r,4.8)&&ball.hitLock<=0){ball.hitLock=7;award(bumper.value);audio.play("tap")}
          STATIONS.forEach((station,index)=>{if(!w.stations[index]&&Math.hypot(ball.x-station.x,ball.y-station.y)<24){w.stations[index]=true;award(600);audio.play("good");if(w.stations.every(Boolean)){w.stations=[false,false,false];w.multiplier=Math.min(8,w.multiplier+1);w.score+=2500*w.multiplier;w.shake=32;audio.play("success");sync()}}});
          const flipperHit=flipperCollision(ball,{x:235,y:655},leftAngle,leftOn,true)||flipperCollision(ball,{x:485,y:655},rightAngle,rightOn,false);if(flipperHit&&ball.hitLock<=0){ball.hitLock=2;audio.play("navigate")}
          ball.trail.unshift({x:ball.x,y:ball.y});ball.trail=ball.trail.slice(0,8);if(ball.x>620&&ball.y>700&&ball.vy>0){ball.held=true;ball.x=648;ball.y=675;ball.vx=ball.vy=0;ball.trail=[];sync()}else if(ball.y>H+18)ball.live=false;
        }
        if(w.balls.some(ball=>!ball.live))drainBall();
      }

      const shake=w.shake>0?(Math.random()-.5)*5:0;ctx.save();ctx.translate(shake,shake);ctx.fillStyle="#09060d";ctx.fillRect(-8,-8,W+16,H+16);const gradient=ctx.createLinearGradient(0,0,0,H);gradient.addColorStop(0,"#2a0e2f");gradient.addColorStop(.55,"#101129");gradient.addColorStop(1,"#120713");ctx.fillStyle=gradient;ctx.fillRect(30,28,W-60,H-28);ctx.strokeStyle="#fd75cf";ctx.lineWidth=5;ctx.strokeRect(30,28,W-60,H-28);
      ctx.strokeStyle="#7ffcff24";ctx.lineWidth=1;for(let y=70;y<720;y+=40){ctx.beginPath();ctx.moveTo(42,y);ctx.lineTo(677,y-16);ctx.stroke()}
      ctx.strokeStyle="#7ffcff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(606,128);ctx.lineTo(606,712);ctx.stroke();ctx.fillStyle="#09060d";ctx.fillRect(612,128,59,580);ctx.strokeStyle="#fd75cf55";ctx.strokeRect(618,130,47,574);
      ctx.strokeStyle="#7ffcff";ctx.lineWidth=4;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(44,480);ctx.lineTo(188,577);ctx.stroke();ctx.beginPath();ctx.moveTo(676,480);ctx.lineTo(512,577);ctx.stroke();
      ctx.fillStyle="#fd75cf44";ctx.strokeStyle="#fd75cf";ctx.beginPath();ctx.moveTo(146,535);ctx.lineTo(230,594);ctx.lineTo(172,590);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle="#7ffcff44";ctx.strokeStyle="#7ffcff";ctx.beginPath();ctx.moveTo(554,535);ctx.lineTo(470,594);ctx.lineTo(528,590);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.font="900 15px Arial";ctx.textAlign="center";STATIONS.forEach((station,index)=>{ctx.fillStyle=w.stations[index]?"#7ffcff":"#24152d";ctx.shadowColor="#7ffcff";ctx.shadowBlur=w.stations[index]?18:0;ctx.fillRect(station.x-21,station.y-14,42,28);ctx.strokeStyle="#7ffcff";ctx.strokeRect(station.x-21,station.y-14,42,28);ctx.fillStyle=w.stations[index]?"#071016":"#866e8d";ctx.fillText(String(index+1),station.x,station.y+5)});ctx.shadowBlur=0;
      BUMPERS.forEach(bumper=>{ctx.fillStyle=bumper.color;ctx.shadowColor=bumper.color;ctx.shadowBlur=24;ctx.beginPath();ctx.arc(bumper.x,bumper.y,bumper.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#160b1b";ctx.beginPath();ctx.arc(bumper.x,bumper.y,bumper.r*.62,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});POSTS.forEach(post=>{ctx.fillStyle="#f3eef7";ctx.beginPath();ctx.arc(post.x,post.y,8,0,Math.PI*2);ctx.fill()});
      const leftAngle=input.current.left&&w.tilt<=0?leftActive:leftRest,rightAngle=input.current.right&&w.tilt<=0?rightActive:rightRest;const drawFlipper=(pivot:Point,angle:number,color:string)=>{ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=16;ctx.lineWidth=21;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(pivot.x,pivot.y);ctx.lineTo(pivot.x+Math.cos(angle)*112,pivot.y+Math.sin(angle)*112);ctx.stroke();ctx.shadowBlur=0};drawFlipper({x:235,y:655},leftAngle,"#7ffcff");drawFlipper({x:485,y:655},rightAngle,"#fd75cf");
      const heldBall=w.balls.find(ball=>ball.held);if(heldBall){ctx.strokeStyle="#ffdc65";ctx.lineWidth=5;ctx.beginPath();for(let y=718;y<748;y+=8){ctx.lineTo(638+(y%16?10:0),y)}ctx.stroke();ctx.fillStyle="#ffdc65";ctx.fillRect(622,718-w.charge*.32,52,5)}
      w.balls.forEach(ball=>{ball.trail.forEach((point,index)=>{ctx.globalAlpha=(8-index)/32;ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(point.x,point.y,Math.max(2,ball.r-index*.65),0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;ctx.fillStyle="#fff";ctx.shadowColor="#fff";ctx.shadowBlur=18;ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0});
      if(w.tilt>0){ctx.fillStyle="#ff4f68";ctx.font="900 34px Arial";ctx.textAlign="center";ctx.fillText("TILT",350,705)}if(w.flash>0){ctx.globalAlpha=w.flash/20;ctx.fillStyle="#fff";ctx.fillRect(30,28,W-60,H-28);ctx.globalAlpha=1}ctx.restore();frame=requestAnimationFrame(loop)};
    frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame)
  },[audio,saveBest,sync]);

  const touch=<div className={styles.touch}><button aria-label="Left flipper" onPointerDown={()=>setFlipper("left",true)} onPointerUp={()=>setFlipper("left",false)} onPointerCancel={()=>setFlipper("left",false)} onPointerLeave={()=>setFlipper("left",false)}>LEFT</button><button aria-label="Nudge table" onClick={nudge}>NUDGE</button><button className={styles.launch} aria-label="Charge plunger" onPointerDown={pressPlunger} onPointerUp={releasePlunger} onPointerCancel={releasePlunger} onPointerLeave={releasePlunger}>{waiting?"HOLD / RELEASE":"LAUNCH"}</button><button aria-label="Right flipper" onPointerDown={()=>setFlipper("right",true)} onPointerUp={()=>setFlipper("right",false)} onPointerCancel={()=>setFlipper("right",false)} onPointerLeave={()=>setFlipper("right",false)}>RIGHT</button></div>;
  const side=<div className={styles.mission}><span>SEISMIC SURVEY</span><b>LIGHT ALL 3 STATIONS</b><div className={styles.lights}>{stations.map((on,index)=><i key={index} className={on?styles.on:""}/>)}</div><div className={styles.quake}><i style={{width:`${quake}%`}}/></div><span>QUAKE {Math.floor(quake)}% · FULL = MULTIBALL</span><div className={styles.nudges}>NUDGES {"◆".repeat(Math.max(0,2-nudges))}{"◇".repeat(Math.min(2,nudges))} · THIRD = TILT</div></div>;
  const status=phase==="playing"?(waiting?`PLUNGER ${charge}% · HOLD SPACE`:activeBalls>1?`MULTIBALL · ${multiplier}X`:`BALL ${ballNumber} · ${multiplier}X`):phase.toUpperCase();
  return <DeepFrame number="017" title="Faultline Pinball" collection="NEON PHYSICS TABLE" tagline="Light the stations. Wake the fault." accent="#fd75cf" accent2="#7ffcff" status={status} stats={[{label:"SCORE",value:score.toLocaleString()},{label:"BALL",value:`${ballNumber}/3`},{label:"BEST",value:best.toLocaleString()}]} sound={audio.enabled} onSound={audio.toggle} onRestart={restart} objective="Launch each ball, work the flippers, complete station missions, and trigger multiball." instructions={["Hold Space or ↓ to charge the plunger; release to launch up the shooter lane.","Use A/← and D/→ independently for the two flippers.","W/↑ nudges the table twice per ball. A third nudge causes a temporary tilt."]} controls={touch} side={side}>
    <div className={`${deep.board} ${styles.cabinet}`}><canvas ref={canvas} width={W} height={H} className={deep.canvas} aria-label="Faultline neon pinball table"/><div className={styles.screen}><span>SCORE {score.toLocaleString()}</span><span>{waiting?`CHARGE ${charge}%`:`${multiplier}X · QUAKE ${Math.floor(quake)}%`}</span></div><div className={styles.plunger}>HOLD + RELEASE · SPACE / ↓</div>{phase!=="playing"&&<div className={deep.overlay}><div><span className={styles.pink}>{phase==="over"?"FINAL BALL DRAINED":"GAME 017 · ORIGINAL TABLE"}</span><h2>{phase==="over"?score.toLocaleString():"Wake the fault."}</h2><p>A proper shooter lane and charged plunger, independent flippers, slingshots, posts, nudging and tilt, skill shots, three-ball play, missions, and multiball.</p><button onClick={restart}>{phase==="ready"?"START TABLE":"PLAY AGAIN"}</button></div></div>}</div>
  </DeepFrame>
}
