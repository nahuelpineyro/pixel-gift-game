import Phaser from 'phaser';
import PixelText from '../ui/PixelText.js';
import DialogueBox from '../ui/DialogueBox.js';
import Controls from '../ui/Controls.js';
import { GIFT } from '../config/gift.js';
import { HEX } from '../lib/palette.js';
import { reset } from '../lib/save.js';
import { sfx } from '../lib/sfx.js';

const SPEED = 52;
const INTERACT_RADIUS = 30;
const BOUNDS = { left: 12, right: 308, top: 140, bottom: 172 };
const GIFT_SPOT = { x: 160, y: 124 };

/**
 * The ending. She walks out onto the balcony, opens the box, and reads the
 * letter. Nothing here is optional or skippable except one message at a time.
 */
export default class BalconyScene extends Phaser.Scene {
  constructor() {
    super('Balcony');
  }

  create() {
    this.opened = false;

    this.add.image(0, 0, 'balcony-bg').setOrigin(0, 0).setDepth(0);
    this.#addStars();

    this.gift = this.add.image(GIFT_SPOT.x, GIFT_SPOT.y, 'prop-gift').setOrigin(0.5, 1).setDepth(2);
    this.tweens.add({ targets: this.gift, y: GIFT_SPOT.y - 2, duration: 900, yoyo: true, repeat: -1 });

    this.glow = this.add.image(GIFT_SPOT.x, GIFT_SPOT.y - 12, 'prop-heart')
      .setDepth(1).setAlpha(0.35).setScale(3).setTint(HEX.gold);
    this.tweens.add({ targets: this.glow, alpha: 0.12, scale: 3.6, duration: 1100, yoyo: true, repeat: -1 });

    this.player = this.add.sprite(160, 168, 'player-up-0').setOrigin(0.5, 1).setDepth(10);
    this.facing = 'up';
    this.player.play('idle-up');
    this.stepTimer = 0;

    this.marker = this.add.image(GIFT_SPOT.x, GIFT_SPOT.y - 34, 'prop-marker')
      .setDepth(800).setVisible(false).setTint(HEX.gold);
    this.markerBaseY = GIFT_SPOT.y - 34;

    this.dialogue = new DialogueBox(this);
    this.controls = new Controls(this);

    this.cameras.main.fadeIn(600, 0, 0, 0);
    this.#openDialogue(GIFT.balcony.arrival);
  }

