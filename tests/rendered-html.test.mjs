import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../out/index.html", import.meta.url);
const arcadeOutput = new URL("../out/arcade.html", import.meta.url);
const dispatchOutput = new URL("../out/games/2-17-am.html", import.meta.url);

test("exports a complete game landing page", async () => {
  const html = await readFile(output, "utf8");
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
  assert.match(html, /\/games\/2-17-am\//i);
});

test("exports the complete 2:17 AM game route", async () => {
  const html = await readFile(dispatchOutput, "utf8");
  assert.match(html, /TAKE THE NIGHT DESK/i);
  assert.match(html, /Four response units/i);
  assert.match(html, /Fictional emergency-management strategy game/i);
  assert.match(html, /arcade\/2-17-am-cover\.jpg/i);
});
