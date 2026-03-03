/**
 * FeedJS Router - Types
 */

export interface Route {
  path: string;
  page: () => Promise<any> | any;
}

export interface RouterOptions {
  routes: Route[];
  root: HTMLElement;
  getState: () => any;
}

export interface Router {
  start: () => void;
  navigate: (path: string) => void;
  getCurrentPath: () => string;
}
