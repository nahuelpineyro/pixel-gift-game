import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import TitleScene from './scenes/TitleScene.js';
import RoomScene from './scenes/RoomScene.js';
import BalconyScene from './scenes/BalconyScene.js';

/**
 * 320x180 is a 16:9 base that scales to 1920x1080 at exactly 6x, so the pixel
 * grid stays whole on a laptop and on a phone. `pixelArt: true` turns off
 * smoothing and turns on roundPixels, which Phaser 4 no longer defaults to.
 */
const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 320,
  height: 180,
  pixelArt: true,
  backgroundColor: '#12101c',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, RoomScene, BalconyScene],
};

// Exposed for debugging: `giftGame.scene.getScene('Room')` in the console is
// the quickest way to check progress while editing. Deliberately not called
// `game`, because the container div's id already claims `window.game`.
window.giftGame = new Phaser.Game(config);
