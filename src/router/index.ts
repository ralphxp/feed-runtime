/**
 * FeedJS Router - Core Implementation
 * 
 * Client-side routing with History API.
 */

import { mount } from '../renderer/mount.js';
import type { Route, RouterOptions, Router } from './types.js';

/**
 * Create a router instance
 */
export function createRouter(options: RouterOptions): Router {
  const { routes, root, getState } = options;
  let currentPath = '/';
  let currentPageModule: any = null;

  /**
   * Re-render the current page with fresh state
   */
  async function reRender() {
    if (!currentPageModule) return;
    
    try {
      // Inject styles if available
      if (currentPageModule.injectStyles) {
        currentPageModule.injectStyles();
      }
      
      const page = currentPageModule.default;
      
      if (!page) {
        console.error('[FeedJS Router] No default export from page');
        return;
      }

      const state = getState();
      const vnode = page(state, {});

      mount(root, vnode, state);
    } catch (error) {
      console.error('[FeedJS Router] Re-render error:', error);
    }
  }

  /**
   * Subscribe to state changes
   */
  const state = getState();
  if (state.subscribe) {
    state.subscribe(reRender);
  }

  /**
   * Resolve a path to a page and mount it
   */
  async function resolve(path: string) {
    
    const match = routes.find(r => r.path === path);

    if (!match) {
      console.warn('[FeedJS Router] Route not found:', path);
      return;
    }

    currentPath = path;

    try {
      const mod = await match.page();
      currentPageModule = mod;
      
      // Inject styles if available
      if (mod.injectStyles) {
        mod.injectStyles();
      }
      
      const page = mod.default;
      

      if (!page) {
        console.error('[FeedJS Router] No default export from page');
        return;
      }

      const state = getState();
      const vnode = page(state, {});

      mount(root, vnode, state);
    } catch (error) {

      throw new Error(`Failed to load page for path: ${currentPath} ${ error instanceof Error ? error.message : 'Unknown error' }`);
      
    }
  }

  /**
   * Navigate to a path
   */
  function navigate(path: string) {
    if (path === currentPath) return;
    
    history.pushState({}, '', path);
    resolve(path);
  }

  /**
   * Handle browser back/forward
   */
  function handlePopState() {
    resolve(location.pathname);
  }

  /**
   * Intercept internal link clicks
   */
  function handleClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');

    if (!anchor) return;

    const href = anchor.getAttribute('href');

    if (href && (href.startsWith('/') || href.startsWith('.'))) {
      // Don't intercept external links or hash links
      if (href.startsWith('http') || href.startsWith('#')) return;
      
      e.preventDefault();
      navigate(href);
    }
  }

  // Set up event listeners
  window.addEventListener('popstate', handlePopState);
  document.addEventListener('click', handleClick);

  return {
    /**
     * Start the router
     */
    start() {
      resolve(location.pathname || '/');
    },

    /**
     * Navigate to a path
     */
    navigate,

    /**
     * Get current path
     */
    getCurrentPath() {
      return currentPath;
    }
  };
}
