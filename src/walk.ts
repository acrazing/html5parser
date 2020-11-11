/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 * @version 1.0.0
 * @desc walk.ts
 */

import { INode, SyntaxKind } from './types';

export interface WalkOptions {
  enter?(node: INode, parent: INode | undefined, index: number): void;
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

export function walk(ast: INode[], options: WalkOptions) {
  for (let i = 0; i < ast.length; i++) {
    visit(ast[i], void 0, i, options);
  }
}
