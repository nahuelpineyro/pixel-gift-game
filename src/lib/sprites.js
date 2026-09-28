import { PALETTE as C } from './palette.js';
import { paint } from './painter.js';
import { PLAYER_FRAMES, PLAYER_PALETTE, PLAYER_W, PLAYER_H } from './characterArt.js';

export const ROOM_W = 320;
export const ROOM_H = 180;
export const WALL_H = 48;

/** Paints the player's six frames and registers the walk animations. */
function createPlayer(scene) {
  Object.entries(PLAYER_FRAMES).forEach(([key, rows]) => {
    paint(scene, `player-${key}`, PLAYER_W, PLAYER_H, (b) => b.map(0, 0, rows, PLAYER_PALETTE));
  });
}

/** The interior: back wall, skirting board and floorboards. */
function createRoomBackground(scene) {
  paint(scene, 'room-bg', ROOM_W, ROOM_H, (b) => {
    b.fill(C.wall);

    // Vertical wallpaper stripes.
    for (let x = 0; x < ROOM_W; x += 8) b.rect(x, 0, 4, WALL_H, C.wallLight);

    b.rect(0, WALL_H - 5, ROOM_W, 3, C.wallTrim);
    b.rect(0, WALL_H - 2, ROOM_W, 2, C.skirting);

    b.rect(0, WALL_H, ROOM_W, ROOM_H - WALL_H, C.floor);
    for (let y = WALL_H + 9; y < ROOM_H; y += 10) b.hline(0, y, ROOM_W, C.floorSeam);
    for (let y = WALL_H; y < ROOM_H; y += 20) b.rect(0, y, ROOM_W, 1, C.floorDark);

    // Light spilling in from the window. Deliberately never solid: a filled
    // shape at this size reads as a ramp on the floor rather than as light.
    // Density falls off with distance, which is all the gradient pixel art gets.
    const LIGHT = '#77543f';
    for (let i = 0; i < 38; i += 1) {
      const y = WALL_H + i;
      const spread = 17 + Math.floor(i * 0.5);
      const fade = 1 - i / 38;
      for (let x = 84 - spread; x < 84 + spread; x += 1) {
        const edge = 1 - Math.abs(x - 84) / spread;
        // A fixed 4x4 Bayer-style threshold keeps the dots from clumping.
        const threshold = ((x % 4) * 4 + (y % 4)) / 16;
        if (edge * fade > threshold) b.dot(x, y, LIGHT);
      }
    }
  });
}

/** The balcony at night: sky, stars, railing and rooftops. */
function createBalconyBackground(scene) {
  paint(scene, 'balcony-bg', ROOM_W, ROOM_H, (b) => {
    // Sky gradient, banded so it stays readable as pixel art.
    const bands = ['#0d1530', '#122040', '#17284e', '#1b2f5c'];
    bands.forEach((color, i) => b.rect(0, i * 26, ROOM_W, 26, color));
    b.rect(0, 104, ROOM_W, 20, '#20355f');

    // Rooftops on the horizon.
    const roofs = [[6, 96, 34, 30], [46, 104, 22, 22], [74, 92, 40, 34], [120, 102, 26, 24],
      [176, 98, 30, 28], [212, 106, 24, 20], [242, 94, 36, 32], [284, 104, 30, 22]];
    roofs.forEach(([x, y, w, h]) => {
      b.rect(x, y, w, h, '#141c33');
      for (let wy = y + 4; wy < y + h - 3; wy += 7) {
        for (let wx = x + 3; wx < x + w - 3; wx += 6) {
          if ((wx + wy) % 3 !== 0) b.rect(wx, wy, 2, 3, C.glow);
        }
      }
    });

    b.rect(0, 124, ROOM_W, ROOM_H - 124, '#2a2038');
    for (let y = 132; y < ROOM_H; y += 11) b.hline(0, y, ROOM_W, '#221a2e');

    // Railing.
    b.rect(0, 120, ROOM_W, 3, '#3a3048');
    for (let x = 4; x < ROOM_W; x += 10) b.rect(x, 123, 2, 12, '#3a3048');
    b.rect(0, 134, ROOM_W, 2, '#3a3048');
  });
}

