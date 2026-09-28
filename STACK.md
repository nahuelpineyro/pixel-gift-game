# Pixel Art Gift Game: Stack and Setup

**Goal:** a short pixel-art game, built as a web app, played in the browser on a Mac or an iPhone through a private link. No app store publishing.

**Estimate:** 1–2 weeks full-time (roughly 4x that at ~10 h/week), using asset packs or simple self-made art.

---

## 1. Tools to install

| Purpose | Tool | Cost | Notes |
| :--- | :--- | :--- | :--- |
| JS runtime | [Node.js](https://nodejs.org) (current LTS) | Free | Includes `npm` |
| Code editor | [VS Code](https://code.visualstudio.com) | Free | |
| Version control | [Git](https://git-scm.com) + private GitHub repo | Free | Backup of the project |
| Game framework | [Phaser 4](https://phaser.io) | Free | Installed through the project template |
| Dev server / bundler | Vite | Free | Included in the Phaser template |
| Pixel art | [Aseprite](https://www.aseprite.org) | ~USD 20, one-time | Free alternatives: [LibreSprite](https://libresprite.github.io), [Piskel](https://www.piskelapp.com) (browser) |
| Tilemaps / levels | [Tiled](https://www.mapeditor.org) | Free | Export as JSON; Phaser loads it with `tilemapTiledJSON` |
| Sound effects | [jsfxr](https://sfxr.me) | Free | Browser tool, exports `.wav` |
| Music | [BeepBox](https://www.beepbox.co) | Free | Browser chiptune composer |
| Free assets | [Kenney.nl](https://kenney.nl/assets) (CC0), [itch.io assets](https://itch.io/game-assets/free) | Free | Check each license |
| Hosting | [itch.io](https://itch.io) | Free | Restricted page + password |

---

## 2. Create the project

```bash
node -v                          # confirm Node is installed
npm create @phaserjs/game@latest # pick a Vite-based template, JavaScript
cd <project-name>
npm install
npm run dev                      # opens the local dev server
```

---

## 3. Pixel-art game config

Use a low internal resolution and let Phaser scale it up without blurring:

```js
const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 180,          // 16:9, scales cleanly to 1920x1080 (x6)
  pixelArt: true,       // disables smoothing on textures
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [/* your scenes */],
};
```

Choose the orientation (landscape or portrait) on day 1. Changing it later means reworking every layout.

---

## 4. iPhone / Mac browser requirements

- **Touch first:** every action must work with taps or on-screen buttons. Do not require a keyboard.
- **Audio unlock:** iOS Safari blocks audio until the first user gesture. Start the game with a "Tap to start" screen.
- **Audio format:** export sounds as `.mp3` (plays in every browser, including Safari).
- **Save progress:** `localStorage` is enough.
- **Test on a real iPhone during development:**
  ```bash
  npm run dev -- --host
  ```
  Open `http://<PC-local-IP>:<port>` on the iPhone (same Wi-Fi network). Allow Node through the firewall if Windows asks.

---

## 5. Build and share privately

```bash
npm run build   # outputs the dist/ folder
```

1. Check that the Vite config uses `base: './'` (relative paths). Absolute paths break on itch.io.
2. Zip the **contents** of `dist/`, so `index.html` is at the root of the zip.
3. On itch.io: create a new project, set **Kind of project** to **HTML**, upload the zip, and check "This file will be played in the browser".
4. In the embed options, enable **Mobile friendly** and the **Fullscreen button**.
5. Set **Visibility** to **Restricted** and set a password.
6. Share the link with the password pre-filled: `https://<user>.itch.io/<game>?password=<password>`

---

## 6. Suggested one-week plan (full-time)

| Day | Focus |
| :--- | :--- |
| 1–2 | Core mechanic with placeholder rectangles, no art |
| 3–4 | Sprites, tiles, animations |
| 5 | Sound effects, music, title screen |
| 6 | Polish: screen shake, particles, transitions, final gift scene |
| 7 | Test on iPhone and Mac, build, upload to itch.io |

**Scope guardrails:** one mechanic, 5–10 minutes of play, and a personal ending scene. Add personal touches (inside jokes, a sprite of the recipient) instead of more features.

---

## 7. References

- Phaser getting started: https://docs.phaser.io/phaser/getting-started/installation
- Phaser examples: https://phaser.io/examples
- itch.io password-protected pages: https://itch.io/t/58582/how-can-i-password-protect-my-project-page

---

## Checklist

- [ ] Node LTS, VS Code, and Git installed
- [ ] Project created from the Phaser Vite template and `npm run dev` works
- [ ] `pixelArt: true` and scale mode configured
- [ ] Orientation decided
- [ ] Core mechanic playable with placeholders
- [ ] Art and audio integrated
- [ ] Tested on a real iPhone (touch controls and audio)
- [ ] Built with `base: './'` and uploaded to itch.io as restricted with a password
