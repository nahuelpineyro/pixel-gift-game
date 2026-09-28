import Phaser from 'phaser';
import { createAllTextures } from '../lib/sprites.js';
import { createFontTextures } from '../ui/PixelText.js';

/**
 * Builds every texture, then hands off to the title screen. Nothing is loaded
 * over the network, so this scene finishes within a frame.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    createFontTextures(this);
    createAllTextures(this);
    this.#createPlayerAnimations();
    this.#createAlmendraAnimation();
    this.scene.start('Title');
  }

  /** Almendra's tail never stops. */
  #createAlmendraAnimation() {
    this.anims.create({
      key: 'almendra-wag',
      frames: [{ key: 'prop-almendra-0' }, { key: 'prop-almendra-1' }],
      frameRate: 3,
      repeat: -1,
    });
  }

  #createPlayerAnimations() {
    ['down', 'up', 'side'].forEach((facing) => {
      this.anims.create({
        key: `walk-${facing}`,
        frames: [{ key: `player-${facing}-0` }, { key: `player-${facing}-1` }],
        frameRate: 7,
        repeat: -1,
      });
      this.anims.create({
        key: `idle-${facing}`,
        frames: [{ key: `player-${facing}-0` }],
        frameRate: 1,
      });
    });
  }
}