/** Props. Each is drawn with its own small palette so it reads at 320x180. */
function createProps(scene) {
  paint(scene, 'prop-window', 40, 30, (b) => {
    b.rect(0, 0, 40, 30, C.woodDark);
    b.rect(2, 2, 36, 26, C.night);
    // Night sky behind the glass.
    [[6, 6], [14, 11], [24, 5], [31, 14], [10, 20], [28, 22], [19, 17]].forEach(([x, y]) => b.dot(x, y, C.star));
    b.rect(26, 6, 6, 6, C.glow);
    b.dot(25, 5, C.glow);
    b.vline(19, 2, 26, C.woodDark);
    b.hline(2, 14, 36, C.woodDark);
    b.rect(0, 28, 40, 2, C.wood);
  });

  paint(scene, 'prop-photo', 24, 20, (b) => {
    b.rect(0, 0, 24, 20, C.gold);
    b.rect(2, 2, 20, 16, C.cream);
    // Two little figures side by side.
    b.rect(7, 8, 4, 8, C.shirt);
    b.rect(7, 5, 4, 3, C.hair);
    b.rect(13, 8, 4, 8, C.cloth);
    b.rect(13, 5, 4, 3, C.woodDark);
    b.dot(11, 7, C.cloth);
    b.dot(12, 6, C.cloth);
  });

  paint(scene, 'prop-shelf', 40, 56, (b) => {
    b.rect(0, 0, 40, 56, C.woodDark);
    b.rect(2, 2, 36, 52, C.wood);
    [4, 20, 36].forEach((y) => b.rect(2, y + 10, 36, 2, C.woodDark));
    const books = [C.cloth, C.shirt, C.leaf, C.gold, C.creamDark, C.clothDark];
    [4, 20, 36].forEach((shelfY, row) => {
      let x = 5;
      while (x < 34) {
        const w = 2 + ((x + row) % 3);
        b.rect(x, shelfY + 2, w, 8, books[(x + row) % books.length]);
        x += w + 1;
      }
    });
  });

  paint(scene, 'prop-bed', 52, 62, (b) => {
    b.rect(0, 0, 52, 7, C.woodDark);      // headboard
    b.rect(2, 1, 48, 4, C.wood);
    for (let x = 6; x < 46; x += 6) b.rect(x, 1, 2, 4, C.woodDark);

    b.rect(2, 7, 48, 53, C.woodDark);     // frame
    b.rect(4, 9, 44, 49, C.cream);        // mattress

    b.rect(8, 11, 36, 12, C.white);       // pillow
    b.outline(8, 11, 36, 12, C.creamDark);

    b.rect(4, 25, 44, 33, C.cloth);       // blanket
    b.rect(4, 25, 44, 4, C.cream);        // turned-down edge
    b.hline(4, 29, 44, C.clothDark);
    for (let y = 34; y < 56; y += 7) b.hline(7, y, 38, C.clothDark);
    b.rect(0, 58, 52, 4, C.woodDark);     // footboard
  });

  paint(scene, 'prop-desk', 46, 28, (b) => {
    b.rect(0, 0, 46, 6, C.woodLight);
    b.rect(0, 5, 46, 2, C.woodDark);
    b.rect(3, 7, 6, 21, C.wood);
    b.rect(37, 7, 6, 21, C.wood);
    b.rect(12, 8, 22, 12, C.woodDark);
    b.rect(13, 9, 20, 10, C.wood);
    b.dot(23, 14, C.gold);
  });

  paint(scene, 'prop-mug', 9, 9, (b) => {
    b.rect(1, 2, 6, 7, C.cream);
    b.rect(2, 3, 4, 5, C.white);
    b.rect(7, 4, 2, 3, C.cream);
    b.rect(2, 1, 4, 1, C.woodDark);
    b.dot(3, 0, C.creamDark);
  });

  paint(scene, 'prop-guitar', 14, 36, (b) => {
    b.rect(6, 0, 3, 18, C.woodDark);       // neck
    b.rect(5, 0, 5, 3, C.black);           // head
    b.rect(3, 17, 9, 10, C.woodLight);     // upper body
    b.rect(2, 22, 11, 13, C.woodLight);    // lower body
    b.outline(2, 17, 11, 18, C.woodDark);
    b.rect(6, 25, 3, 3, C.black);          // sound hole
    b.vline(7, 3, 22, C.cream);
  });

  paint(scene, 'prop-plant', 18, 26, (b) => {
    b.rect(5, 18, 8, 8, C.wood);
    b.rect(4, 17, 10, 2, C.woodLight);
    b.rect(8, 8, 2, 10, C.leafDark);
    [[3, 10], [11, 9], [5, 5], [10, 4], [7, 2]].forEach(([x, y]) => {
      b.rect(x, y, 5, 4, C.leaf);
      b.rect(x + 1, y + 1, 3, 2, C.leafDark);
    });
  });

  paint(scene, 'prop-rug', 56, 30, (b) => {
    // Oval body, drawn as tapered rows so it does not read as a mattress.
    const rows = [4, 2, 1, 0, 0, 0, 1, 2, 4];
    rows.forEach((inset, i) => {
      const y = 4 + i * 3;
      b.rect(4 + inset, y, 48 - inset * 2, 3, C.clothDark);
      b.rect(6 + inset, y, 44 - inset * 2, 3, C.cloth);
    });
    b.outline(12, 9, 32, 13, C.creamDark);
    b.rect(24, 13, 8, 5, C.creamDark);
    // Fringe along the short edges.
    for (let y = 6; y < 26; y += 3) {
      b.rect(1, y, 3, 1, C.creamDark);
      b.rect(52, y, 3, 1, C.creamDark);
    }
  });

  paint(scene, 'prop-door', 30, 46, (b) => {
    b.rect(0, 0, 30, 46, C.woodDark);
    b.rect(2, 2, 26, 44, C.wood);
    b.outline(5, 5, 20, 16, C.woodDark);
    b.outline(5, 25, 20, 18, C.woodDark);
    b.rect(23, 24, 3, 3, C.gold);
  });

  // The lock overlay shown on the door until every memory is found.
  paint(scene, 'prop-lock', 12, 14, (b) => {
    b.rect(3, 0, 6, 7, C.goldDark);
    b.rect(4, 2, 4, 5, C.wall);
    b.rect(1, 6, 10, 8, C.gold);
    b.rect(5, 9, 2, 3, C.goldDark);
  });

  paint(scene, 'prop-gift', 26, 26, (b) => {
    b.rect(2, 8, 22, 18, C.cloth);
    b.rect(2, 8, 22, 3, C.clothDark);
    b.rect(10, 8, 6, 18, C.gold);          // ribbon
    b.rect(2, 15, 22, 3, C.gold);
    b.rect(8, 2, 5, 6, C.gold);            // bow
    b.rect(13, 2, 5, 6, C.gold);
    b.rect(11, 4, 4, 4, C.goldDark);
    b.outline(2, 8, 22, 18, C.clothDark);
  });

  paint(scene, 'prop-heart', 9, 8, (b) => {
    b.map(0, 0, [
      '.##...##.',
      '####.####',
      '#########',
      '#########',
      '.#######.',
      '..#####..',
      '...###...',
      '....#....',
    ], { '#': C.cloth });
    b.dot(2, 2, C.white);
    b.dot(3, 1, C.white);
  });

  // Floating marker above whatever the player can interact with.
  // Painted white on purpose: scenes tint it, and multiply on gold muddies it.
  paint(scene, 'prop-marker', 7, 9, (b) => {
    b.rect(2, 0, 3, 5, C.white);
    b.rect(2, 6, 3, 3, C.white);
    b.dot(1, 1, C.white);
  });

  paint(scene, 'prop-star', 3, 3, (b) => {
    b.dot(1, 0, C.star);
    b.rect(0, 1, 3, 1, C.star);
    b.dot(1, 2, C.star);
  });

  paint(scene, 'prop-sparkle', 2, 2, (b) => b.fill(C.glow));
}

