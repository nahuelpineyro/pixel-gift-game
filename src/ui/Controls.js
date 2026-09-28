import Phaser from 'phaser';
import PixelText from './PixelText.js';
import { HEX } from '../lib/palette.js';
import { GIFT } from '../config/gift.js';

const DEAD_ZONE = 4;      // pixels of slack before the stick reads as movement
const STICK_RANGE = 16;   // distance at which the stick is fully pushed
const UI_DEPTH = 900;
const STICK_MARGIN = STICK_RANGE + 10;  // full push plus the knob's radius: keeps the knob on screen

// Shared across scenes: once she has moved with the stick, the hint is done.
let stickLearned = false;

/**
 * Merges keyboard and touch into one directional vector plus an "interact"
 * edge signal, so scenes never have to care which one is being used.
 *
 * Touch layout: dragging anywhere on the left half raises a floating stick
 * under the finger; the right half holds a fixed action button. Extra pointers
 * are registered so moving and pressing at the same time works on a phone.
 */
export default class Controls {
  constructor(scene) {
    this.scene = scene;
    this.direction = new Phaser.Math.Vector2(0, 0);
    this.interactQueued = false;
    this.tapAnywhere = false;

    // Phaser tracks one pointer by default; a thumbstick plus a button needs two.
    scene.input.addPointer(2);

    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.interactKeys = [
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    ];
    this.interactKeys.forEach((key) => key.on('down', () => this.queueInteract()));

    this.#buildTouchUi();
    this.#bindPointers();
  }

  #buildTouchUi() {
    const { width, height } = this.scene.scale.gameSize;
    const scene = this.scene;

    this.stickBase = scene.add.image(0, 0, 'ui-stick-base')
      .setDepth(UI_DEPTH).setAlpha(0).setScrollFactor(0);
    this.stickKnob = scene.add.image(0, 0, 'ui-stick-knob')
      .setDepth(UI_DEPTH + 1).setAlpha(0).setScrollFactor(0);

    this.button = scene.add.image(width - 26, height - 26, 'ui-button')
      .setDepth(UI_DEPTH).setAlpha(0.55).setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    this.button.on('pointerdown', (pointer, x, y, event) => {
      event.stopPropagation();
      this.buttonPointerId = pointer.id;
      this.button.setAlpha(0.95);
      this.queueInteract();
    });

    const releaseButton = () => {
      this.buttonPointerId = null;
      this.button.setAlpha(0.55);
    };
    this.button.on('pointerup', releaseButton);
    this.button.on('pointerout', releaseButton);

    this.buttonPointerId = null;
    this.stickPointerId = null;
    this.stickOrigin = new Phaser.Math.Vector2();

