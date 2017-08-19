/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 14:15:25
 * @version 1.0.0
 * @desc tokenize.spec.ts
 */

import * as assert from 'assert'
import { IToken, tokenize, TokenKind } from './tokenize'

interface ICase {
  name: string;
  input: string;
  tokens: IToken[];
}

const cases: ICase[] = [
  {
    name: 'single Literal',
    input: 'hello',
    tokens: [
      {
        start: 0,
        end: 'hello'.length,
        value: 'hello',
        type: TokenKind.Literal,
      },
    ],
  },
  {
    name: 'Literal end with <',
    input: 'hello<',
    tokens: [
      {
        start: 0,
        end: 'hello'.length,
        value: 'hello',
        type: TokenKind.Literal,
      },
      {
        start: 'hello'.length,
        end: 'hello'.length + 1,
        value: '<',
        type: TokenKind.Literal,
      },
    ],
  },
  {
    name: 'Literal unexpected <',
    input: 'hello< world',
    tokens: [
      {
        start: 0,
        end: 'hello'.length,
        value: 'hello',
        type: TokenKind.Literal,
      },
      {
        start: 'hello'.length,
        end: 'hello< world'.length,
        value: '< world',
        type: TokenKind.Literal,
      },
    ],
  },
  {
    name: 'OpenTag EOF',
    input: '<div',
    tokens: [
      {
        start: 1,
        end: 4,
        value: 'div',
        type: TokenKind.OpenTag,
      },
    ],
  },
]

describe('simple cases', () => {
  for (const _case of cases) {
    it(`case "${_case.name}"`, () => {
      const tokens = tokenize(_case.input)
      assert.deepEqual(tokens, _case.tokens)
    })
  }
})
