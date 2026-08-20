# Pop-Tart Punk: Sewer Skater

A silly early-internet, Macromedia Flash-inspired arcade web game where a heroic snack jumps through Cybertown's sewer skyline, collects bagels, dodges cursed ad booths, and spends loot on questionable upgrades.

## Architecture

This repository is a dependency-free static web app:

- **`index.html`** lays out the arcade canvas, visual-novel panel, score readouts, and upgrade shop.
- **`src/main.js`** contains the complete game engine: input, physics, collision checks, scrolling platform generation, collectibles, hazards, Web Audio bleeps, LocalStorage saves, story panel state, and shop purchases.
- **`src/styles.css`** provides the Newgrounds/Flash-inspired shell with loud gradients, chunky buttons, marquee text, blinking status copy, and responsive layout.
- **`scripts/validate.mjs`** is a lightweight build check that verifies key files are present and that the JavaScript parses.

The app uses the browser's built-in **Canvas 2D API** for rendering and **Web Audio API** for arcade bleeps. This keeps the game portable, fast to host, and free from runtime package licensing obligations while remaining easy to evolve into a Phaser, PixiJS, or Three.js version later.

## Library investigation and licensing

Current permissive-use candidates were researched before implementation:

- **Phaser 3**: MIT licensed, commercial-use friendly, and excellent for production 2D arcade games with scenes, input, physics, scaling, Canvas/WebGL rendering, and asset pipelines.
- **Vite**: MIT licensed, free/open-source frontend tooling that would be ideal once the project needs bundling, hot module reload, TypeScript, or asset optimization.
- **Howler.js**: MIT licensed audio helper with a simple cross-browser API for Web Audio/HTML5 Audio.
- **Zustand**: MIT licensed state management that would be useful if the UI grows into a larger React app.

For this first complete playable version, the dependency-free Canvas approach was chosen because it delivers the requested game loop and aesthetic immediately, works as static files, has no install barrier, and avoids network/package-registry fragility. The code is structured so a future Phaser migration can map naturally: the reset/update/draw loop becomes scenes, arrays become physics groups, and generated drawing routines become sprite textures.

## How to run

```bash
npm run dev
```

Then open <http://localhost:5173>. You can also open `index.html` directly in a browser.

To run the validation check:

```bash
npm run build
```

## How to play

1. Press **Space**, click, or tap to flap-jump.
2. Use **Left/Right** arrows or **A/D** to steer.
3. Land on green platforms to bounce upward and keep the run alive.
4. Collect bagels. Fresh run bagels are auto-deposited every 10 bagels, can be force-saved, and are deposited when the run ends.
5. Avoid purple **AD!** booths. Grab rainbow power-ups for bonus bagels or a one-hit shield.
4. Collect bagels. Fresh run bagels are deposited into your wallet when the run ends.
5. Avoid purple **AD!** booths. They are legally distinct from malware, but emotionally identical.
6. Beat your high score, buy upgrades, then make one more run because surely this time Todd.exe goes down.

## Upgrade strategy for beginners

- Buy **Jump Springs** early if you keep missing platforms. More vertical power gives you more recovery time.
- Buy **Crumb Magnet** if you can survive but miss collectibles. It pulls nearby bagels toward you.
- Watch the **Bagel Memory Card**. It shows your saved wallet from LocalStorage, which is what the shop spends.
- Buy **Cursed Outfits** only when you are spiritually ready. They are cosmetic and very important to morale.
- Use short taps/clicks to recover, and start steering before you need to land; the sewer waits for nobody.

## Development guide

Important files:

- `src/main.js`
  - Save model: `save` and `persist()`.
  - Game state: the `state` object.
  - Gameplay: `reset()`, `spawnChunk()`, `jump()`, `depositBagels()`, `gameOver()`, `update()`, and `draw()`.
  - Gameplay: `reset()`, `spawnPlatform()`, `jump()`, `gameOver()`, `update()`, and `draw()`.
  - UI/shop glue: `syncUi()` and `buy()`.
- `src/styles.css`
  - Layout, panels, responsive rules, marquee, buttons, and retro animations.
- `index.html`
  - Static DOM nodes used by the game and UI.

### Game loop composition

1. `reset()` seeds a fresh run and rotates into a biome based on the saved run count.
2. `spawnChunk()` continuously adds randomized platforms, bagels, hazards, and power-ups ahead of the player.
3. `update()` applies gravity, horizontal input, platform collision, camera push, item magnetism, power-up effects, hazard collision, scoring, biome rotation, and object recycling.
4. `draw()` clears the canvas and paints animated backgrounds, platforms, bagels, power-ups, ad booths, shield effects, the hero, HUD, and game-over text.
5. `requestAnimationFrame(update)` keeps the loop smooth and continuous.
6. LocalStorage persists high score, bagel wallet, run count, outfit, and upgrade levels.
1. `reset()` seeds the first platform field and restores player run state.
2. `update()` applies gravity, horizontal input, platform collision, camera push, item magnetism, hazard collision, scoring, and object recycling.
3. `draw()` clears the canvas and paints stars, platforms, bagels, ad booths, the hero, HUD, and game-over text.
4. `requestAnimationFrame(update)` keeps the loop smooth.
5. LocalStorage persists high score, bagel wallet, outfit, and upgrade levels.

### Future steps

- Add a title screen, pause menu, and mute toggle.
- Replace generated canvas sprites with a dedicated sprite atlas.
- Add score-gated story branches and boss encounters with Todd.exe.
- Add power-ups such as temporary invincibility, double jump, and slow-motion dial-up mode.
- Add a Vite build when bundling, cache busting, TypeScript, or PWA support becomes necessary.

## Latest gameplay improvements

- Added a more polished arcade-cabinet page with animated marquee, scanlines, meters, bank card, and more colorful canvas backgrounds.
- Added a visible **Bagel Memory Card** and force-save button so players can clearly see and preserve spendable bagels.
- Added a continuous randomized chunk spawner with rotating biomes, moving platform drift, power-ups, shields, bonus bagels, combo scoring, and endlessly recycled obstacles.
