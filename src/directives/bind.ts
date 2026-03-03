/**
 * FeedJS Runtime - f-bind Directive
 * 
 * Handles attribute binding.
 */

import { evaluate, extractBindProperty } from './evaluator.js';
import type { Directive, Scope } from './types.js';

/**
 * Execute f-bind directive
 * Binds an attribute to an expression value
 */
export function executeBind(
  el: HTMLElement,
  dir: Directive,
  scope: Scope
): void {
  const prop = extractBindProperty(dir.name);
  const value = evaluate(dir.expression, scope);

  // Handle different property types
  if (prop === 'className' || prop === 'class') {
    el.className = String(value ?? '');
  } else if (prop === 'value') {
    (el as HTMLInputElement).value = String(value ?? '');
  } else if (prop === 'checked') {
    (el as HTMLInputElement).checked = Boolean(value);
  } else if (value === true) {
    el.setAttribute(prop, '');
  } else if (value === false || value === null || value === undefined) {
    el.removeAttribute(prop);
  } else {
    el.setAttribute(prop, String(value));
  }
}