  #addStars() {
    this.stars = [];
    for (let i = 0; i < 44; i += 1) {
      const star = this.add.image(
        Phaser.Math.Between(3, 317),
        Phaser.Math.Between(3, 96),
        'prop-star',
      ).setDepth(1).setAlpha(Phaser.Math.FloatBetween(0.25, 1));

      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(800, 2400),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1600),
      });
      this.stars.push(star);
    }
  }

  #openDialogue(lines, options = {}) {
    this.controls.setVisible(false);
    this.controls.setTapAnywhere(true);
    this.dialogue.show(lines, {
      ...options,
      onComplete: () => {
        this.controls.setTapAnywhere(false);
        if (!this.opened) this.controls.setVisible(true);
        if (options.onComplete) options.onComplete();
      },
    });
  }

  #openGift() {
    this.opened = true;
    // The run is over: wipe it so the next visit starts from scratch.
    reset();

    sfx.reveal();
    this.marker.setVisible(false);
    this.controls.setVisible(false);

    this.tweens.add({
      targets: this.gift,
      y: GIFT_SPOT.y - 16,
      scale: 1.3,
      duration: 500,
      ease: 'Back.easeOut',
    });
    this.tweens.add({ targets: this.glow, alpha: 0.6, scale: 6, duration: 900 });
    this.#rainHearts();

    this.time.delayedCall(700, () => {
      this.#openDialogue(GIFT.letter, {
        speaker: GIFT.yourName,
        onComplete: () => this.#showSignature(),
      });
    });
  }

  /** Hearts drift up across the whole screen for the rest of the scene. */
  #rainHearts() {
    this.heartTimer = this.time.addEvent({
      delay: 320,
      loop: true,
      callback: () => {
        const heart = this.add.image(
          Phaser.Math.Between(10, 310),
          185,
          'prop-heart',
        ).setDepth(5).setAlpha(0.8).setScale(Phaser.Math.FloatBetween(0.6, 1.4));

        this.tweens.add({
          targets: heart,
          y: Phaser.Math.Between(-20, 40),
          x: heart.x + Phaser.Math.Between(-26, 26),
          alpha: 0,
          duration: Phaser.Math.Between(3200, 5200),
          onComplete: () => heart.destroy(),
        });

        if (Phaser.Math.Between(0, 3) === 0) sfx.heart();
      },
    });
  }

  #showSignature() {
    const { width, height } = this.scale.gameSize;

    const signature = new PixelText(this, 0, height / 2 - 4, GIFT.signature, { color: HEX.cream });
    signature.setPosition(Math.round((width - signature.textWidth * 2) / 2), height / 2 - 8);
    signature.setScale(2).setDepth(1200).setAlpha(0);

    const forHer = new PixelText(this, 0, height / 2 + 18, GIFT.herName, { color: HEX.gold });
    forHer.setPosition(Math.round((width - forHer.textWidth) / 2), height / 2 + 18);
    forHer.setDepth(1200).setAlpha(0);

    this.tweens.add({ targets: [signature, forHer], alpha: 1, duration: 1400 });

    // Let her sit with it before offering the way back.
    this.time.delayedCall(4000, () => {
      const back = new PixelText(this, 0, height - 16, 'TOCÁ PARA VOLVER AL INICIO', { color: HEX.creamDark });
      back.setPosition(Math.round((width - back.textWidth) / 2), height - 16);
      back.setDepth(1200);
      this.tweens.add({ targets: back, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

      this.input.once('pointerdown', () => this.#returnToTitle());
      this.input.keyboard.once('keydown', () => this.#returnToTitle());
    });
  }

  #returnToTitle() {
    if (this.heartTimer) this.heartTimer.remove();
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.time.delayedCall(620, () => this.scene.start('Title'));
  }

  #move(dx, dy) {
    this.player.x = Phaser.Math.Clamp(this.player.x + dx, BOUNDS.left, BOUNDS.right);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy, BOUNDS.top, BOUNDS.bottom);
  }

  update(time, delta) {
    if (this.dialogue.isOpen) {
      this.dialogue.update(delta);
      if (this.controls.consumeInteract()) this.dialogue.advance();
      return;
    }

    if (this.opened) {
      this.controls.consumeInteract();
      return;
    }

    const direction = this.controls.getDirection();
    const step = (delta / 1000) * SPEED;

    if (direction.length() > 0) {
      this.#move(direction.x * step, direction.y * step);
      this.#updateFacing(direction);

      this.stepTimer -= delta;
      if (this.stepTimer <= 0) {
        sfx.step();
        this.stepTimer = 300;
      }
    } else {
      this.player.anims.play(`idle-${this.facing}`, true);
    }

    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, GIFT_SPOT.x, GIFT_SPOT.y);
    const inRange = distance < INTERACT_RADIUS;
    this.marker.setVisible(inRange);
    this.marker.y = this.markerBaseY + Math.round(Math.sin(time / 180) * 2);

    if (inRange && this.controls.consumeInteract()) {
      this.#openGift();
    } else {
      this.controls.consumeInteract();
    }
  }

  #updateFacing(direction) {
    if (Math.abs(direction.x) > Math.abs(direction.y)) {
      this.facing = 'side';
      this.player.setFlipX(direction.x < 0);
    } else {
      this.facing = direction.y < 0 ? 'up' : 'down';
      this.player.setFlipX(false);
    }
    this.player.anims.play(`walk-${this.facing}`, true);
  }
}
