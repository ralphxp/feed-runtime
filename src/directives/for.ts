/**
 * FeedJS Runtime - f-for Directive
 * 
 * Handles list rendering.
 */

import { evaluate, parseForExpression } from './evaluator.js';
import type { Directive, Scope, VNode } from './types.js';
import { createNode } from '../dom/createNode.js';

/**
 * Clone VNode without the for directive to prevent infinite loops
 */
function cloneWithoutFor(vnode: VNode): VNode {
  // Handle children - could be string, array, or undefined
  let clonedChildren: VNode[] | string | undefined;
  if (Array.isArray(vnode.children)) {
    clonedChildren = vnode.children.map(cloneWithoutFor);
  } else if (typeof vnode.children === 'string') {
    clonedChildren = vnode.children;
  } else {
    clonedChildren = [];
  }
  
  return {
    kind: vnode.kind,
    tag: vnode.tag ?? '',
    props: { ...vnode.props },
    children: clonedChildren,
    directives: vnode.directives ? vnode.directives.filter(d => d.type !== 'for') : [],
    key: vnode.key ?? ''
  };
}

/**
 * Execute f-for directive
 * Renders a list of nodes for each item in the source array
 */
export function executeFor(
  vnode: VNode,
  dir: Directive,
  scope: Scope
): Node[] {
  const parsed = parseForExpression(dir.expression);
  if (!parsed) {
    console.error(`[FeedJS] Invalid f-for expression: ${dir.expression}`);
    return [];
  }

  const { item: itemName, source: sourceName } = parsed;
  
  // Evaluate the source array
  const list = evaluate(sourceName, scope);
  
  if (!Array.isArray(list)) {
    return [];
  }

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < list.length; i++) {
    // Create a new scope with the loop variable
    const childScope: Scope = {
      state: scope.state,
      locals: {
        ...scope.locals,
        [itemName]: list[i],
        $index: i
      }
    };

    // Clone the vnode without the for directive
    const cloned = cloneWithoutFor(vnode);
    
    // Create the DOM node
    const node = createNode(cloned as any, childScope);
    
    if (node) {
      fragment.appendChild(node);
    }
  }

  return [fragment];
}
