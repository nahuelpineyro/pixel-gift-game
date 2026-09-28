import PixelText from './PixelText.js';
import { paint } from '../lib/painter.js';
import { PALETTE as C, HEX } from '../lib/palette.js';
import { sfx } from '../lib/sfx.js';

const PANEL_W = 300;
const PANEL_H = 46;
const PAD_X = 8;
const PAD_Y = 7;
const DEPTH = 1000;
const GLYPHS_PER_SECOND = 45;

function createPanelTextures(scene) {
  paint(scene, 'ui-panel', PANEL_W, PANEL_H, (b) => {
    b.rect(0, 0, PANEL_W, PANEL_H, C.black);
    b.rect(1, 1, PANEL_W - 2, PANEL_H - 2, C.wallTrim);
    b.outline(2, 2, PANEL_W - 4, PANEL_H - 4, C.cream);
    // Clipped corners, so the box reads as pixel art rather than a plain div.
    [[0, 0], [PANEL_W - 2, 0], [0, PANEL_H - 2], [PANEL_W - 2, PANEL_H - 2]].forEach(([x, y]) => {
      b.rect(x, y, 2, 2, C.black);
    });
  });

  paint(scene, 'ui-arrow', 7, 5, (b) => {
    b.map(0, 0, ['#######', '.#####.', '..###..', '...#...', '.......'], { '#': C.gold });
  });
}

/**
 * The dialogue box: a queue of short messages revealed one character at a
 * time. Advancing while text is still typing skips to the end of that message,
 * which is what anyone who has played an RPG expects.
 */
export default class DialogueBox {
  constructor(scene) {
    this.scene = scene;
    createPanelTextures(scene);

    const { width, height } = scene.scale.gameSize;
    const panelX = Math.round((width - PANEL_W) / 2);
    const panelY = height - PANEL_H - 3;

    this.container = scene.add.container(panelX, panelY).setDepth(DEPTH).setVisible(false);
    this.panel = scene.add.image(0, 0, 'ui-panel').setOrigin(0, 0);

    // Sits inside the border, not on it: at PAD_Y - 6 the caps were clipped.
    this.speaker = new PixelText(scene, PAD_X, 5, '', { color: HEX.gold });
    this.speaker.setVisible(false);

    this.body = new PixelText(scene, PAD_X, PAD_Y, '', {
      color: HEX.cream,
      maxWidth: PANEL_W - PAD_X * 2,
    });

    this.arrow = scene.add.image(PANEL_W - 12, PANEL_H - 10, 'ui-arrow').setOrigin(0, 0).setVisible(false);

    this.container.add([this.panel, this.speaker, this.body, this.arrow]);

    this.arrowTween = scene.tweens.add({
      targets: this.arrow,
      y: PANEL_H - 8,
      duration: 380,
      yoyo: true,
      repeat: -1,
      paused: true,
    });

    this.queue = [];
    this.revealed = 0;
    this.typing = false;
    this.onComplete = null;
  }

  get isOpen() {
    return this.container.visible;
  }

  /** True while characters are still appearing. */
  get isTyping() {
    return this.typing;
  }

  /**
   * Shows a message or list of messages. `speaker` is optional and renders as
   * a small gold label above the text.
   */
  show(lines, { speaker = null, onComplete = null } = {}) {
    this.queue = Array.isArray(lines) ? [...lines] : [lines];
    this.onComplete = onComplete;

    if (speaker) {
      this.speaker.setText(speaker).setVisible(true);
      this.body.y = PAD_Y + 8;
    } else {
      this.speaker.setVisible(false);
      this.body.y = PAD_Y;
    }

    this.container.setVisible(true);
    this.#next();
    return this;
  }

  #next() {
    const line = this.queue.shift();

    if (line === undefined) {
      this.#close();
      return;
    }

    this.body.setText(line).reveal(0);
    this.revealed = 0;
    this.typing = true;
    this.arrow.setVisible(false);
    this.arrowTween.pause();
  }

  #close() {
    this.container.setVisible(false);
    this.typing = false;
    this.arrow.setVisible(false);
    this.arrowTween.pause();

    const callback = this.onComplete;
    this.onComplete = null;
    if (callback) callback();
  }

  /**
   * Called when the player presses interact: finishes the current message if it
   * is still typing, otherwise moves on.
   */
  advance() {
    if (!this.isOpen) return;

    if (this.typing) {
      this.revealed = this.body.glyphCount;
      this.body.reveal(this.revealed);
      this.typing = false;
      this.arrow.setVisible(true);
      this.arrowTween.resume();
      return;
    }

    sfx.select();
    this.#next();
  }

  /** Drives the typewriter. `delta` is milliseconds, as Phaser provides it. */
  update(delta) {
    if (!this.isOpen || !this.typing) return;

    const step = (delta / 1000) * GLYPHS_PER_SECOND;
    const before = Math.floor(this.revealed);
    this.revealed = Math.min(this.revealed + step, this.body.glyphCount);
    const after = Math.floor(this.revealed);

    if (after !== before) {
      this.body.reveal(after);
      if (after % 3 === 0) sfx.blip();
    }

    if (this.revealed >= this.body.glyphCount) {
      this.typing = false;
      this.arrow.setVisible(true);
      this.arrowTween.resume();
    }
  }
}
