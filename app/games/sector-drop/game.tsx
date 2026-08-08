"use client";

import {useCallback,useEffect,useMemo,useState} from "react";
import ClassicFrame from "../classics/ClassicFrame";
import classic from "../classics/classic.module.css";
import {useGameAudio} from "../../useGameAudio";
import styles from "./game.module.css";

type Cell=string|null; type Piece={shape:number[][];x:number;y:number;color:string};
const W=10,H=18;
const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0],[1,0],[1,1]],[[0,1],[0,1],[1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
const COLORS=["#62e8ff","#ffdd57","#d08aff","#ff6f61","#7bf29a","#ff9ed7","#ff9a45"];
const empty=()=>Array.from({length:H},()=>Array<Cell>(W).fill(null));
const randomPiece=():Piece=>{const i=Math.floor(Math.random()*SHAPES.length);return{shape:SHAPES[i],x:Math.floor((W-SHAPES[i][0].length)/2),y:-1,color:COLORS[i]}};
const firstPiece=(index:number):Piece=>({shape:SHAPES[index],x:Math.floor((W-SHAPES[index][0].length)/2),y:-1,color:COLORS[index]});
const hit=(board:Cell[][],piece:Piece,dx=0,dy=0,shape=piece.shape)=>shape.some((row,y)=>row.some((v,x)=>v&&(piece.x+x+dx<0||piece.x+x+dx>=W||piece.y+y+dy>=H||(piece.y+y+dy>=0&&board[piece.y+y+dy][piece.x+x+dx]))));
const rotate=(shape:number[][])=>shape[0].map((_,i)=>shape.map(row=>row[i]).reverse());

export default function SectorDrop(){
  const audio=useGameAudio(); const [board,setBoard]=useState<Cell[][]>(empty); const [piece,setPiece]=useState<Piece>(()=>firstPiece(0)); const [next,setNext]=useState<Piece>(()=>firstPiece(1)); const [score,setScore]=useState(0); const [lines,setLines]=useState(0); const [best,setBest]=useState(0); const [phase,setPhase]=useState<"ready"|"playing"|"over">("ready");
  useEffect(()=>{const timer=window.setTimeout(()=>{try{setBest(Number(localStorage.getItem("fairbyte:sector-drop:best")||0))}catch{}},0);return()=>window.clearTimeout(timer)},[]);
  const restart=useCallback(()=>{audio.play("navigate");setBoard(empty());setPiece(randomPiece());setNext(randomPiece());setScore(0);setLines(0);setPhase("playing")},[audio]);
  const lock=useCallback((current:Piece)=>{let merged=board.map(row=>[...row]);current.shape.forEach((row,y)=>row.forEach((v,x)=>{const yy=current.y+y;if(v&&yy>=0)merged[yy][current.x+x]=current.color}));const kept=merged.filter(row=>row.some(v=>!v));const cleared=H-kept.length;merged=[...Array.from({length:cleared},()=>Array<Cell>(W).fill(null)),...kept];if(cleared){audio.play(cleared>=3?"success":"complete");setLines(v=>v+cleared);setScore(v=>v+[0,100,280,520,900][cleared])}else audio.play("tap");setBoard(merged);const incoming={...next,x:Math.floor((W-next.shape[0].length)/2),y:-1};setNext(randomPiece());if(hit(merged,incoming,0,1)){audio.play("error");setPhase("over");setBest(old=>{const value=Math.max(old,score);try{localStorage.setItem("fairbyte:sector-drop:best",String(value))}catch{}return value})}else setPiece(incoming)},[audio,board,next,score]);
  const drop=useCallback(()=>{if(phase!=="playing")return;if(!hit(board,piece,0,1))setPiece({...piece,y:piece.y+1});else lock(piece)},[board,lock,phase,piece]);
  const move=useCallback((dx:number)=>{if(phase!=="playing"||hit(board,piece,dx,0))return;setPiece({...piece,x:piece.x+dx});audio.play("navigate")},[audio,board,phase,piece]);
  const spin=useCallback(()=>{if(phase!=="playing")return;const turned=rotate(piece.shape);if(!hit(board,piece,0,0,turned))setPiece({...piece,shape:turned});audio.play("tap")},[audio,board,phase,piece]);
  const hardDrop=useCallback(()=>{if(phase!=="playing")return;let y=piece.y;while(!hit(board,{...piece,y},0,1))y++;setScore(v=>v+Math.max(0,y-piece.y)*2);lock({...piece,y})},[board,lock,phase,piece]);
  useEffect(()=>{if(phase!=="playing")return;const id=window.setInterval(drop,Math.max(155,620-lines*14));return()=>window.clearInterval(id)},[drop,lines,phase]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp"," "].includes(e.key))e.preventDefault();if(e.key==="ArrowLeft")move(-1);if(e.key==="ArrowRight")move(1);if(e.key==="ArrowDown")drop();if(e.key==="ArrowUp")spin();if(e.key===" ")hardDrop();if(e.key==="Enter"&&phase!=="playing")restart()};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[drop,hardDrop,move,phase,restart,spin]);
  const cells=useMemo(()=>{const view=board.map(row=>[...row]);let ghostY=piece.y;if(phase==="playing"){while(!hit(board,{...piece,y:ghostY},0,1))ghostY++;piece.shape.forEach((row,y)=>row.forEach((v,x)=>{const yy=ghostY+y;if(v&&yy>=0&&!view[yy][piece.x+x])view[yy][piece.x+x]=`${piece.color}44`}));piece.shape.forEach((row,y)=>row.forEach((v,x)=>{const yy=piece.y+y;if(v&&yy>=0)view[yy][piece.x+x]=piece.color}))}return view.flat()},[board,phase,piece]);
  const controls=<><button onClick={()=>move(-1)} aria-label="Move left">←</button><button onClick={spin} aria-label="Rotate">↻</button><button onClick={drop} aria-label="Move down">↓</button><button onClick={()=>move(1)} aria-label="Move right">→</button><button onClick={hardDrop} aria-label="Hard drop">DROP</button></>;
  return <ClassicFrame number="007" title="Sector Drop" subtitle="Cargo formations are falling through a damaged orbital lift." accent="#62e8ff" score={score} best={best} status={`${lines} lines cleared · gravity ${Math.floor(lines/5)+1}`} sound={audio.enabled} onSound={audio.toggle} onRestart={restart} objective="Rotate and stack cargo to complete horizontal launch rows before the lift fills." instructions={["Move with ← → and descend with ↓.","Rotate with ↑. Space performs a hard drop.","Clear several rows together for a larger score."]} controls={controls}>
    <div className={`${classic.boardWrap} ${styles.well}`}><span className={styles.scan}/><span className={styles.next}>NEXT · {next.shape.length}×{next.shape[0].length}</span><span className={styles.surge}>GRAVITY {Math.floor(lines/5)+1}</span>{cells.map((color,i)=><i key={i} className={`${styles.cell} ${color?styles.filled:""}`} style={color?{"--block":color} as React.CSSProperties:undefined}/>)}{phase!=="playing"&&<div className={classic.overlay}><div><span>{phase==="over"?"LIFT OVERLOADED":"ORBITAL LIFT 07"}</span><h2>{phase==="over"?"Cargo lost.":"Stack the impossible."}</h2><p>Complete full rows. Keep the launch grid open. Gravity accelerates every five lines.</p><button onClick={restart}>{phase==="over"?"TRY AGAIN":"BEGIN DROP"}</button></div></div>}</div>
  </ClassicFrame>;
}
