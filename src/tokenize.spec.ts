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

let index = 0

function token(value: string, type: TokenKind = TokenKind.Literal, start = index) {
  const v = {
    start: start,
    end: start + value.length,
    value,
    type,
  }
  index   = v.end
  return v
}

const cases: ICase[] = [
  {
    name: 'single Literal',
    input: 'hello',
    tokens: [
      token('hello', TokenKind.Literal, 0),
    ],
  },
  {
    name: 'Literal end with <',
    input: 'hello<',
    tokens: [
      token('hello', void 0, 0),
      token('<'),
    ],
  },
  {
    name: 'Literal unexpected <',
    input: 'hello< world',
    tokens: [
      token('hello', void 0, 0),
      token('< world'),
    ],
  },
  {
    name: 'OpenTag EOF',
    input: '<div',
    tokens: [
      token('div', TokenKind.OpenTag, 1),
    ],
  },
  {
    name: 'attribute names',
    input: '<div a1 \'b2\' "c3" \'d4\'e5 \'f6"\' "g7\'"></div>',
    tokens: [
      token('div', TokenKind.OpenTag, 1),
      token(' ', TokenKind.Whitespace),
      token('a1'),
      token(' ', TokenKind.Whitespace),
      token('\'b2\''),
      token(' ', TokenKind.Whitespace),
      token('"c3"'),
      token(' ', TokenKind.Whitespace),
      token('\'d4\''),
      token('e5'),
      token(' ', TokenKind.Whitespace),
      token('\'f6"\''),
      token(' ', TokenKind.Whitespace),
      token('"g7\'"'),
      token('', TokenKind.OpenTagEnd),
      token('div', TokenKind.CloseTag, index + 3),
    ],
  },
  {
    name: 'attribute values',
    input: '<div a b= c=1 d e = f = g \'h\'=i "j"k=lmn o=\'pq\' r="st"u>M</div>',
    tokens: [
      token('div', TokenKind.OpenTag, 1),
      token(' ', TokenKind.Whitespace),
      token('a'),
      token(' ', TokenKind.Whitespace),
      token('b'),
      token('='),
      token(' ', TokenKind.Whitespace),
      token('c'),
      token('='),
      token('1'),
      token(' ', TokenKind.Whitespace),
      token('d'),
      token(' ', TokenKind.Whitespace),
      token('e'),
      token(' ', TokenKind.Whitespace),
      token('='),
      token(' ', TokenKind.Whitespace),
      token('f'),
      token(' ', TokenKind.Whitespace),
      token('='),
      token(' ', TokenKind.Whitespace),
      token('g'),
      token(' ', TokenKind.Whitespace),
      token('\'h\''),
      token('='),
      token('i'),
      token(' ', TokenKind.Whitespace),
      token('"j"'),
      token('k'),
      token('='),
      token('lmn'),
      token(' ', TokenKind.Whitespace),
      token('o'),
      token('='),
      token('\'pq\''),
      token(' ', TokenKind.Whitespace),
      token('r'),
      token('='),
      token('"st"'),
      token('u'),
      token('', TokenKind.OpenTagEnd),
      token('M', void 0, index + 1),
      token('div', TokenKind.CloseTag, index + 2),
    ],
  },
  {
    name: 'normal doctype',
    input: '<!doctype html>',
    tokens: [
      token('!doctype', TokenKind.OpenTag, 1),
      token(' ', TokenKind.Whitespace),
      token('html', TokenKind.Literal),
      token('', TokenKind.OpenTagEnd),
    ],
  },
  {
    name: 'unexpected eof end doctype',
    input: '<!doctype',
    tokens: [
      token('!doctype', TokenKind.OpenTag, 1),
    ],
  },
  {
    name: 'unexpected eof in doctype',
    input: '<!doctyp',
    tokens: [
      token('!', TokenKind.OpenTag, 1),
      token('doctyp'),
    ],
  },
  {
    name: 'normal comment',
    input: '<!-- hello world -->',
    tokens: [
      token('!--', TokenKind.OpenTag, 1),
      token(' hello world '),
      token('--', TokenKind.OpenTagEnd),
    ],
  },
  {
    name: 'short comment',
    input: '<? hello world ?><!- hello world ->',
    tokens: [
      token('', TokenKind.OpenTag, 1),
      token('? hello world ?'),
      token('', TokenKind.OpenTagEnd),
      token('!', TokenKind.OpenTag, index + 2),
      token('- hello world -'),
      token('', TokenKind.OpenTagEnd),
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