/** Touch controls: joystick ring, knob and action button. */
function createControls(scene) {
  // A ring, not a disc: a filled circle this size hides the room on a phone.
  paint(scene, 'ui-stick-base', 46, 46, (b) => {
    b.circle(23, 23, 22, C.black);
    b.punch(23, 23, 20);
    b.circle(23, 23, 20, C.cream);
    b.punch(23, 23, 18);
    // Cardinal nubs, so the neutral centre is still readable.
    b.rect(22, 2, 2, 4, C.cream);
    b.rect(22, 40, 2, 4, C.cream);
    b.rect(2, 22, 4, 2, C.cream);
    b.rect(40, 22, 4, 2, C.cream);
  });

  paint(scene, 'ui-stick-knob', 20, 20, (b) => {
    b.circle(10, 10, 9, C.black);
    b.circle(10, 10, 8, C.cream);
    b.circle(10, 10, 5, C.creamDark);
  });

  paint(scene, 'ui-button', 30, 30, (b) => {
    b.circle(15, 15, 14, C.cream);
    b.circle(15, 15, 12, C.clothDark);
    b.circle(15, 15, 10, C.cloth);
    // A heart, so the action button reads as "look at this" rather than "A".
    b.map(11, 11, [
      '.#...#.',
      '#######',
      '#######',
      '.#####.',
      '..###..',
      '...#...',
    ], { '#': C.cream });
  });
}

/** Paints every texture the game needs. Called once, from BootScene. */
export function createAllTextures(scene) {
  createPlayer(scene);
  createRoomBackground(scene);
  createBalconyBackground(scene);
  createProps(scene);
  createControls(scene);
}