    this.#buildStickHint();
  }

  /**
   * On touch screens the stick is invisible until a finger lands, so a ghost
   * stick and a line of text show where to press until it has been used once.
   */
  #buildStickHint() {
    const scene = this.scene;
    const { height } = scene.scale.gameSize;
    if (stickLearned || !scene.sys.game.device.input.touch) return;

    const x = 40;
    const y = height - 36;
    const base = scene.add.image(x, y, 'ui-stick-base').setAlpha(0.3);
    const knob = scene.add.image(x, y, 'ui-stick-knob').setAlpha(0.5);
    const label = new PixelText(scene, 0, 0, GIFT.touchHint, { color: HEX.cream, align: 'center' });
    const labelX = Math.max(8, Math.round(x - label.textWidth / 2));
    const labelY = y - 23 - label.textHeight - 8;
    label.setPosition(labelX, labelY);

    // A dark panel behind the text so it stays readable over the furniture.
    const panel = scene.add.rectangle(labelX - 4, labelY - 3, label.textWidth + 8, label.textHeight + 6, HEX.black, 0.75)
      .setOrigin(0, 0);

    this.stickHint = [base, knob, panel, label];
    this.stickHint.forEach((item) => item.setDepth(UI_DEPTH).setScrollFactor(0));
    label.setDepth(UI_DEPTH + 1);

    // The knob nudges right and back, miming a drag.
    this.stickHintTween = scene.tweens.add({
      targets: knob,
      x: x + 10,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      repeatDelay: 300,
    });
  }

  #setStickHintVisible(visible) {
    if (!this.stickHint) return;
    this.stickHint.forEach((item) => item.setVisible(visible));
  }

  #dismissStickHint() {
    stickLearned = true;
    if (!this.stickHint) return;
    this.stickHintTween.remove();
    this.stickHint.forEach((item) => item.destroy());
    this.stickHint = null;
  }

  #bindPointers() {
    const scene = this.scene;
    const halfWidth = scene.scale.gameSize.width / 2;

    scene.input.on('pointerdown', (pointer) => {
      if (pointer.id === this.buttonPointerId) return;

      // While a dialogue is up, a tap anywhere advances it.
      if (this.tapAnywhere) {
        this.queueInteract();
        return;
      }

      if (pointer.x < halfWidth) {
        const { width, height } = scene.scale.gameSize;
        // Pulled in from the edges so the base is never cut off by the screen.
        const x = Phaser.Math.Clamp(pointer.x, STICK_MARGIN, width - STICK_MARGIN);
        const y = Phaser.Math.Clamp(pointer.y, STICK_MARGIN, height - STICK_MARGIN);
        this.stickPointerId = pointer.id;
        this.stickOrigin.set(x, y);
        this.stickBase.setPosition(x, y).setAlpha(0.45);
        this.stickKnob.setPosition(x, y).setAlpha(0.7);
        this.#dismissStickHint();
      } else {
        // A tap on the right half acts as the action button too.
        this.queueInteract();
      }
    });

    scene.input.on('pointermove', (pointer) => {
      if (pointer.id !== this.stickPointerId || !pointer.isDown) return;

      const offset = new Phaser.Math.Vector2(pointer.x - this.stickOrigin.x, pointer.y - this.stickOrigin.y);
      const clamped = offset.clone().limit(STICK_RANGE);
      this.stickKnob.setPosition(this.stickOrigin.x + clamped.x, this.stickOrigin.y + clamped.y);
    });

    const releaseStick = (pointer) => {
      if (pointer.id !== this.stickPointerId) return;
      this.stickPointerId = null;
      this.stickBase.setAlpha(0);
      this.stickKnob.setAlpha(0);
    };
    scene.input.on('pointerup', releaseStick);
    scene.input.on('pointerupoutside', releaseStick);
  }

  /**
   * In tap-anywhere mode every tap counts as an interact press. Used while a
   * dialogue is open so the player never has to hunt for the button.
   */
  setTapAnywhere(enabled) {
    this.tapAnywhere = enabled;
    if (enabled) {
      this.stickPointerId = null;
      this.stickBase.setAlpha(0);
      this.stickKnob.setAlpha(0);
    }
    return this;
  }

  /** Flags an interact press for the next `consumeInteract()` call. */
  queueInteract() {
    this.interactQueued = true;
  }

  /** Returns true once per press, then clears the flag. */
  consumeInteract() {
    if (!this.interactQueued) return false;
    this.interactQueued = false;
    return true;
  }

  /** Current movement vector, normalised, from whichever input is active. */
  getDirection() {
    const { keys } = this;
    let x = 0;
    let y = 0;

    if (keys.left.isDown || keys.a.isDown) x -= 1;
    if (keys.right.isDown || keys.d.isDown) x += 1;
    if (keys.up.isDown || keys.w.isDown) y -= 1;
    if (keys.down.isDown || keys.s.isDown) y += 1;

    if (x === 0 && y === 0 && this.stickPointerId !== null) {
      const offset = new Phaser.Math.Vector2(
        this.stickKnob.x - this.stickOrigin.x,
        this.stickKnob.y - this.stickOrigin.y,
      );
      if (offset.length() > DEAD_ZONE) {
        x = offset.x / STICK_RANGE;
        y = offset.y / STICK_RANGE;
      }
    }

    return this.direction.set(x, y).limit(1);
  }

  /** Hides the touch overlay, e.g. while a dialogue is open. */
  setVisible(visible) {
    this.button.setVisible(visible);
    this.#setStickHintVisible(visible);
    if (!visible) {
      this.stickPointerId = null;
      this.stickBase.setAlpha(0);
      this.stickKnob.setAlpha(0);
    }
    return this;
  }

  destroy() {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerup');
    this.scene.input.off('pointerupoutside');
    [this.stickBase, this.stickKnob, this.button].forEach((item) => item.destroy());
    if (this.stickHint) this.stickHint.forEach((item) => item.destroy());
  }
}

export { UI_DEPTH, HEX };
