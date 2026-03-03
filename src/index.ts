/**
 * FeedJS Runtime - Public API
 * 
 * DOM Renderer and jQuery Bridge for FeedJS
 * 
 * @packageDocumentation
 */

// Re-export types from feedjs-core
export type { VNode, Patch, PatchType, PatchList } from 'feedjs-core';

// Re-export from renderers
export { mount, unmount } from './renderer/mount.js';
export { patch, setEventContext } from './renderer/patch.js';
export { hydrate, checkHydration, setHydrationContext } from './renderer/hydrate.js';

// Re-export from DOM utilities
export { createNode, applyProps, createElementWithChildren } from './dom/createNode.js';
export { updateProps, removeProps } from './dom/updateProps.js';
export { bindEvents, unbindEvents, unbindAllEvents } from './dom/events.js';

// Re-export from jQuery bridge
export { 
  hasJQuery, 
  $, 
  initJQueryBridge, 
  triggerFeedEvent, 
  onFeedEvent 
} from './jquery/bridge.js';

// Re-export from router
export { createRouter } from './router/index.js';
