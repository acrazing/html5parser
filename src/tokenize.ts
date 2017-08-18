/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:29
 * @version 1.0.0
 * @desc tokenize.ts
 */

enum State {
  Literal              = 'Literal',
  BeforeOpenTag        = 'BeforeOpenTag', // <
  OpeningTag           = 'OpeningTag',
  AfterOpenTag         = 'AfterOpenTag',
  InValueNq            = 'InValueNq',
  InValueSq            = 'InValueSq',
  InValueDq            = 'InValueDq',
  ClosingOpenTag       = 'ClosingOpenTag',
  OpeningSpecial       = 'OpeningSpecial', // after <!
  OpeningDoctype       = 'OpeningDoctype', // after <!d, <!D
  OpeningNormalComment = 'OpeningNormalComment', // after <!-
  InNormalComment      = 'InNormalComment', // after <!--
  InShortComment       = 'InShortComment', // after <!, not <!--, <!doctype
  ClosingNormalComment = 'ClosingNormalComment', // after -
  ClosingTag           = 'ClosingTag', // after </
  InScript             = 'InScript',
  InStyle              = 'InStyle',
  ClosingScript        = 'ClosingScript',
  ClosingStyle         = 'ClosingStyle',
}

export enum TokenKind {
  Literal    = 'Literal', // abc, <, -, --
  OpenTag    = 'OpenTag', // <div, <!doctype, <!--, <!
  OpenTagEnd = 'OpenTagEnd', // >, -->, />
  CloseTag   = 'CloseTag', // </[^>]>
}

export interface IToken {
  start: number;
  end: number;
  type: TokenKind;
}

let state: State
let buffer: string
let bufSize: number
let sectionStart: number
let index: number
let tokens: IToken[]

function makeCodePoints(input: string) {
  return input.split('').map((c) => c.charCodeAt(0))
}

const doctype = makeCodePoints('<!doctype')
const DOCTYPE = makeCodePoints('<!DOCTYPE')

enum Chars {
  _S = ' '.charCodeAt(0),
  _N = '\n'.charCodeAt(0),
  _T = '\t'.charCodeAt(0),
  _R = '\r'.charCodeAt(0),
  _F = '\f'.charCodeAt(0),
  Lt = '<'.charCodeAt(0),
  Ep = '!'.charCodeAt(0),
  Cl = '-'.charCodeAt(0),
  Sl = '/'.charCodeAt(0),
  Gt = '>'.charCodeAt(0),
  Qm = '?'.charCodeAt(0),
  La = 'a'.charCodeAt(0),
  Lz = 'z'.charCodeAt(0),
  Ua = 'A'.charCodeAt(0),
  Uz = 'Z'.charCodeAt(0),
  Eq = '='.charCodeAt(0),
  Sq = '\''.charCodeAt(0),
  Dq = '"'.charCodeAt(0),
  Ld = 'd'.charCodeAt(0),
  Ud = 'D'.charCodeAt(0),
}

function isWhiteSpace(c: number) {
  return c === Chars._S
    || c === Chars._N
    || c === Chars._T
    || c === Chars._T
    || c === Chars._R
    || c === Chars._F
}

function init(input: string) {
  state        = State.Literal
  buffer       = input
  bufSize      = input.length
  sectionStart = 0
  index        = 0
  tokens       = []
}

export function tokenize(input: string): IToken[] {
  init(input)
  while (index < bufSize) {
    const c = buffer.charCodeAt(index)
    switch (state) {
      case State.Literal:
        parseLiteral(c)
        break
      case State.BeforeOpenTag:
        parseBeforeOpenTag(c)
        break
      case State.OpeningTag:
        parseOpeningTag(c)
        break
      case State.AfterOpenTag:
        parseAfterOpenTag(c)
        break
      case State.InValueNq:
        parseInValueNq(c)
        break
      case State.InValueSq:
        parseInValueSq(c)
        break
      case State.InValueDq:
        parseInValueDq(c)
        break
      case State.ClosingOpenTag:
        parseClosingOpenTag(c)
        break
      case State.OpeningSpecial:
        parseOpeningSpecial(c)
        break
      case State.OpeningDoctype:
        parseOpeningDoctype(c)
        break
      case State.OpeningNormalComment:
        parseOpeningNormalComment(c)
        break
      case State.InNormalComment:
        parseNormalComment(c)
        break
      case State.InShortComment:
        parseShortComment(c)
        break
      case State.ClosingNormalComment:
        parseClosingNormalComment(c)
        break
      case State.ClosingTag:
        parseClosingTag(c)
        break
      case State.InScript:
        parseScript(c)
        break
      case State.InStyle:
        parseStyle(c)
        break
      default:
        unexpected()
        break
    }
    index++
  }
  return tokens
}

function emitToken(kind: TokenKind, newState = state, end = index) {
  tokens.push({ type: kind, start: sectionStart, end })
  sectionStart = end
  state        = newState
}

function parseLiteral(c: number) {
  if (c === Chars.Lt) {
    emitToken(TokenKind.Literal, State.BeforeOpenTag)
  }
}

