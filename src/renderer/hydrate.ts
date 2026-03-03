/**
 * FeedJS Runtime - Hydration
 * 
 * Hydrates server-rendered HTML with event handlers.
 */

import type { VNode } from 'feedjs-core';
import { bindEvents, unbindEvents } from '../dom/events.js';
import { hasJQuery, triggerFeedEvent } from '../jquery/bridge.js';

// Event context for resolving handlers
const hydrationContext: Record<string, EventListener> = {};

/**
 * Hydrate existing DOM with event handlers
 * 
 * Reuses existing DOM nodes and attaches events without re-rendering
 */
export function hydrate(container: Element, vnode: VNode): void {
  // Walk the DOM tree and attach events based on VNode
  hydrateNode(container, vnode);

  // Trigger hydration event
  triggerFeedEvent(container, 'hydrated');

  // jQuery bridge
  if (hasJQuery()) {
    const jq = (window as unknown as { jQuery: unknown }).jQuery;
    if (jq && typeof jq === 'function') {
      (jq as (el: Element) => { trigger: (event: string) => void })(container).trigger('feedjs:hydrated');
    }
  }
}

/**
 * Hydrate a single node recursively
 */
function hydrateNode(domNode: Node, vnode: VNode): void {
  if (!(domNode instanceof Element)) return;

  // Bind events from VNode props
  if (vnode.props) {
    bindEvents(domNode, vnode.props as Record<string, unknown>, hydrationContext);
  }

  // Recursively hydrate children
  const domChildren = Array.from(domNode.childNodes);
  let vnodeChildren: VNode['children'] = vnode.children;

  if (!vnodeChildren || !Array.isArray(vnodeChildren)) {
    // For text nodes or other simple cases
    return;
  }

  // Simple matching: match by index
  for (let i = 0; i < domChildren.length && i < vnodeChildren.length; i++) {
    const childDom = domChildren[i];
    const childVNode = vnodeChildren[i];
    if (!childDom || !childVNode) continue;
    hydrateNode(childDom, childVNode);
  }
}

/**
 * Check if hydration structure matches
 * Returns true if structure matches, false otherwise
 */
export function checkHydration(container: Element, vnode: VNode): boolean {
  return checkNodeMatch(container, vnode);
}

/**
 * Check if a DOM node matches a VNode
 */
function checkNodeMatch(domNode: Node, vnode: VNode): boolean {
  if (!(domNode instanceof Element)) {
    // Text node
    if (typeof vnode.children === 'string') {
      return domNode.textContent === vnode.children;
    }
    return false;
  }

  // Check tag name
  if (domNode.tagName.toLowerCase() !== vnode.type) {
    return false;
  }

  // Check children count
  const domChildren = Array.from(domNode.childNodes);
  let vnodeChildren = vnode.children;

  if (!vnodeChildren) {
    return domChildren.length === 0;
  }

  if (!Array.isArray(vnodeChildren)) {
    // Single text child
    const firstChild = domChildren[0];
    return domChildren.length === 1 && !!firstChild && firstChild.textContent === vnodeChildren;
  }

  // Recursively check children
  for (let i = 0; i < domChildren.length && i < vnodeChildren.length; i++) {
    const childDom = domChildren[i];
    const childVNode = vnodeChildren[i];
    if (!childDom || !childVNode) continue;
    if (!checkNodeMatch(childDom, childVNode)) {
      return false;
    }
  }

  return true;
}

/**
 * Set hydration event context
 */
export function setHydrationContext(context: Record<string, EventListener>): void {
  Object.assign(hydrationContext, context);
}
