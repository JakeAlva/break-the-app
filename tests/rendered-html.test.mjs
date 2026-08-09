import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../out/index.html", import.meta.url);
const arcadeOutput = new URL("../out/arcade.html", import.meta.url);
const dispatchOutput = new URL("../out/games/2-17-am.html", import.meta.url);
const breakOutput = new URL("../out/games/break-the-app.html", import.meta.url);
const alibiOutput = new URL("../out/games/alibi-file.html", import.meta.url);
const ceoOutput = new URL("../out/games/sixty-second-ceo.html", import.meta.url);
const signalOutput = new URL("../out/games/signal-lost.html", import.meta.url);
const roomOutput = new URL("../out/games/room-404.html", import.meta.url);
const sectorOutput = new URL("../out/games/sector-drop.html", import.meta.url);
const courierOutput = new URL("../out/games/star-courier.html", import.meta.url);
const paddleOutput = new URL("../out/games/pulse-paddle.html", import.meta.url);
const circuitOutput = new URL("../out/games/circuit-eater.html", import.meta.url);
const coilOutput = new URL("../out/games/coilfield.html", import.meta.url);
const depthOutputs = ["black-box-daily","salvage-vector","lumenhold","twofold-arena","ash-and-ink","faultline-pinball","while-you-slept"].map(slug=>new URL(`../out/games/${slug}.html`, import.meta.url));

test("exports the original Break the App game on its permanent route", async () => {
  const html = await readFile(breakOutput, "utf8");
  assert.match(html, /<title>Break the App — Find the loophole<\/title>/i);
  assert.match(html, /Break the App/i);
  assert.match(html, /How to play/i);
  assert.match(html, /Cart Collapse/i);
  assert.match(html, /Mute game sounds/i);
  assert.match(html, /SOUND ON/i);
  assert.doesNotMatch(html, /Starter Project|Building your site|react-loading-skeleton/i);
});

test("ships social and mobile metadata", async () => {
  const html = await readFile(output, "utf8");
  assert.match(html, /og:image/i);
  assert.match(html, /theme-color/i);
  assert.match(html, /width=device-width/i);
});

test("exports the Fairbyte Arcade catalog", async () => {
  const html = await readFile(arcadeOutput, "utf8");
  assert.match(html, /Fairbyte Arcade/i);
  assert.match(html, /2:17 AM/i);
  assert.match(html, /Break the App/i);
  assert.match(html, /100 GAME PROJECT/i);
  assert.match(html, /\/games\/2-17-am/i);
  assert.match(html, /\/games\/alibi-file/i);
  assert.match(html, /\/games\/sixty-second-ceo/i);
  assert.match(html, /\/games\/signal-lost/i);
  assert.match(html, /\/games\/room-404/i);
  assert.match(html, /18.*PLAYABLE GAMES/is);
  assert.match(html, /TODAY(?:'|&#x27;)S DAILY BYTE/i);
  assert.match(html, /Seven games built to keep/i);
  assert.match(html, /Classics, rebuilt our way/i);
  assert.match(html, /games\/sector-drop/i);
  assert.match(html, /games\/star-courier/i);
  assert.match(html, /games\/pulse-paddle/i);
  assert.match(html, /games\/circuit-eater/i);
  assert.match(html, /games\/coilfield/i);
});

test("serves the arcade catalog at the root domain", async () => {
  const html = await readFile(output, "utf8");
  assert.match(html, /Choose your next game/i);
  assert.match(html, /Seven games built to keep/i);
  assert.match(html, /Search the catalog/i);
});

test("exports all seven depth-drop games with real play systems", async () => {
  const pages=await Promise.all(depthOutputs.map(file=>readFile(file,"utf8")));
  const checks=[
    [/Black Box Daily/i,/SIX PROBES|six probes/i,/UNLIMITED PRACTICE/i],
    [/Salvage Vector/i,/five hostile sectors/i,/LAUNCH RUN/i],
    [/Lumenhold/i,/twelve escalating waves/i,/LIGHT THE BEACONS/i],
    [/Twofold Arena/i,/LOCAL 2P/i,/ENTER ARENA/i],
    [/Ash &amp; Ink|Ash & Ink/i,/nine encounters/i,/OPEN THE TOME/i],
    [/Faultline Pinball/i,/charged plunger/i,/TAP TO LAUNCH/i,/open gate above station 3/i,/START TABLE/i],
    [/While You Slept/i,/production continues/i,/Build the town/i],
  ];
  pages.forEach((html,index)=>checks[index].forEach(pattern=>assert.match(html,pattern)));
});

test("ships the QA fixes in the rendered games", async () => {
  const [daily,,lumen,arena,ash,pinball,kingdom]=await Promise.all(depthOutputs.map(file=>readFile(file,"utf8")));
  const courier=await readFile(courierOutput,"utf8");
  assert.doesNotMatch(daily,/DAILY #-\d+/i);
  assert.match(courier,/checkpoints activate/i);
  assert.match(ash,/blight/i);
  assert.match(lumen,/splitters/i);
  assert.match(arena,/SOLO WINS/i);
  assert.match(pinball,/THIRD = TILT/i);
  assert.match(kingdom,/FOOD/i);
  assert.match(kingdom,/WOOD/i);
  assert.match(kingdom,/GOLD/i);
  assert.match(kingdom,/LORE/i);
});

test("exports the complete 2:17 AM game route", async () => {
  const html = await readFile(dispatchOutput, "utf8");
  assert.match(html, /TAKE THE NIGHT DESK/i);
  assert.match(html, /Four response units/i);
  assert.match(html, /Fictional emergency-management strategy game/i);
  assert.match(html, /arcade\/2-17-am-cover\.jpg/i);
});

test("exports Alibi File as a complete deduction game", async () => {
  const html = await readFile(alibiOutput, "utf8");
  assert.match(html, /OPEN THE FIRST FILE/i);
  assert.match(html, /Every story works/i);
  assert.match(html, /alibi-file-cover\.jpg/i);
});

test("exports Sixty-Second CEO as a complete strategy game", async () => {
  const html = await readFile(ceoOutput, "utf8");
  assert.match(html, /TAKE THE CORNER OFFICE/i);
  assert.match(html, /Ten decisions/i);
  assert.match(html, /sixty-second-ceo-cover\.jpg/i);
});

test("exports Signal Lost as a complete audio mystery", async () => {
  const html = await readFile(signalOutput, "utf8");
  assert.match(html, /POWER THE RECEIVER/i);
  assert.match(html, /Five carriers/i);
  assert.match(html, /signal-lost-cover\.jpg/i);
});

test("exports Room 404 as a complete desktop escape game", async () => {
  const html = await readFile(roomOutput, "utf8");
  assert.match(html, /RESTORE GUEST SESSION/i);
  assert.match(html, /abandoned computer/i);
  assert.match(html, /room-404-cover\.jpg/i);
});

test("exports five playable re-coded classic routes", async () => {
  const pages = await Promise.all([sectorOutput,courierOutput,paddleOutput,circuitOutput,coilOutput].map(file=>readFile(file,"utf8")));
  const checks = [
    [/Sector Drop/i,/BEGIN DROP/i,/FAMILIAR RULES/i],
    [/Star Courier/i,/START DELIVERY/i,/PARCELS/i],
    [/Pulse Paddle/i,/SERVE PULSE/i,/first to 7/i],
    [/Circuit Eater/i,/ENTER CIRCUIT/i,/security drones/i],
    [/Coilfield/i,/CHARGE COIL/i,/EDGES CONNECT/i],
  ];
  pages.forEach((html,index)=>checks[index].forEach(pattern=>assert.match(html,pattern)));
});
