/**
 * FeedJS Runtime - Patch Application
 * 
 * Applies patch operations to update the DOM.
 */

import type { Patch, VNode } from 'feedjs-core';
import { createNode, applyProps } from '../dom/createNode.js';
import { updateProps } from '../dom/updateProps.js';
import { bindEvents, unbindEvents } from '../dom/events.js';
import { triggerFeedEvent } from '../jquery/bridge.js';

// Event context for resolving handlers
const eventContext: Record<string, EventListener> = {};

/**
 * Apply patches to the DOM
 */
export function patch(container: Element, patches: Patch[]): void {
  // Apply patches sequentially and deterministically
  for (const patchOp of patches) {
    applyPatch(container, patchOp);
  }
}

/**
 * Apply a single patch operation
 */
function applyPatch(container: Element, patchOp: Patch): void {
  const patchType = patchOp.type;

  if (patchType === 'CREATE') {
    applyCreatePatch(container, patchOp);
  } else if (patchType === 'REMOVE') {
    applyRemovePatch(container, patchOp);
  } else if (patchType === 'REPLACE') {
    applyReplacePatch(container, patchOp);
  } else if (patchType === 'UPDATE_PROPS') {
    applyUpdatePropsPatch(container, patchOp);
  } else if (patchType === 'MOVE') {
    applyMovePatch(container, patchOp);
  }
}

/**
 * Apply CREATE patch
 */
function applyCreatePatch(container: Element, patchOp: Patch): void {
  const vnode = patchOp.node;
  if (!vnode) return;

  const domNode = createNode(vnode, { state: {}, locals: {} });
  if (!domNode) return;
  
  const index = patchOp.index ?? 0;

  // Insert at position
  const children = Array.from(container.childNodes);
  const refNode = children[index];
  if (refNode) {
    container.insertBefore(domNode, refNode);
  } else {
    container.appendChild(domNode);
  }

  // Bind events
  if (domNode instanceof Element) {
    bindEvents(domNode, vnode.props as Record<string, unknown>, eventContext);
  }
}

/**
 * Apply REMOVE patch
 */
function applyRemovePatch(container: Element, patchOp: Patch): void {
  const index = patchOp.index ?? 0;
  const children = Array.from(container.childNodes);
  const nodeToRemove = children[index];

  if (nodeToRemove) {
    // Unbind events
    if (nodeToRemove instanceof Element) {
      unbindEvents(nodeToRemove);
    }
    container.removeChild(nodeToRemove);
  }
}

/**
 * Apply REPLACE patch
 */
function applyReplacePatch(container: Element, patchOp: Patch): void {
  const vnode = patchOp.node;
  if (!vnode) return;

  const domNode = createNode(vnode, { state: {}, locals: {} });
  if (!domNode) return;
  
  const index = patchOp.index ?? 0;
  const children = Array.from(container.childNodes);
  const nodeToReplace = children[index];

  if (nodeToReplace) {
    // Unbind events from old node
    if (nodeToReplace instanceof Element) {
      unbindEvents(nodeToReplace);
    }
    container.replaceChild(domNode, nodeToReplace);
  } else {
    container.appendChild(domNode);
  }

  // Bind events for new node
  if (domNode instanceof Element) {
    bindEvents(domNode, vnode.props as Record<string, unknown>, eventContext);
  }
}

/**
 * Apply UPDATE_PROPS patch
 */
function applyUpdatePropsPatch(container: Element, patchOp: Patch): void {
  const index = patchOp.index ?? 0;
  const children = Array.from(container.childNodes);
  const element = children[index];

  if (element instanceof Element && patchOp.props) {
    // Cast to proper type
    const props = patchOp.props as Record<string, string | number | boolean | null | undefined>;
    updateProps(element, null, props);
  }
}

/**
 * Apply MOVE patch
 */
function applyMovePatch(container: Element, patchOp: Patch): void {
  const fromIndex = patchOp.from ?? 0;
  const toIndex = patchOp.to ?? 0;
  const children = Array.from(container.childNodes);

  const nodeToMove = children[fromIndex];
  if (nodeToMove) {
    const targetChildren = container.childNodes;
    const refNode = targetChildren[toIndex];
    if (refNode) {
      container.insertBefore(nodeToMove, refNode);
    } else {
      container.appendChild(nodeToMove);
    }
  }
}

/**
 * Set event context for patch application
 */
export function setEventContext(context: Record<string, EventListener>): void {
  Object.assign(eventContext, context);
}
