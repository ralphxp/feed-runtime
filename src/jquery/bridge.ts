/**
 * FeedJS Runtime - jQuery Bridge
 * 
 * Optional jQuery compatibility layer.
 */

interface JQuery {
  (selector: string | Element | Document): JQueryInstance;
  (element: Element): JQueryInstance;
}

interface JQueryInstance {
  on(event: string, handler: EventListener): JQueryInstance;
  trigger(event: string): JQueryInstance;
  find(selector: string): JQueryInstance;
  append(child: Node): JQueryInstance;
  remove(): JQueryInstance;
  attr(name: string, value: string): JQueryInstance;
  html(content: string): JQueryInstance;
  text(content: string): JQueryInstance;
}

// Declare global jQuery
declare const jQuery: JQuery | undefined;

// Store for jQuery wrapped elements
const jqueryCache = new WeakMap<Element, JQueryInstance>();

/**
 * Check if jQuery is available
 */
export function hasJQuery(): boolean {
  return typeof jQuery !== 'undefined' && jQuery !== null;
}

/**
 * Get jQuery-wrapped element (cached)
 */
export function $(element: Element): JQueryInstance | null {
  if (!hasJQuery()) return null;

  if (jqueryCache.has(element)) {
    return jqueryCache.get(element)!;
  }

  const wrapped = jQuery!(element);
  jqueryCache.set(element, wrapped);
  return wrapped;
}

/**
 * Initialize jQuery bridge
 * 
 * This must be called after jQuery is loaded
 */
export function initJQueryBridge(): void {
  if (!hasJQuery()) {
    console.warn('jQuery not found - jQuery bridge not initialized');
    return;
  }

  // Add custom event support
  // This allows components to communicate via jQuery events
  console.log('jQuery bridge initialized');
}

/**
 * Trigger a custom FeedJS event on an element
 */
export function triggerFeedEvent(element: Element, eventName: string): void {
  const $el = $(element);
  if ($el) {
    $el.trigger(`feedjs:${eventName}`);
  }
}

/**
 * Listen for a custom FeedJS event on an element
 */
export function onFeedEvent(
  element: Element,
  eventName: string,
  handler: EventListener
): void {
  const $el = $(element);
  if ($el) {
    $el.on(`feedjs:${eventName}`, handler);
  }
}
