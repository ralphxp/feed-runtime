/**
 * FeedJS Runtime - DOM Property Updates
 * 
 * Updates DOM node properties based on patch instructions.
 */

import type { VNodeProps } from 'feedjs-core';

/**
 * Update props on an existing DOM element
 */
export function updateProps(element: Element, oldProps: VNodeProps | null, newProps: VNodeProps | null): void {
  const allKeys = new Set([
    ...Object.keys(oldProps ?? {}),
    ...Object.keys(newProps ?? {}),
  ]);

  for (const key of allKeys) {
    const oldValue = oldProps?.[key];
    const newValue = newProps?.[key];

    if (oldValue === newValue) continue;

    // Remove if new value is null/undefined/false
    if (newValue === null || newValue === undefined || newValue === false) {
      element.removeAttribute(key);
      continue;
    }

    // Skip Feed internal directives
    if (key.startsWith('f-')) continue;

    // Event handlers - handled by event system
    const secondChar = key[1];
    if (key.length >= 3 && key.startsWith('on') && secondChar && secondChar === secondChar.toUpperCase()) {
      continue;
    }

    // Set the attribute
    if (newValue === true) {
      element.setAttribute(key, '');
    } else {
      element.setAttribute(key, String(newValue));
    }
  }
}

/**
 * Remove all props from an element
 */
export function removeProps(element: Element, props: VNodeProps | null): void {
  if (!props) return;

  for (const key of Object.keys(props)) {
    element.removeAttribute(key);
  }
}
