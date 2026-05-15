/*
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 */

import { SyntaxKind } from './types';
import type { INode } from './types';

/**
 * Visitor callbacks used while walking an AST.
 */
export interface WalkOptions {
  /**
   * Called before visiting a node's children.
   */
  enter?(node: INode, parent: INode | undefined, index: number): void;
  /**
   * Called after visiting a node's children.
   */
  leave?(node: INode, parent: INode | undefined, index: number): void;
}

function visit(node: INode, parent: INode | undefined, index: number, options: WalkOptions) {
  options.enter && options.enter(node, parent, index);
  if (node.type === SyntaxKind.Tag && Array.isArray(node.body)) {
    for (let i = 0; i < node.body.length; i++) {
      visit(node.body[i], node, i, options);
    }
  }
  options.leave && options.leave(node, parent, index);
}

/**
 * Traverse an AST depth-first.
 */
export function walk(ast: INode[], options: WalkOptions) {
  for (let i = 0; i < ast.length; i++) {
    visit(ast[i], void 0, i, options);
  }
}
