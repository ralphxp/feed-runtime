/**
 * FeedJS Runtime - f-on Directive
 * 
 * Handles event binding with argument parsing.
 */

import { extractEventName, evaluate } from './evaluator.js';
import type { Directive, Scope } from './types.js';

/**
 * Execute f-on directive
 * Binds an event handler to the element
 * Supports both simple handlers and handlers with arguments
 */
export function executeOn(
  el: HTMLElement,
  dir: Directive,
  scope: Scope
): void {
  const event = extractEventName(dir.name);
  const expression = dir.expression;

  // console.log('[f-on] Binding event:', event, 'expression:', expression);

  el.addEventListener(event, (e: Event) => {
    // Check if expression contains function call with arguments
    // e.g., "toggleTodo(todo.id)" or "deleteTodo(todo.id)"
    if (expression.includes('(') && expression.includes(')')) {
      // Parse function name and arguments
      const openParen = expression.indexOf('(');
      const closeParen = expression.lastIndexOf(')');
      
      const fnName = expression.substring(0, openParen).trim();
      const argsString = expression.substring(openParen + 1, closeParen);
      
      // Evaluate each argument
      const args = argsString
        ? argsString.split(',').map(arg => evaluate(arg.trim(), scope))
        : [];
      
      // Look up handler in state
      const handler = scope.state[fnName];
      
      if (typeof handler === 'function') {
        handler.call(scope.state, ...args, e);
      }
    } else {
      // Simple handler - just call by name
      const handler = scope.state[expression];
      
      if (typeof handler === 'function') {
        handler.call(scope.state, e);
      }
    }
  });
}
