/**
 * FeedJS Runtime - f-if Directive
 * 
 * Handles conditional rendering.
 */

import { evaluate } from './evaluator.js';
import type { Directive, Scope } from './types.js';

/**
 * Execute f-if directive
 * Returns whether to render the node
 */
export function executeIf(
  dir: Directive,
  scope: Scope
): boolean {
  const result = evaluate(dir.expression, scope);
  return !!result;
}
