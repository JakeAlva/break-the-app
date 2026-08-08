# Break the App

A four-case browser puzzle game from Fairbyte Labs. Players find loopholes in ordinary interfaces—no developer tools or outside scripts required.

The game includes a synthesized cyber-interface soundscape for controls, hints, rejected attempts, case clears, and campaign completion. Sounds require no media assets and can be muted from the header; the preference is remembered locally.

## Fairbyte Arcade routes

- `/` and `/arcade/` — the Fairbyte Arcade catalog and 100 Game Project hub
- `/games/break-the-app/` — Break the App, the original four-case interface puzzle
- `/games/2-17-am/` — 2:17 AM, a turn-based emergency-dispatch strategy game
- `/games/alibi-file/` — Alibi File, a three-case deduction game
- `/games/sixty-second-ceo/` — Sixty-Second CEO, a one-minute business strategy game
- `/games/signal-lost/` — Signal Lost, an audio-tuning mystery
- `/games/room-404/` — Room 404, a fake-desktop escape game

## How to play

1. Read the mission for the current case.
2. Use the simulated app like a normal customer.
3. Try unusual action sequences before the move counter reaches zero.
4. Watch the attempt log for clues about what the system remembered.
5. Complete the objective to unlock the next case.

## Local development

```bash
npm install
npm run dev
```

## Production

```bash
npm run lint
npm test
```

The production build is a static export in `out/`. Netlify settings are included in `netlify.toml`.
