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
  BeforeOpenTag        = 'BeforeOpenTag',
  OpeningTag           = 'OpeningTag',
  AfterOpenTag         = 'AfterOpenTag',
  InValueNq            = 'InValueNq',
  InValueSq            = 'InValueSq',
  InValueDq            = 'InValueDq',
  ClosingOpenTag       = 'ClosingOpenTag',
  OpeningSpecial       = 'OpeningSpecial',
  OpeningDoctype       = 'OpeningDoctype',
  OpeningNormalComment = 'OpeningNormalComment',
  InNormalComment      = 'InNormalComment',
  InShortComment       = 'InShortComment',
  ClosingNormalComment = 'ClosingNormalComment',
  ClosingTag           = 'ClosingTag',
}

export enum TokenKind {
  Literal    = 'Literal', // include whitespace
  OpenTag    = 'OpenTag', // trim leading '<'
  OpenTagEnd = 'OpenTagEnd', // include tailing '>'
  CloseTag   = 'CloseTag', // trim leading '<' and tailing '>'
}

export interface IToken {
  start: number;
  end: number;
  value: string;
  type: TokenKind;
}

let state: State
let buffer: string
let bufSize: number
let sectionStart: number
let index: number
let tokens: IToken[]

function makeCodePoints(input: string) {
  return {
    lower: input.toLowerCase().split('').map((c) => c.charCodeAt(0)),
    upper: input.toUpperCase().split('').map((c) => c.charCodeAt(0)),
    length: input.length,
  }
}

const doctype = makeCodePoints('!doctype')

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
      default:
        unexpected()
        break
    }
    index++
  }
  switch (state) {
    case State.Literal:
    case State.BeforeOpenTag:
    case State.InValueNq:
    case State.InValueSq:
    case State.InValueDq:
    case State.ClosingOpenTag:
    case State.InNormalComment:
    case State.InShortComment:
    case State.ClosingNormalComment:
      emitToken(TokenKind.Literal)
      break
    case State.OpeningTag:
      emitToken(TokenKind.OpenTag)
      break
    case State.AfterOpenTag:
      break
    case State.OpeningSpecial:
      emitToken(TokenKind.CloseTag)
      break
    case State.OpeningDoctype:
      if (index - sectionStart === doctype.length) {
        emitToken(TokenKind.OpenTag)
      } else {
        emitToken(TokenKind.OpenTag, void 0, sectionStart + 1)
        emitToken(TokenKind.Literal)
      }
      break
    case State.OpeningNormalComment:
      if (index - sectionStart === 2) {
        emitToken(TokenKind.OpenTag)
      } else {
        emitToken(TokenKind.OpenTag, void 0, sectionStart + 1)
        emitToken(TokenKind.Literal)
      }
      break
    case State.ClosingTag:
      emitToken(TokenKind.CloseTag)
      break
    default:
      break
  }
  const _tokens = tokens
  init('')
  return _tokens
}

function emitToken(kind: TokenKind, newState = state, end = index) {
  if (kind !== TokenKind.Literal || end !== sectionStart) {
    // empty literal should be ignored
    tokens.push({ type: kind, start: sectionStart, end, value: buffer.substring(sectionStart, end) })
  }
  sectionStart = end
  state        = newState
}

function parseLiteral(c: number) {
  if (c === Chars.Lt) { // <
    emitToken(TokenKind.Literal, State.BeforeOpenTag)
  }
}

function parseBeforeOpenTag(c: number) {
  if ((c >= Chars.La && c <= Chars.Lz) || (c >= Chars.Ua && c <= Chars.Uz)) { // <d
    state        = State.OpeningTag
    sectionStart = index
  } else if (c === Chars.Sl) { // </
    state        = State.ClosingTag
    sectionStart = index + 1
  } else if (c === Chars.Lt) { // <<
    emitToken(TokenKind.Literal)
  } else if (c === Chars.Ep) { // <!
    state        = State.OpeningSpecial
    sectionStart = index
  } else if (c === Chars.Qm) { // <?
    // treat as short comment
    sectionStart = index
    emitToken(TokenKind.OpenTag, State.InShortComment)
  } else { // <>
    // any other chars covert to normal state
    state = State.Literal
  }
}

