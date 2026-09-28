import Phaser from 'phaser';
import PixelText from '../ui/PixelText.js';
import DialogueBox from '../ui/DialogueBox.js';
import Controls from '../ui/Controls.js';
import { GIFT, MEMORY_COUNT, memoryById } from '../config/gift.js';
import { HEX } from '../lib/palette.js';
import { load, save } from '../lib/save.js';
import { sfx } from '../lib/sfx.js';

const SPEED = 52;             // pixels per second
const INTERACT_RADIUS = 26;
const BOUNDS = { left: 12, right: 308, top: 54, bottom: 152 };

/** Props drawn on the back wall: decoration only, never blocking movement. */
const WALL_PROPS = [
  { key: 'prop-window', x: 64, y: 10 },
  { key: 'prop-photo', x: 200, y: 14 },
];

/** Floor props. `y` is the top edge; `solid` is the footprint feet cannot enter. */
const FLOOR_PROPS = [
  { key: 'prop-rug', x: 96, y: 120, depth: 1 },
  { key: 'prop-bed', x: 14, y: 54, solid: { x: 14, y: 60, w: 52, h: 54 } },
  { key: 'prop-shelf', x: 250, y: 44, solid: { x: 250, y: 88, w: 40, h: 14 } },
  { key: 'prop-desk', x: 146, y: 94, solid: { x: 146, y: 108, w: 46, h: 14 } },
  { key: 'prop-mug', x: 162, y: 86 },
  { key: 'prop-guitar', x: 228, y: 100, solid: { x: 228, y: 128, w: 14, h: 8 } },
  { key: 'prop-plant', x: 20, y: 124, solid: { x: 20, y: 142, w: 18, h: 8 } },
];

/**
 * Everything the player can interact with. `x`/`y` is where she has to stand
 * near; `markerY` is where the floating marker hovers.
 */
const INTERACTABLES = [
  { id: 'photo', kind: 'memory', x: 212, y: 58, markerX: 212, markerY: 38 },
  { id: 'window', kind: 'memory', x: 84, y: 58, markerX: 84, markerY: 42 },
  { id: 'books', kind: 'memory', x: 270, y: 108, markerX: 270, markerY: 34 },
  { id: 'guitar', kind: 'memory', x: 235, y: 142, markerX: 235, markerY: 90 },
  { id: 'mug', kind: 'memory', x: 169, y: 130, markerX: 167, markerY: 76 },
  { id: 'bed', kind: 'scenery', x: 78, y: 88, markerX: 40, markerY: 44 },
  { id: 'plant', kind: 'scenery', x: 46, y: 144, markerX: 29, markerY: 112 },
  { id: 'rug', kind: 'scenery', x: 124, y: 148, markerX: 124, markerY: 134 },
  { id: 'door', kind: 'door', x: 160, y: 58, markerX: 160, markerY: 26 },
];

const DOOR = { x: 145, y: 2 };

export default class RoomScene extends Phaser.Scene {
  constructor() {
    super('Room');
  }

  create() {
    this.progress = load();
    this.found = new Set(this.progress.found);
    this.solids = FLOOR_PROPS.filter((prop) => prop.solid).map((prop) => prop.solid);
    // Exposed so the console (and the smoke test) can reach a spot by name.
    this.interactables = INTERACTABLES;
    this.doorOpen = this.found.size >= MEMORY_COUNT;

    this.add.image(0, 0, 'room-bg').setOrigin(0, 0).setDepth(0);
    WALL_PROPS.forEach(({ key, x, y }) => this.add.image(x, y, key).setOrigin(0, 0).setDepth(0));

    this.door = this.add.image(DOOR.x, DOOR.y, 'prop-door').setOrigin(0, 0).setDepth(0);
    this.lock = this.add.image(DOOR.x + 15, DOOR.y + 26, 'prop-lock').setDepth(2).setVisible(!this.doorOpen);

    FLOOR_PROPS.forEach(({ key, x, y, depth }) => {
      const image = this.add.image(x, y, key).setOrigin(0, 0);
      image.setDepth(depth ?? y + image.height);
    });

    this.#createPlayer();
    this.#createMarker();
    this.#createHud();

    this.dialogue = new DialogueBox(this);
    this.controls = new Controls(this);

    this.cameras.main.fadeIn(400, 0, 0, 0);
    this.#playIntroIfNeeded();
  }

