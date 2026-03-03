# FeedJS Runtime

FeedJS Runtime provides the browser-side functionality to render FeedJS templates. It handles DOM creation, event binding, state management, and client-side routing.

## Features

- **DOM Rendering**: Creates actual DOM elements from VNodes
- **Event Binding**: Handles `f-on:*` directives for DOM events
- **State Reactivity**: Simple reactive state management
- **Client-Side Router**: History-based routing with component-level hot module replacement
- **jQuery Bridge**: Optional integration with jQuery

## Installation

```bash
npm install feedjs-runtime
```

## Usage

### Basic Rendering

```typescript
import { mount } from 'feedjs-runtime';
import { createVDOM } from 'feedjs-core';

const state = {
  message: 'Hello, World!',
  items: ['Apple', 'Banana', 'Cherry']
};

const vnode = createVDOM(templateIR, state);
mount(document.getElementById('app')!, vnode, state);
```

### Router Setup

```typescript
import { createRouter } from 'feedjs-runtime';

const router = createRouter({
  root: document.getElementById('app')!,
  getState: () => window.__STATE__,
  routes: [
    { path: '/', page: () => import('./pages/home.feedjs.html') },
    { path: '/about', page: () => import('./pages/about.feedjs.html') },
    { path: '/users/:id', page: () => import('./pages/user.feedjs.html') }
  ]
});

router.start();
```

### State Management

```typescript
// Define reactive state
const state = {
  count: 0,
  increment() {
    this.count++;
    notify(); // Trigger re-render
  },
  subscribe(fn) {
    subscribers.add(fn);
  }
};

function notify() {
  subscribers.forEach(fn => fn());
}
```

## API

### `mount(container: Element, vnode: VNode, state: object): void`

Mounts a VNode tree to a DOM container with the given state.

### `createRouter(options: RouterOptions): Router`

Creates a client-side router instance.

**Router Options:**
- `root` - Root DOM element for mounting pages
- `getState` - Function that returns the current application state
- `routes` - Array of route definitions

**Route Definition:**
```typescript
interface Route {
  path: string;           // Route path (supports :param for params)
  page: () => Promise<any>;  // Function that returns a page module
}
```

### Router Methods

- `start()` - Start the router and navigate to the initial path
- `navigate(path: string)` - Navigate to a path programmatically
- `getCurrentPath()` - Get the current route path

## Event Binding

The runtime handles `f-on:*` directives automatically:

```html
<button f-on:click="increment">Click me</button>
<input f-on:input="handleInput">
<form f-on:submit="handleSubmit">
```

## Direct Runtime Evaluation

The evaluator function can be used to evaluate expressions at runtime:

```typescript
import { evaluate } from 'feedjs-runtime';

const scope = { 
  state: { price: 100, quantity: 2 },
  locals: {} 
};

const result = evaluate('price * quantity', scope); // Returns 200
```

## License

MIT
