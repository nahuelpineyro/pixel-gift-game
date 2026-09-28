import Phaser from 'phaser';
import { CELL_W, CELL_H, GLYPH_SPACING, LINE_SPACING, CHARS, cellFor, normalise, measure } from '../lib/pixelFont.js';
import { paint } from '../lib/painter.js';

const GLYPH_KEY_PREFIX = 'glyph-';

/**
 * Builds one white texture per glyph. Colour comes from a multiply tint at
 * draw time, so the whole font costs 70 tiny textures no matter how much text
 * the game shows.
 */
export function createFontTextures(scene) {
  CHARS.forEach((char, index) => {
    const rows = cellFor(char);
    paint(scene, `${GLYPH_KEY_PREFIX}${index}`, CELL_W, CELL_H, (brush) => {
      brush.map(0, 0, rows, { '#': '#ffffff' });
    });
  });
}

const glyphKey = (char) => `${GLYPH_KEY_PREFIX}${CHARS.indexOf(char)}`;

/**
 * Wraps normalised text to a pixel width, breaking on spaces and honouring
 * explicit newlines.
 */
export function wrap(text, maxWidth) {
  const lines = [];

  // Split on the hard breaks FIRST: normalise() has no glyph for "\n" and
  // would otherwise replace every one of them with the fallback character.
  String(text).split('\n').map(normalise).forEach((paragraph) => {
    let current = '';
    paragraph.split(' ').forEach((word) => {
      const candidate = current ? `${current} ${word}` : word;
      if (current && measure(candidate) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    lines.push(current);
  });

  return lines;
}

/**
 * A block of bitmap text. Glyphs are plain images inside a container, which
 * makes the typewriter effect a matter of toggling visibility rather than
 * rebuilding a texture every frame.
 */
export default class PixelText extends Phaser.GameObjects.Container {
  constructor(scene, x, y, text, options = {}) {
    super(scene, x, y);

    this.color = options.color ?? 0xffffff;
    this.maxWidth = options.maxWidth ?? Infinity;
    this.align = options.align ?? 'left';
    this.glyphs = [];
    this.lineWidths = [];

    scene.add.existing(this);
    this.setText(text);
  }

  /** Replaces the rendered text. */
  setText(text) {
    this.glyphs.forEach((glyph) => glyph.destroy());
    this.glyphs = [];

    const lines = wrap(text, this.maxWidth);
    this.lineWidths = lines.map(measure);
    const blockWidth = Math.max(0, ...this.lineWidths);

    lines.forEach((line, lineIndex) => {
      const indent = this.align === 'center' ? Math.floor((blockWidth - this.lineWidths[lineIndex]) / 2) : 0;
      const y = lineIndex * (CELL_H + LINE_SPACING);

      line.split('').forEach((char, charIndex) => {
        if (char === ' ') return;
        const x = indent + charIndex * (CELL_W + GLYPH_SPACING);
        const glyph = this.scene.add.image(x, y, glyphKey(char)).setOrigin(0, 0).setTint(this.color);
        this.add(glyph);
        this.glyphs.push(glyph);
      });
    });

    this.textWidth = blockWidth;
    this.textHeight = lines.length * (CELL_H + LINE_SPACING) - LINE_SPACING;
    return this;
  }

  /** Recolours every glyph. */
  setColor(color) {
    this.color = color;
    this.glyphs.forEach((glyph) => glyph.setTint(color));
    return this;
  }

  /** Shows only the first `count` glyphs — the typewriter effect. */
  reveal(count) {
    this.glyphs.forEach((glyph, index) => glyph.setVisible(index < count));
    return this;
  }

  /** Number of glyphs a full reveal has to step through. */
  get glyphCount() {
    return this.glyphs.length;
  }
}