  #createPlayer() {
    this.player = this.add.sprite(160, 148, 'player-down-0').setOrigin(0.5, 1);
    this.player.setDepth(this.player.y);
    this.facing = 'down';
    this.player.play('idle-down');
    this.stepTimer = 0;
  }

  #createMarker() {
    // The marker is repositioned every frame, so its bob is a sine offset
    // rather than a tween — a tween would be overwritten and never animate.
    this.marker = this.add.image(0, 0, 'prop-marker').setDepth(800).setVisible(false);
  }

  #createHud() {
    this.hudHearts = GIFT.memories.map((memory, index) => {
      const heart = this.add.image(10 + index * 12, 10, 'prop-heart').setDepth(850);
      heart.setAlpha(this.found.has(memory.id) ? 1 : 0.22);
      return heart;
    });

    this.hudLabel = new PixelText(this, 10, 22, `${this.found.size}/${MEMORY_COUNT}`, { color: HEX.cream });
    this.hudLabel.setDepth(850);
  }

  #playIntroIfNeeded() {
    if (this.found.size > 0) return;
    this.#openDialogue(GIFT.intro);
  }

  #openDialogue(lines, options = {}) {
    this.controls.setVisible(false);
    this.controls.setTapAnywhere(true);
    this.dialogue.show(lines, {
      ...options,
      onComplete: () => {
        this.controls.setVisible(true);
        this.controls.setTapAnywhere(false);
        if (options.onComplete) options.onComplete();
      },
    });
  }

  /** Nearest interactable within range, or null. */
  #findTarget() {
    let best = null;
    let bestDistance = INTERACT_RADIUS;

    INTERACTABLES.forEach((item) => {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (distance < bestDistance) {
        best = item;
        bestDistance = distance;
      }
    });

    return best;
  }

  #interact(target) {
    if (target.kind === 'memory') {
      this.#collectMemory(target.id);
      return;
    }

    if (target.kind === 'scenery') {
      sfx.select();
      this.#openDialogue(GIFT.scenery[target.id] ?? ['...']);
      return;
    }

    if (this.doorOpen) {
      sfx.select();
      this.#leaveRoom();
      return;
    }

    sfx.denied();
    const remaining = MEMORY_COUNT - this.found.size;
    const hint = GIFT.door.hintFound.replace('{n}', String(remaining));
    this.#openDialogue([...GIFT.door.locked, hint]);
  }

  #collectMemory(id) {
    const memory = memoryById(id);
    if (!memory) return;

    const alreadyFound = this.found.has(id);
    if (!alreadyFound) {
      this.found.add(id);
      this.#persist();
      this.#refreshHud(id);
      sfx.memory();
      this.#burstHearts(this.player.x, this.player.y - 18);
    } else {
      sfx.select();
    }

    const justCompleted = !alreadyFound && this.found.size >= MEMORY_COUNT;

    this.#openDialogue(memory.lines, {
      speaker: memory.name,
      onComplete: justCompleted ? () => this.#unlockDoor() : null,
    });
  }

  #persist() {
    this.progress = { ...this.progress, found: [...this.found] };
    save(this.progress);
  }

  #refreshHud(id) {
    const index = GIFT.memories.findIndex((memory) => memory.id === id);
    if (index >= 0) {
      const heart = this.hudHearts[index];
      heart.setAlpha(1);
      this.tweens.add({ targets: heart, scale: 1.8, duration: 160, yoyo: true });
    }
    this.hudLabel.setText(`${this.found.size}/${MEMORY_COUNT}`);
  }

  #burstHearts(x, y) {
    for (let i = 0; i < 6; i += 1) {
      const heart = this.add.image(x, y, 'prop-heart').setDepth(860).setScale(0.7);
      this.tweens.add({
        targets: heart,
        x: x + Phaser.Math.Between(-22, 22),
        y: y - Phaser.Math.Between(14, 34),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(500, 900),
        delay: i * 45,
        onComplete: () => heart.destroy(),
      });
    }
  }

  #unlockDoor() {
    this.doorOpen = true;
    sfx.unlock();

    this.tweens.add({
      targets: this.lock,
      y: this.lock.y + 22,
      alpha: 0,
      angle: 140,
      duration: 600,
      onComplete: () => this.lock.setVisible(false),
    });

    this.cameras.main.shake(220, 0.006);
    this.time.delayedCall(700, () => this.#openDialogue(GIFT.door.allFound));
  }

  #leaveRoom() {
    this.controls.setVisible(false);
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(520, () => this.scene.start('Balcony'));
  }

  /** Axis-separated movement so sliding along a wall feels right. */
  #move(dx, dy) {
    const nextX = Phaser.Math.Clamp(this.player.x + dx, BOUNDS.left, BOUNDS.right);
    if (!this.#blocked(nextX, this.player.y)) this.player.x = nextX;

    const nextY = Phaser.Math.Clamp(this.player.y + dy, BOUNDS.top, BOUNDS.bottom);
    if (!this.#blocked(this.player.x, nextY)) this.player.y = nextY;
  }

  /** True when the player's feet would overlap a solid footprint. */
  #blocked(x, y) {
    const feet = { x: x - 4, y: y - 4, w: 8, h: 4 };
    return this.solids.some((rect) => (
      feet.x < rect.x + rect.w && feet.x + feet.w > rect.x
      && feet.y < rect.y + rect.h && feet.y + feet.h > rect.y
    ));
  }

  update(time, delta) {
    if (this.dialogue.isOpen) {
      this.dialogue.update(delta);
      if (this.controls.consumeInteract()) this.dialogue.advance();
      this.player.anims.play(`idle-${this.facing}`, true);
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

    this.player.setDepth(this.player.y);

    const target = this.#findTarget();
    this.#updateMarker(target);

    if (target && this.controls.consumeInteract()) {
      this.#interact(target);
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

  #updateMarker(target) {
    if (!target) {
      this.marker.setVisible(false);
      return;
    }

    const isFoundMemory = target.kind === 'memory' && this.found.has(target.id);
    const bob = Math.round(Math.sin(this.time.now / 180) * 2);
    this.marker.setVisible(true);
    this.marker.setPosition(target.markerX, target.markerY + bob);
    this.marker.setTint(isFoundMemory ? HEX.creamDark : HEX.gold);
  }
}
