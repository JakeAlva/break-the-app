# Break the App

A four-case browser puzzle game from Fairbyte Labs. Players find loopholes in ordinary interfaces—no developer tools or outside scripts required.

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
