import Phaser from 'phaser';
import { HEX } from '../lib/palette.js';

const DEAD_ZONE = 4;      // pixels of slack before the stick reads as movement
const STICK_RANGE = 16;   // distance at which the stick is fully pushed
const UI_DEPTH = 900;

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
        this.stickPointerId = pointer.id;
        this.stickOrigin.set(pointer.x, pointer.y);
        this.stickBase.setPosition(pointer.x, pointer.y).setAlpha(0.45);
        this.stickKnob.setPosition(pointer.x, pointer.y).setAlpha(0.7);
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
  }
}

export { UI_DEPTH, HEX };
