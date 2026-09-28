import { PALETTE } from './palette.js';

/**
 * The player sprite: 12x16, three facings (the side view is mirrored for
 * left) and two walk frames each. Long dark hair falling past the shoulders.
 */
export const PLAYER_W = 12;
export const PLAYER_H = 16;

export const PLAYER_PALETTE = {
  h: PALETTE.hair,
  l: PALETTE.hairLight,
  s: PALETTE.skin,
  k: PALETTE.skinShade,
  e: PALETTE.black,
  t: PALETTE.shirt,
  d: PALETTE.shirtDark,
  p: PALETTE.pants,
  b: PALETTE.black,
};

const DOWN_HEAD = [
  '...hhhhhh...',
  '..llhhhhll..',
  '.hhsssssshh.',
  '.hhsesseshh.',
  '.hhsskksshh.',
  '.hh.ssss.hh.',
];

const UP_HEAD = [
  '...hhhhhh...',
  '..llhhhhll..',
  '.hhhhhhhhhh.',
  '.hhhhhhhhhh.',
  '.hhhhhhhhhh.',
  '.hhhhhhhhhh.',
];

const SIDE_HEAD = [
  '...hhhhh....',
  '..lhhhhhh...',
  '..hhsssss...',
  '..hhssess...',
  '..hhsskss...',
  '..hhssss....',
];

// The hair carries on down past the shoulders for two more rows: at 12px wide
// it is the only silhouette cue that reads reliably.
const FRONT_BODY = [
  '.hhtttttthh.',
  '.hhtttttthh.',
  '.shtttttths.',
  '.stddddddts.',
  '..tttttttt..',
  '..pppppppp..',
];

const SIDE_BODY = [
  '..hhtttttt..',
  '..hhtttttd..',
  '..hhttttts..',
  '...ttddtt...',
  '...tttttt...',
  '...pppppp...',
];

const FRONT_LEGS_A = ['..ppp..ppp..', '..ppp..ppp..', '..bbb..bbb..', '............'];
const FRONT_LEGS_B = ['..pppppppp..', '..ppp...ppp.', '.bbbb...bbb.', '............'];
const SIDE_LEGS_A = ['...ppp.ppp..', '...ppp.ppp..', '..bbb..bbb..', '............'];
const SIDE_LEGS_B = ['...pppppp...', '..ppp...pp..', '.bbb....bbb.', '............'];

/** Keyed by `${facing}-${frame}` — the same keys the animations use. */
export const PLAYER_FRAMES = {
  'down-0': [...DOWN_HEAD, ...FRONT_BODY, ...FRONT_LEGS_A],
  'down-1': [...DOWN_HEAD, ...FRONT_BODY, ...FRONT_LEGS_B],
  'up-0': [...UP_HEAD, ...FRONT_BODY, ...FRONT_LEGS_A],
  'up-1': [...UP_HEAD, ...FRONT_BODY, ...FRONT_LEGS_B],
  'side-0': [...SIDE_HEAD, ...SIDE_BODY, ...SIDE_LEGS_A],
  'side-1': [...SIDE_HEAD, ...SIDE_BODY, ...SIDE_LEGS_B],
};
