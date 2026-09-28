/** The game's whole colour vocabulary. Swap these to re-skin the room. */
export const PALETTE = {
  wall: '#3b2f4a',
  wallLight: '#4a3b5c',
  wallTrim: '#2a2135',
  skirting: '#241b2e',

  floor: '#6b4a3a',
  floorDark: '#573c2f',
  floorSeam: '#49332a',

  wood: '#8a5a3b',
  woodDark: '#5e3a26',
  woodLight: '#b07d52',

  cloth: '#c05a6e',
  clothDark: '#8e3c50',
  cream: '#f2e2c4',
  creamDark: '#cbb392',

  white: '#ffffff',
  black: '#1a1220',
  shadow: '#221a2c',

  skin: '#f5cfa8',
  skinShade: '#dfae85',
  hair: '#4a3122',
  hairLight: '#63432e',
  shirt: '#4aa3c0',
  shirtDark: '#2f7a94',
  pants: '#3a4a7a',

  leaf: '#4a9a5a',
  leafDark: '#2f6e3e',

  // Almendra: a warm brownish gold, not a metallic one.
  dog: '#b8823c',
  dogDark: '#8a5a26',
  dogLight: '#d2a15a',

  glass: '#7fb6a4',
  glassDark: '#4d8271',

  gold: '#f0c040',
  goldDark: '#c08a1e',
  night: '#1b2a4a',
  star: '#fff6c0',
  glow: '#f8d878',
};

/** Numeric versions, for tints and Phaser colour arguments. */
export const HEX = Object.fromEntries(
  Object.entries(PALETTE).map(([name, value]) => [name, Number.parseInt(value.slice(1), 16)]),
);