function parseBeforeOpenTag(c: number) {
  if ((c >= Chars.La && c <= Chars.Lz) || (c >= Chars.Ua && c <= Chars.Uz)) {
    state        = State.OpeningTag
    sectionStart = index
  } else if (c === Chars.Sl) {
    state        = State.ClosingTag
    sectionStart = index + 1
  } else if (c === Chars.Lt) {
    emitToken(TokenKind.Literal)
  } else if (c === Chars.Ep) {
    state        = State.OpeningSpecial
    sectionStart = index
  } else if (c === Chars.Qm) {
    // treat as short comment
    sectionStart = index
    emitToken(TokenKind.OpenTag, State.InShortComment)
  } else {
    // any other chars covert to normal state
    state = State.Literal
  }
}

function parseOpeningTag(c: number) {
  if (isWhiteSpace(c)) {
    emitToken(TokenKind.OpenTag, State.AfterOpenTag)
  } else if (c === Chars.Gt) {
    emitToken(TokenKind.OpenTag)
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else if (c === Chars.Sl) {
    emitToken(TokenKind.OpenTag, State.AfterOpenTag)
  }
}

function parseAfterOpenTag(c: number) {
  if (c === Chars.Gt) {
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else if (c === Chars.Sl) {
    state        = State.ClosingOpenTag
    sectionStart = index
  } else if (c === Chars.Eq) {
    emitToken(TokenKind.Literal, void 0, index + 1)
  } else if (c === Chars.Sq) {
    state        = State.InValueSq
    sectionStart = index
  } else if (c === Chars.Dq) {
    state        = State.InValueDq
    sectionStart = index
  } else if (isWhiteSpace(c)) {
    // maybe need to emit whitespace
    sectionStart = index
  } else {
    state        = State.InValueNq
    sectionStart = index
  }
}

function parseInValueNq(c: number) {
  if (c === Chars.Gt) {
    emitToken(TokenKind.Literal)
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else if (c === Chars.Sl) {
    emitToken(TokenKind.Literal, State.ClosingOpenTag)
  } else if (c === Chars.Eq) {
    emitToken(TokenKind.Literal)
    emitToken(TokenKind.Literal, State.AfterOpenTag, index + 1)
  } else if (isWhiteSpace(c)) {
    emitToken(TokenKind.Literal, State.AfterOpenTag)
  }
}

function parseInValueSq(c: number) {
  if (c === Chars.Sq) {
    emitToken(TokenKind.Literal, State.AfterOpenTag, index + 1)
  }
}

function parseInValueDq(c: number) {
  if (c === Chars.Dq) {
    emitToken(TokenKind.Literal, State.AfterOpenTag, index + 1)
  }
}

function parseClosingOpenTag(c: number) {
  if (c === Chars.Gt) {
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else {
    emitToken(TokenKind.Literal, State.AfterOpenTag)
  }
}

function parseOpeningSpecial(c: number) {
  switch (c) {
    case Chars.Cl:
      state = State.OpeningNormalComment
      break
    case Chars.Ld:
    case Chars.Ud:
      state = State.OpeningDoctype
      break
    default:
      break
  }
}

function parseOpeningDoctype(c: number) {
  const offset = index - sectionStart
  if (offset === doctype.length) {
    if (!isWhiteSpace(c)) {
      unexpected()
    }
    emitToken(TokenKind.OpenTag, State.AfterOpenTag)
  } else if (doctype[offset] !== c && DOCTYPE[offset] !== c) {
    emitToken(TokenKind.OpenTag, State.InShortComment, sectionStart + 2)
  }
}

function parseOpeningNormalComment(c: number) {
  if (c !== Chars.Cl) {
    emitToken(TokenKind.OpenTag, State.InShortComment, sectionStart + 2)
  } else if (index === sectionStart + 4) {
    emitToken(TokenKind.OpenTag, State.InNormalComment, index + 1)
  }
}

function parseNormalComment(c: number) {
  if (c === Chars.Cl) {
    emitToken(TokenKind.Literal, State.ClosingNormalComment)
  }
}

function parseShortComment(c: number) {
  if (c === Chars.Gt) {
    emitToken(TokenKind.Literal)
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  }
}

function parseClosingNormalComment(c: number) {
  const offset = index - sectionStart
  if (offset === 2) {
    if (c === Chars.Gt) {
      emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
    } else if (c === Chars.Sl) {
      emitToken(TokenKind.Literal, void 0, sectionStart + 1)
    } else {
      state = State.InNormalComment
    }
  } else if (c !== Chars.Cl) {
    state = State.InNormalComment
  }
}

function parseClosingTag(c: number) {
  if (c === Chars.Gt) {
    emitToken(TokenKind.CloseTag, State.Literal, index + 1)
  }
}

function parseScript(c: number) {
  // TODO
  if (c === Chars.Lt) {
    emitToken(TokenKind.Literal, State.ClosingScript)
  }
}

function parseStyle(c: number) {
  // TODO
  if (c === Chars.Lt) {
    emitToken(TokenKind.Literal, State.ClosingStyle)
  }
}

function unexpected() {
  throw new SyntaxError(`Unexpected token "${buffer.charAt(index)}" at ${index} when parsing ${state}`)
}
