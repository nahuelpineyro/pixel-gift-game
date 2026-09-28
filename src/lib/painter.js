/**
 * Tiny canvas painter used to build every texture in the game at runtime.
 *
 * Nothing is loaded from disk: each sprite is drawn here, registered with the
 * Texture Manager, and from then on behaves like any other Phaser texture.
 * Replacing a sprite with hand-drawn pixel art later only means loading a PNG
 * under the same key instead of calling `paint()`.
 */

/** Wraps a 2D context with pixel-oriented drawing helpers. */
class Brush {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  /** Filled rectangle. */
  rect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
    return this;
  }

  /** Single pixel. */
  dot(x, y, color) {
    return this.rect(x, y, 1, 1, color);
  }

  /** One-pixel rectangle outline. */
  outline(x, y, w, h, color) {
    this.rect(x, y, w, 1, color);
    this.rect(x, y + h - 1, w, 1, color);
    this.rect(x, y, 1, h, color);
    this.rect(x + w - 1, y, 1, h, color);
    return this;
  }

  /** Horizontal line. */
  hline(x, y, w, color) {
    return this.rect(x, y, w, 1, color);
  }

  /** Vertical line. */
  vline(x, y, h, color) {
    return this.rect(x, y, 1, h, color);
  }

  /**
   * Filled circle, rasterised row by row so the edge stays on the pixel grid
   * instead of being antialiased by the canvas arc API.
   */
  circle(cx, cy, radius, color) {
    for (let y = Math.ceil(cy - radius); y < cy + radius; y += 1) {
      const dy = y + 0.5 - cy;
      const half = Math.sqrt(Math.max(0, radius * radius - dy * dy));
      const x = Math.round(cx - half);
      const w = Math.max(1, Math.round(half * 2));
      this.rect(x, y, w, 1, color);
    }
    return this;
  }

  /**
   * Clears a filled circle back to transparency. Rings are drawn as a filled
   * circle with a smaller one punched out of the middle.
   */
  punch(cx, cy, radius) {
    for (let y = Math.ceil(cy - radius); y < cy + radius; y += 1) {
      const dy = y + 0.5 - cy;
      const half = Math.sqrt(Math.max(0, radius * radius - dy * dy));
      this.ctx.clearRect(Math.round(cx - half), y, Math.max(1, Math.round(half * 2)), 1);
    }
    return this;
  }

  /** Fills the whole canvas. */
  fill(color) {
    return this.rect(0, 0, this.width, this.height, color);
  }

  /**
   * Draws a pixel map: an array of equal-length strings where each character
   * is a key into `palette`. Characters missing from the palette are skipped,
   * which is how transparency is expressed.
   */
  map(x, y, rows, palette) {
    rows.forEach((row, ry) => {
      row.split('').forEach((char, rx) => {
        const color = palette[char];
        if (color) this.dot(x + rx, y + ry, color);
      });
    });
    return this;
  }
}

/**
 * Creates a texture of the given size by running `draw` against a Brush.
 * Returns the texture key so calls can be chained into `add.image(...)`.
 */
export function paint(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) return key;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  draw(new Brush(ctx, width, height));

  scene.textures.addCanvas(key, canvas);
  return key;
}
