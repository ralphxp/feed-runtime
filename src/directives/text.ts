/**
 * FeedJS Runtime - f-text Directive
 * 
 * Handles text content interpolation.
 */

import { evaluate } from './evaluator.js';
import type { Directive, Scope } from './types.js';

/**
 * Execute f-text directive
 * Sets the text content of an element
 */
export function executeText(
  el: HTMLElement,
  dir: Directive,
  scope: Scope
): void {
  const value = evaluate(dir.expression, scope);
  el.textContent = String(value ?? '');
}
