import Phaser from 'phaser';
import PixelText from '../ui/PixelText.js';
import { GIFT } from '../config/gift.js';
import { HEX } from '../lib/palette.js';
import { unlock, sfx } from '../lib/sfx.js';

/**
 * Title screen. Its real job is the audio unlock: iOS Safari keeps the audio
 * context suspended until a genuine user gesture, so the game cannot make a
 * sound before this screen is tapped.
 */
export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const { width, height } = this.scale.gameSize;

    this.add.image(0, 0, 'balcony-bg').setOrigin(0, 0);
    this.#addTwinklingStars();

    // Drawn at 2x, so the centring maths has to use the scaled width.
    const title = new PixelText(this, 0, 42, GIFT.title, { color: HEX.cream, align: 'center' });
    title.setScale(2).setPosition(Math.round((width - title.textWidth * 2) / 2), 42);

    const subtitle = new PixelText(this, 0, 70, GIFT.subtitle, { color: HEX.gold, align: 'center' });
    subtitle.setPosition(Math.round((width - subtitle.textWidth) / 2), 70);

    this.add.image(width / 2, 96, 'prop-heart').setScale(2);

    const prompt = new PixelText(this, 0, 150, GIFT.pressStart, { color: HEX.white, align: 'center' });
    prompt.setPosition(Math.round((width - prompt.textWidth) / 2), 150);

    this.tweens.add({ targets: prompt, alpha: 0.25, duration: 700, yoyo: true, repeat: -1 });

    this.#bindStart();
  }

  #addTwinklingStars() {
    const { width } = this.scale.gameSize;
    for (let i = 0; i < 30; i += 1) {
      const star = this.add.image(
        Phaser.Math.Between(4, width - 4),
        Phaser.Math.Between(4, 100),
        'prop-star',
      ).setAlpha(Phaser.Math.FloatBetween(0.3, 1));

      this.tweens.add({
        targets: star,
        alpha: 0.15,
        duration: Phaser.Math.Between(700, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1200),
      });
    }
  }

  #bindStart() {
    const begin = () => {
      // Must happen inside the gesture for iOS to allow audio at all.
      unlock();
      sfx.select();
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.time.delayedCall(420, () => this.scene.start('Room'));
    };

    this.input.once('pointerdown', begin);
    this.input.keyboard.once('keydown', begin);
  }
}
