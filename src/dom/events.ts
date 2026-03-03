/**
 * FeedJS Runtime - Event Binding System
 * 
 * Handles event binding and cleanup for DOM elements.
 */

// Event context for resolving handlers
interface EventContext {
  [handlerName: string]: EventListener;
}

// Store for event listeners (for cleanup)
interface BoundEvent {
  element: Element;
  eventName: string;
  handler: EventListener;
  options: AddEventListenerOptions;
}

const boundEvents: BoundEvent[] = [];

/**
 * Bind events to an element based on VNode props
 */
export function bindEvents(
  element: Element,
  props: Record<string, unknown> | null,
  context: EventContext
): void {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    // Check if it's an event handler (onEventName)
    const secondChar = key[1];
    if (key.length < 3 || !key.startsWith('on') || !secondChar || secondChar !== secondChar.toUpperCase()) {
      continue;
    }

    // Extract event name (onClick -> click)
    const char2 = key[2];
    if (!char2) continue;
    const eventName = char2.toLowerCase() + key.slice(3);
    const handlerName = value as string;

    // Resolve handler from context
    const handler = context[handlerName];
    if (!handler) {
      console.warn(`Event handler '${handlerName}' not found in context`);
      continue;
    }

    // Parse modifiers
    const modifierMatch = eventName.match(/\.(.+)$/);
    let actualEventName = eventName;
    const modifiers: string[] = [];

    if (modifierMatch && modifierMatch.index !== undefined) {
      actualEventName = eventName.slice(0, modifierMatch.index);
      const modVal = modifierMatch[1];
      if (modVal) {
        modifiers.push(...modVal.split('.'));
      }
    }

    // Create wrapped handler with modifiers
    const wrappedHandler = createEventHandler(handler, modifiers);

    // Add event listener
    element.addEventListener(actualEventName, wrappedHandler, false);

    // Store for cleanup
    boundEvents.push({
      element,
      eventName: actualEventName,
      handler: wrappedHandler,
      options: { capture: false },
    });
  }
}

/**
 * Create an event handler with modifiers
 */
function createEventHandler(handler: EventListener, modifiers: string[]): EventListener {
  return (event: Event) => {
    let shouldCall = true;

    // Apply modifiers
    for (const modifier of modifiers) {
      switch (modifier) {
        case 'stop':
          event.stopPropagation();
          break;
        case 'prevent':
          event.preventDefault();
          break;
        case 'self':
          shouldCall = event.target === event.currentTarget;
          break;
        // Add more modifiers as needed
      }
    }

    if (shouldCall) {
      handler(event);
    }
  };
}

/**
 * Unbind all events from an element
 */
export function unbindEvents(element: Element): void {
  for (let i = boundEvents.length - 1; i >= 0; i--) {
    const bound = boundEvents[i];
    if (!bound) continue;
    if (bound.element === element) {
      element.removeEventListener(bound.eventName, bound.handler, bound.options.capture);
      boundEvents.splice(i, 1);
    }
  }
}

/**
 * Unbind all events globally (for cleanup)
 */
export function unbindAllEvents(): void {
  for (const bound of boundEvents) {
    bound.element.removeEventListener(bound.eventName, bound.handler, bound.options.capture);
  }
  boundEvents.length = 0;
}
