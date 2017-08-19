/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 * @version 1.0.0
 * @desc parse.ts
 */

import { IToken, tokenize, TokenKind } from './tokenize'
import { ILiteral, INode, SyntaxKind } from './types'

export function parse(input: string): INode[] {
  // TODO
  const tokens         = tokenize(input)
  const nodes: INode[] = []

  const context: { parent: INode | void, node: INode } = {
    parent: void 0,
    node: { start: 0, end: 0, type: SyntaxKind.Literal, value: '' },
  }

  const count = tokens.length
  let index   = 0
  let token: IToken
  while (index < count) {
    token = tokens[index]
    switch (token.type) {
      case TokenKind.Literal:
        (context.node as ILiteral).value += token.value
        break
      default:
        break
    }
  }
  return nodes
}
