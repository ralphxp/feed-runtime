/**
 * FeedJS Runtime - DOM Node Creation
 * 
 * Creates real DOM nodes from VNodes with directive execution.
 */

import type { VNode as FeedVNode } from 'feedjs-core';
import { TextSymbol, FragmentSymbol } from 'feedjs-core';
import type { Scope, Directive } from '../directives/types.js';
import { executeText, executeBind, executeOn, executeIf, executeFor } from '../directives/index.js';
import { evaluate } from '../directives/evaluator.js';

/**
 * Create a DOM node from a VNode
 */
export function createNode(vnode: FeedVNode, scope: Scope): Node | null {
  const type = vnode.type;

  // Get directives from VNode
  const directives = (vnode as any).directives || [];

  // Check for f-if directive first
  const ifDir = directives.find((d: Directive) => d.type === 'if');
  if (ifDir && !executeIf(ifDir, scope)) {
    return null;
  }

  // Check for f-for directive
  const forDir = directives.find((d: Directive) => d.type === 'for');
  if (forDir) {
    // For f-for, execute returns a DocumentFragment
    const result = executeFor(vnode as any, forDir, scope);
    if (result.length > 0 && result[0]) {

      return result[0];
    }
    return null;
  }

  // Text node
  if (type === TextSymbol || (typeof type === 'string' && type.includes('text'))) {
    // Check for interpolation
    const vnodeWithInterp = vnode as any;
    if (vnodeWithInterp.interpolation) {
      const { evaluate } = require('../directives/evaluator.js');
      const value = evaluate(vnodeWithInterp.interpolation, scope);
      return document.createTextNode(String(value ?? ''));
    }
    return document.createTextNode(getTextContent(vnode));
  }

  // Fragment - create a document fragment
  if (type === FragmentSymbol) {
    return createFragment(vnode.children as FeedVNode[], scope);
  }

  // Element node
  if (typeof type === 'string') {
    const element = document.createElement(type);
    
    // Apply static props
    applyProps(element, vnode.props);
    
    // Execute directives
    // console.log('[createNode] Element:', type, 'directives:', directives);
    applyDirectives(element, vnode, scope);
    
    // Create children
    if (vnode.children) {
      if (Array.isArray(vnode.children)) {
        for (const child of vnode.children) {
          if (child) {
            const childNode = createNode(child as FeedVNode, scope);
            if (childNode) element.appendChild(childNode);
          }
        }
      } else if (typeof vnode.children === 'string') {

        element.textContent = vnode.children;
      }
    }

    
    
    return element;
  }

  // Fallback - create a div
  return document.createElement('div');
}

/**
 * Create a DocumentFragment from children
 */
function createFragment(children: FeedVNode[], scope: Scope): DocumentFragment {
  const fragment = document.createDocumentFragment();

  // Handle undefined/null children
  if (!children || !Array.isArray(children)) {
    return fragment;
  }

  for (const child of children) {
    if (child) {
      const domNode = createNode(child, scope);
      if (domNode) fragment.appendChild(domNode);
    }
  }
  return fragment;
}

/**
 * Get text content from a VNode
 */
function getTextContent(vnode: FeedVNode): string {
  if (typeof vnode.children === 'string') {
    return vnode.children;
  }
  return '';
}

/**
 * Apply props/attributes to a DOM element
 */
export function applyProps(element: Element, props: any): void {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    // Skip Feed internal directives
    if (key.startsWith('f-')) continue;

    // Boolean attributes
    if (value === true) {
      element.setAttribute(key, '');
    } else if (value === false || value === null || value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, String(value));
    }
  }
}

/**
 * Apply directives to an element
 */
function applyDirectives(element: HTMLElement, vnode: FeedVNode, scope: Scope): void {
  const directives = (vnode as any).directives || [];
  
  for (const dir of directives) {
    switch (dir.type) {
      case 'text':
        executeText(element, dir, scope);
        break;
      case 'bind':
        executeBind(element, dir, scope);
        break;
      case 'on':
        executeOn(element, dir, scope);
        break;
      // 'if' and 'for' are handled before this
    }
  }
}

/**
 * Create element with children (legacy function)
 */
export function createElementWithChildren(
  tag: string,
  props: any,
  children: any
): Element {
  const element = document.createElement(tag);
  applyProps(element, props);

  if (!children) return element;

  if (Array.isArray(children)) {
    const scope: Scope = { state: {}, locals: {} };
    for (const child of children) {
      if (child) {
        const childNode = createNode(child as FeedVNode, scope);
        if (childNode) element.appendChild(childNode);
      }
    }
  } else if (typeof children === 'string') {
    element.textContent = children;
  }

  return element;
}