function parseOpeningTag(c: number) {
  if (isWhiteSpace(c)) { // <div ...
    emitToken(TokenKind.OpenTag, State.AfterOpenTag)
  } else if (c === Chars.Gt) { // <div>
    emitToken(TokenKind.OpenTag)
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else if (c === Chars.Sl) { // <div/
    emitToken(TokenKind.OpenTag, State.ClosingOpenTag)
  }
}

function parseAfterOpenTag(c: number) {
  if (c === Chars.Gt) { // <div >
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else if (c === Chars.Sl) { // <div /
    state        = State.ClosingOpenTag
    sectionStart = index
  } else if (c === Chars.Eq) { // <div ...=...
    emitToken(TokenKind.Literal, void 0, index + 1)
  } else if (c === Chars.Sq) { // <div ...'...
    state = State.InValueSq
  } else if (c === Chars.Dq) { // <div ..."...
    state = State.InValueDq
  } else if (isWhiteSpace(c)) { // whitespace, ignore
    // maybe need to emit whitespace
    sectionStart = index
  } else { // <div ...name...
    state        = State.InValueNq
    sectionStart = index
  }
}

function parseInValueNq(c: number) {
  if (c === Chars.Gt) { // <div xxx>
    emitToken(TokenKind.Literal)
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else if (c === Chars.Sl) { // <div xxx/
    emitToken(TokenKind.Literal, State.ClosingOpenTag)
  } else if (c === Chars.Eq) { // <div xxx=
    emitToken(TokenKind.Literal)
    emitToken(TokenKind.Literal, State.AfterOpenTag, index + 1)
  } else if (isWhiteSpace(c)) { // <div xxx ...
    emitToken(TokenKind.Literal, State.AfterOpenTag)
  }
}

function parseInValueSq(c: number) {
  if (c === Chars.Sq) { // <div 'xxx'
    // FIXME: Chrome treat 'xxx'xx as one attribute name "'xxx'xx", and treat x='xxx'xx as two attributes: x='xxx', xx
    emitToken(TokenKind.Literal, State.AfterOpenTag, index + 1)
  }
}

function parseInValueDq(c: number) {
  if (c === Chars.Dq) { // <div "xxx", problem same to Sq
    emitToken(TokenKind.Literal, State.AfterOpenTag, index + 1)
  }
}

function parseClosingOpenTag(c: number) {
  if (c === Chars.Gt) { // <div />
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else { // <div /...>
    emitToken(TokenKind.Literal, State.AfterOpenTag)
  }
}

function parseOpeningSpecial(c: number) {
  switch (c) {
    case Chars.Cl: // <!-
      state = State.OpeningNormalComment
      break
    case Chars.Ld: // <!d
    case Chars.Ud: // <!D
      state = State.OpeningDoctype
      break
    default:
      emitToken(TokenKind.OpenTag, State.InShortComment)
      break
  }
}

function parseOpeningDoctype(c: number) {
  const offset = index - sectionStart
  if (offset === doctype.length) { // <!d, <!d , start: 0, index: 2
    if (isWhiteSpace(c)) {
      emitToken(TokenKind.OpenTag, State.AfterOpenTag)
    }
    unexpected()
  } else if (c === Chars.Gt) { // <!DOCT>
    emitToken(TokenKind.OpenTag, void 0, sectionStart + 1)
    emitToken(TokenKind.Literal)
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  } else if (doctype.lower[offset] !== c && doctype.upper[offset] !== c) { // <!DOCX...
    emitToken(TokenKind.OpenTag, State.InShortComment, sectionStart + 1)
  }
}

function parseOpeningNormalComment(c: number) {
  if (c === Chars.Cl) { // <!--
    emitToken(TokenKind.OpenTag, State.InNormalComment, index + 1)
  } else {
    emitToken(TokenKind.OpenTag, State.InShortComment, sectionStart + 1)
  }
}

function parseNormalComment(c: number) {
  if (c === Chars.Cl) { // <!-- ... -
    emitToken(TokenKind.Literal, State.ClosingNormalComment)
  }
}

function parseShortComment(c: number) {
  if (c === Chars.Gt) { // <! ... >
    emitToken(TokenKind.Literal)
    emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
  }
}

function parseClosingNormalComment(c: number) {
  const offset = index - sectionStart
  if (offset === 2) {
    if (c === Chars.Gt) { // <!-- xxx -->
      emitToken(TokenKind.OpenTagEnd, State.Literal, index + 1)
    } else if (c === Chars.Sl) { // <!-- xxx ---
      emitToken(TokenKind.Literal, void 0, sectionStart + 1)
    } else { // <!-- xxx --x
      state = State.InNormalComment
    }
  } else if (c !== Chars.Cl) { // <!-- xxx - ...
    state = State.InNormalComment
  }
}

function parseClosingTag(c: number) {
  if (c === Chars.Gt) { // </ xxx >
    emitToken(TokenKind.CloseTag, State.Literal, index)
  }
}

function unexpected() {
  throw new SyntaxError(`Unexpected token "${buffer.charAt(index)}" at ${index} when parsing ${state}`)
}
