/**
 * PixiJS utility functions for graphics creation
 */

import { Graphics, Circle } from 'pixi.js';

/**
 * Create an interactive circular dot
 */
export function makeDot(radius: number, color: number): Graphics {
  const dot = new Graphics();
  dot.circle(0, 0, radius);
  dot.fill(color);

  dot.eventMode = 'static';
  dot.cursor = 'pointer';
  dot.hitArea = new Circle(0, 0, radius);

  return dot;
}

/**
 * Repaint a dot with new color
 */
export function repaintDot(dot: Graphics, radius: number, color: number): void {
  dot.clear();
  dot.circle(0, 0, radius);
  dot.fill(color);
}
