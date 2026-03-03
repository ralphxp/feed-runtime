/**
 * FeedJS Runtime - Types
 * 
 * Core types for directive execution and scoping.
 */

import type { VNode as FeedVNode } from 'feedjs-core';

export interface Directive {
  type: 'text' | 'bind' | 'on' | 'if' | 'for' | 'key';
  name: string;
  value: string;
  expression: string;
  modifiers?: string[];
}

export interface VNode {
  kind: 'element' | 'text';
  tag?: string;
  props?: Record<string, any>;
  children?: VNode[];
  directives?: Directive[];
  key?: string;
}

export interface Scope {
  state: any;
  locals: Record<string, any>;
}

// Type for VNode from feedjs-core
export type FeedJSVNode = FeedVNode;
