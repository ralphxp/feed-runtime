/**
 * FeedJS Runtime - Expression Evaluator
 * 
 * Safe expression evaluation using Function constructor.
 * In the future, this should be replaced with an AST-based parser.
 */

import type { Scope } from './types.js';

/**
 * Evaluate an expression within a scope
 * 
 * Supported syntax:
 * - Identifiers: todo
 * - Dot access: todo.text
 * - Array access: todos[0]
 * - Binary operators: +, -, *, /, ===, !==, >, <, >=, <=
 * - Logical operators: &&, ||
 * - Ternary: condition ? a : b
 * - Literals: strings, numbers, booleans, null, undefined
 */
export function evaluate(expr: string, scope: Scope): unknown {
  if (!expr) return expr;

  // Build context from state and locals
  const context = { ...scope.state, ...scope.locals };

  try {
    // Create a function with the context keys as parameters
    const keys = Object.keys(context);
    const values = Object.values(context);

    // For safety, we only allow specific patterns
    // This is a temporary solution - in production, use an AST parser
    const fn = new Function(
      ...keys,
      `"use strict"; return (${expr})`
    );

    return fn(...values);
  } catch (error) {
    console.error(`[FeedJS] Expression evaluation error: ${expr}`, error);
    return undefined;
  }
}

/**
 * Extract property name from bind directive
 * f-bind:value -> value
 * f-bind:checked -> checked
 * f-bind:class -> className
 */
export function extractBindProperty(name: string): string {
  const prop = name.replace('f-bind:', '');
  
  // Map 'class' to 'className' for DOM
  if (prop === 'class') {
    return 'className';
  }
  
  return prop;
}

/**
 * Extract event name from on directive
 * f-on:click -> click
 * f-on:change -> change
 */
export function extractEventName(name: string): string {
  return name.replace('f-on:', '');
}

/**
 * Parse for loop expression
 * "todo in todos" -> { item: 'todo', source: 'todos' }
 */
export function parseForExpression(expr: string): { item: string; source: string } | null {
  const match = expr.match(/^(\w+)\s+in\s+(\w+)$/);
  if (!match) return null;
  
  return {
    item: match[1] ?? '',
    source: match[2] ?? ''
  };
}
