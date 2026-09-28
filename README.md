# Pixel Gift Game

A short pixel-art adventure for one person, played in a browser on a phone or a
laptop. She walks around a room, finds five objects that each hold a memory, the
door unlocks, and the ending waits on the balcony.

Roughly five minutes to play. Built with Phaser 4 and Vite.

---

## The only file you need to edit

**`src/config/gift.js`**

Every word she reads is in that one file: her name, the five memories, the
flavour text on the other props, and the closing letter. Change the strings and
the game is yours. Nothing else has to be touched.

```js
herName: 'MI AMOR',              // who it is for
memories: [ { id: 'photo', name: 'LA FOTO', lines: [ '...' ] }, ... ],
letter: [ 'NO SÉ HACER JUEGOS.', ... ],
```

Writing rules the text renderer enforces:

- Everything is drawn in **uppercase** with a hand-made 5x7 bitmap font.
- Supported characters: `A-Z 0-9 . , ! ? ¿ ¡ ' " - _ : ; ( ) + * / = < > % & @ #`
  plus `Á É Í Ó Ú Ñ Ü` and the `♥` and `★` symbols.
- Anything else becomes `?`, so no emoji.
- `\n` forces a line break. Without one, lines wrap on their own.
- Each string in a `lines` array is **one dialogue box**. Keep them to two lines.

Keep exactly five memories unless you also edit `INTERACTABLES` in
`src/scenes/RoomScene.js`, which is where each object's position lives.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:5173
```

Controls: arrow keys or WASD to walk, Space/Enter/E to interact. On a phone,
drag anywhere on the left half to move and tap the heart button on the right to
interact. While a dialogue is open, a tap anywhere advances it.

### Testing on a real iPhone

The dev server already listens on the network:

```bash
npm run dev
```

Open the `Network:` address it prints on the phone, on the same Wi-Fi. This is
worth doing before you send it: touch and audio behave differently on iOS than
in a desktop browser.

---

## Publishing it privately on itch.io

```bash
npm run zip          # builds and writes pixel-gift-game.zip
```

The zip has `index.html` at its root, which is what itch.io requires.

1. Create a new project, set **Kind of project** to **HTML**.
2. Upload the zip and tick *This file will be played in the browser*.
3. Embed options: **1280 x 720**, plus **Mobile friendly** and **Fullscreen button**.
4. Set **Visibility** to **Restricted** and give it a password.
5. Send her the link with the password already in it:
   `https://<user>.itch.io/<game>?password=<password>`

---

## How it is built

There are **no asset files**. Every sprite, the background, the font, the UI and
the sound effects are generated in code when the game boots. That is a deliberate
choice: a build with no images and no audio to fetch cannot break by 404 after it
is uploaded, and the whole thing stays one bundle.

```
src/
  config/gift.js        all of the text — the file you edit
  lib/
    palette.js          every colour in the game
    painter.js          canvas drawing helpers -> Phaser textures
    pixelFont.js        the 5x7 font, drawn by hand
    characterArt.js     the player's six frames
    sprites.js          the room, the balcony and every prop
    sfx.js              Web Audio blips, synthesised
    save.js             localStorage progress
  ui/
    PixelText.js        bitmap text as a container of glyph images
    DialogueBox.js      the typewriter text box
    Controls.js         keyboard and touch merged into one input
  scenes/
    BootScene.js        builds every texture, then leaves
    TitleScene.js       the tap that unlocks audio on iOS
    RoomScene.js        the room, the five memories, the locked door
    BalconyScene.js     the ending
```

### Swapping in your own art

Draw over it in Aseprite whenever you like. Load a PNG in `BootScene` under the
same texture key (`prop-bed`, `player-down-0`, ...) instead of calling `paint()`,
and everything else keeps working. The player is 12x16; prop sizes are in
`src/lib/sprites.js`.

### Notes that cost time to discover

- `roundPixels` defaults to `false` in Phaser 4 (it was `true` in v3).
  `pixelArt: true` sets both it and `antialias` correctly, so use that.
- `TextureManager.generate` was removed in Phaser 4. Textures here are built as
  plain canvases and registered with `textures.addCanvas`.
- Import `Phaser` in every module that uses it. Assigning `window.Phaser` in
  `main.js` is too late: scene classes are evaluated when they are imported.
- The container div's id is `game`, so `window.game` is the **div**. The debug
  handle is `window.giftGame`.
- iOS keeps audio suspended until a real user gesture, which is what the title
  screen's tap is for.
- Phaser tracks one pointer by default. Moving and pressing at the same time
  needs `input.addPointer(2)`.

### Debugging

`giftGame` is on `window`:

```js
giftGame.scene.getScene('Room').found          // memories collected so far
giftGame.scene.start('Balcony')                // jump to the ending
localStorage.removeItem('pixel-gift-save-v1')  // play it again from the start
```

On the title screen, a long press on a finished save also starts over.
