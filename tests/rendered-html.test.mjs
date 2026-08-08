import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const output = new URL("../out/index.html", import.meta.url);

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
