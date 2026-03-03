/**
 * FeedJS Runtime - Mount
 * 
 * Mounts VDOM to a real DOM container with directive execution.
 */

import type { VNode as FeedVNode } from 'feedjs-core';
import { createNode, applyProps } from '../dom/createNode.js';
import { bindEvents, unbindEvents } from '../dom/events.js';
import { triggerFeedEvent, hasJQuery } from '../jquery/bridge.js';
import type { Scope } from '../directives/types.js';

interface MountContext {
  eventContext: Record<string, EventListener>;
}

// Store mounted root nodes
const mountedRoots = new WeakMap<Element, Node>();

/**
 * Mount a VNode to a container element
 */
export function mount(container: Element, vnode: FeedVNode, state: any = {}): void {
  // Clear container
  container.innerHTML = '';
  console.log('[FeedJS Mount] Starting mount with state keys:', Object.keys(state));
  console.log('[FeedJS Mount] VNode type:', vnode.type);
  // Create scope with state
  const scope: Scope = {
    state,
    locals: {}
  };

  // Create DOM from VNode
  const domNode = createNode(vnode, scope);

  if (domNode) {
    // Mount and store reference
    container.appendChild(domNode);

    // Bind events if present
    const context: MountContext = { eventContext: {} };
    bindEventsRecursive(domNode, vnode.props, context);

    // Trigger mounted event (only for Elements)
    if (domNode instanceof Element) {
      triggerFeedEvent(domNode, 'mounted');

      // jQuery bridge - use any to avoid complex typings
      if (hasJQuery()) {
        const jq = (window as unknown as { jQuery: unknown }).jQuery;
        if (jq && typeof jq === 'function') {
          (jq as (el: Element) => { trigger: (event: string) => void })(domNode).trigger('feedjs:mounted');
        }
      }
    }
  }
}

/**
 * Bind events recursively
 */
function bindEventsRecursive(
  domNode: Node,
  props: any,
  context: MountContext
): void {
  if (domNode instanceof Element) {
    bindEvents(domNode, props as Record<string, unknown>, context.eventContext);

    // Process children
    for (const child of domNode.childNodes) {
      bindEventsRecursive(child, null, context);
    }
  }
}

/**
 * Unmount from a container
 */
export function unmount(container: Element): void {
  const root = mountedRoots.get(container);
  if (root) {
    if (root instanceof Element) {
      unbindEvents(root);
    }
    container.innerHTML = '';
    mountedRoots.delete(container);
  }
}
