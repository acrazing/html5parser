/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:29
 * @version 1.0.0
 * @desc tokenize.ts
 */
const HTML_STANDARD_TAGS = [
  '!--',
  '!doctype',
  'a',
  'abbr',
  'acronym',
  'acronym',
  'address',
  'applet',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'base',
  'basefont',
  'bdi',
  'bdo',
  'big',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'cite',
  'code',
  'col',
  'colgroup',
  'command',
  'datalist',
  'dd',
  'del',
  'details',
  'dir',
  'div',
  'dfn',
  'dialog',
  'dl',
  'dt',
  'em/',
  'embed',
  'fieldset',
  'figcaption',
  'figure',
  'font',
  'footer',
  'form',
  'frame',
  'frameset',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'i',
  'iframe',
  'img',
  'input',
  'ins',
  'isindex',
  'kbd',
  'keygen',
  'label',
  'legend',
  'li',
  'link',
  'map',
  'mark',
  'menu',
  'meta',
  'meter',
  'nav',
  'noframes',
  'noscript',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'param',
  'pre',
  'progress',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'script',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strike',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'title',
  'tr',
  'track',
  'tt',
  'u',
  'ul',
  'var',
  'video',
  'wbr',
  'xmp',
];
enum State {
  Literal = 'Literal',
  BeforeOpenTag = 'BeforeOpenTag',
  OpeningTag = 'OpeningTag',
  AfterOpenTag = 'AfterOpenTag',
  InValueNq = 'InValueNq',
  InValueSq = 'InValueSq',
  InValueDq = 'InValueDq',
  ClosingOpenTag = 'ClosingOpenTag',
  OpeningSpecial = 'OpeningSpecial',
  OpeningDoctype = 'OpeningDoctype',
  OpeningNormalComment = 'OpeningNormalComment',
  InNormalComment = 'InNormalComment',
  InShortComment = 'InShortComment',
  ClosingNormalComment = 'ClosingNormalComment',
  ClosingTag = 'ClosingTag',
}

export enum TokenKind {
  Literal = 'Literal',
  OpenTag = 'OpenTag', // trim leading '<'
  OpenTagEnd = 'OpenTagEnd', // trim tailing '>', only could be '/' or ''
  CloseTag = 'CloseTag', // trim leading '</' and tailing '>'
  Whitespace = 'Whitespace', // the whitespace between attributes
  AttrValueEq = 'AttrValueEq',
  AttrValueNq = 'AttrValueNq',
  AttrValueSq = 'AttrValueSq',
  AttrValueDq = 'AttrValueDq',
}

export interface IToken {
  start: number;
  end: number;
  value: string;
  type: TokenKind;
}

let state: State;
let buffer: string;
let bufSize: number;
let sectionStart: number;
let index: number;
let tokens: IToken[];
let char: number;
let inScript: boolean;
let inStyle: boolean;
let offset: number;

function makeCodePoints(input: string) {
  return {
    lower: input
      .toLowerCase()
      .split('')
      .map((c) => c.charCodeAt(0)),
    upper: input
      .toUpperCase()
      .split('')
      .map((c) => c.charCodeAt(0)),
    length: input.length,
  };
}

const doctype = makeCodePoints('!doctype');
const style = makeCodePoints('style');
const script = makeCodePoints('script');

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
  Sq = "'".charCodeAt(0),
  Dq = '"'.charCodeAt(0),
  Ld = 'd'.charCodeAt(0),
  Ud = 'D'.charCodeAt(0),
}

function isWhiteSpace() {
  return (
    char === Chars._S ||
    char === Chars._N ||
    char === Chars._T ||
    char === Chars._T ||
    char === Chars._R ||
    char === Chars._F
  );
}

function init(input: string) {
  state = State.Literal;
  buffer = input;
  bufSize = input.length;
  sectionStart = 0;
  index = 0;
  tokens = [];
  inScript = false;
  inStyle = false;
  offset = 0;
}

export function tokenize(input: string): IToken[] {
  init(input);
  while (index < bufSize) {
    char = buffer.charCodeAt(index);
    switch (state) {
      case State.Literal:
        parseLiteral();
        break;
      case State.BeforeOpenTag:
        parseBeforeOpenTag();
        break;
      case State.OpeningTag:
        parseOpeningTag();
        break;
      case State.AfterOpenTag:
        parseAfterOpenTag();
        break;
      case State.InValueNq:
        parseInValueNq();
        break;
      case State.InValueSq:
        parseInValueSq();
        break;
      case State.InValueDq:
        parseInValueDq();
        break;
      case State.ClosingOpenTag:
        parseClosingOpenTag();
        break;
      case State.OpeningSpecial:
        parseOpeningSpecial();
        break;
      case State.OpeningDoctype:
        parseOpeningDoctype();
        break;
      case State.OpeningNormalComment:
        parseOpeningNormalComment();
        break;
      case State.InNormalComment:
        parseNormalComment();
        break;
      case State.InShortComment:
        parseShortComment();
        break;
      case State.ClosingNormalComment:
        parseClosingNormalComment();
        break;
      case State.ClosingTag:
        parseClosingTag();
        break;
      default:
        unexpected();
        break;
    }
    index++;
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
      emitToken(TokenKind.Literal);
      break;
    case State.OpeningTag:
      emitToken(TokenKind.OpenTag);
      break;
    case State.AfterOpenTag:
      break;
    case State.OpeningSpecial:
      emitToken(TokenKind.OpenTag, State.InShortComment);
      break;
    case State.OpeningDoctype:
      if (index - sectionStart === doctype.length) {
        emitToken(TokenKind.OpenTag);
      } else {
        emitToken(TokenKind.OpenTag, void 0, sectionStart + 1);
        emitToken(TokenKind.Literal);
      }
      break;
    case State.OpeningNormalComment:
      if (index - sectionStart === 2) {
        emitToken(TokenKind.OpenTag);
      } else {
        emitToken(TokenKind.OpenTag, void 0, sectionStart + 1);
        emitToken(TokenKind.Literal);
      }
      break;
    case State.ClosingTag:
      emitToken(TokenKind.CloseTag);
      break;
    default:
      break;
  }
  const _tokens = tokens;
  init('');
  return _tokens;
}

function emitToken(kind: TokenKind, newState = state, end = index) {
  let value = buffer.substring(sectionStart, end);
  if (kind === TokenKind.OpenTag || kind === TokenKind.CloseTag) {
    // only change standar Tag to lowercase
    if (HTML_STANDARD_TAGS.indexOf(value.toLowerCase()) >= 0) {
      value = value.toLowerCase();
    }
  }
  if (kind === TokenKind.OpenTag) {
    if (value === 'script') {
      inScript = true;
    } else if (value === 'style') {
      inStyle = true;
    }
  }
  if (kind === TokenKind.CloseTag) {
    inScript = inStyle = false;
  }
  if (
    !(
      (kind === TokenKind.Literal || kind === TokenKind.Whitespace) &&
      end === sectionStart
    )
  ) {
    // empty literal should be ignored
    tokens.push({ type: kind, start: sectionStart, end, value });
  }
  if (kind === TokenKind.OpenTagEnd || kind === TokenKind.CloseTag) {
    sectionStart = end + 1;
    state = State.Literal;
  } else {
    sectionStart = end;
    state = newState;
  }
}

function parseLiteral() {
  if (char === Chars.Lt) {
    // <
    emitToken(TokenKind.Literal, State.BeforeOpenTag);
  }
}

function parseBeforeOpenTag() {
  if (inScript || inStyle) {
    if (char === Chars.Sl) {
      state = State.ClosingTag;
      sectionStart = index + 1;
    } else {
      state = State.Literal;
    }
    return;
  }
  if (
    (char >= Chars.La && char <= Chars.Lz) ||
    (char >= Chars.Ua && char <= Chars.Uz)
  ) {
    // <d
    state = State.OpeningTag;
    sectionStart = index;
  } else if (char === Chars.Sl) {
    // </
    state = State.ClosingTag;
    sectionStart = index + 1;
  } else if (char === Chars.Lt) {
    // <<
    emitToken(TokenKind.Literal);
  } else if (char === Chars.Ep) {
    // <!
    state = State.OpeningSpecial;
    sectionStart = index;
  } else if (char === Chars.Qm) {
    // <?
    // treat as short comment
    sectionStart = index;
    emitToken(TokenKind.OpenTag, State.InShortComment);
  } else {
    // <>
    // any other chars covert to normal state
    state = State.Literal;
  }
}

function parseOpeningTag() {
  if (isWhiteSpace()) {
    // <div ...
    emitToken(TokenKind.OpenTag, State.AfterOpenTag);
  } else if (char === Chars.Gt) {
    // <div>
    emitToken(TokenKind.OpenTag);
    emitToken(TokenKind.OpenTagEnd);
  } else if (char === Chars.Sl) {
    // <div/
    emitToken(TokenKind.OpenTag, State.ClosingOpenTag);
  }
}

function parseAfterOpenTag() {
  if (char === Chars.Gt) {
    // <div >
    emitToken(TokenKind.Whitespace);
    emitToken(TokenKind.OpenTagEnd);
  } else if (char === Chars.Sl) {
    // <div /
    emitToken(TokenKind.Whitespace, State.ClosingOpenTag);
  } else if (char === Chars.Eq) {
    // <div ...=...
    emitToken(TokenKind.Whitespace);
    emitToken(TokenKind.AttrValueEq, void 0, index + 1);
  } else if (char === Chars.Sq) {
    // <div ...'...
    emitToken(TokenKind.Whitespace, State.InValueSq);
  } else if (char === Chars.Dq) {
    // <div ..."...
    emitToken(TokenKind.Whitespace, State.InValueDq);
  } else if (!isWhiteSpace()) {
    // <div ...name...
    emitToken(TokenKind.Whitespace, State.InValueNq);
  }
}

function parseInValueNq() {
  if (char === Chars.Gt) {
    // <div xxx>
    emitToken(TokenKind.AttrValueNq);
    emitToken(TokenKind.OpenTagEnd);
  } else if (char === Chars.Sl) {
    // <div xxx/
    emitToken(TokenKind.AttrValueNq, State.ClosingOpenTag);
  } else if (char === Chars.Eq) {
    // <div xxx=
    emitToken(TokenKind.AttrValueNq);
    emitToken(TokenKind.AttrValueEq, State.AfterOpenTag, index + 1);
  } else if (isWhiteSpace()) {
    // <div xxx ...
    emitToken(TokenKind.AttrValueNq, State.AfterOpenTag);
  }
}

function parseInValueSq() {
  if (char === Chars.Sq) {
    // <div 'xxx'
    emitToken(TokenKind.AttrValueSq, State.AfterOpenTag, index + 1);
  }
}

function parseInValueDq() {
  if (char === Chars.Dq) {
    // <div "xxx", problem same to Sq
    emitToken(TokenKind.AttrValueDq, State.AfterOpenTag, index + 1);
  }
}

function parseClosingOpenTag() {
  if (char === Chars.Gt) {
    // <div />
    emitToken(TokenKind.OpenTagEnd);
  } else {
    // <div /...>
    emitToken(TokenKind.AttrValueNq, State.AfterOpenTag);
    parseAfterOpenTag();
  }
}

function parseOpeningSpecial() {
  switch (char) {
    case Chars.Cl: // <!-
      state = State.OpeningNormalComment;
      break;
    case Chars.Ld: // <!d
    case Chars.Ud: // <!D
      state = State.OpeningDoctype;
      break;
    default:
      emitToken(TokenKind.OpenTag, State.InShortComment);
      break;
  }
}

function parseOpeningDoctype() {
  offset = index - sectionStart;
  if (offset === doctype.length) {
    // <!d, <!d , start: 0, index: 2
    if (isWhiteSpace()) {
      emitToken(TokenKind.OpenTag, State.AfterOpenTag);
    } else {
      unexpected();
    }
  } else if (char === Chars.Gt) {
    // <!DOCT>
    emitToken(TokenKind.OpenTag, void 0, sectionStart + 1);
    emitToken(TokenKind.Literal);
    emitToken(TokenKind.OpenTagEnd);
  } else if (doctype.lower[offset] !== char && doctype.upper[offset] !== char) {
    // <!DOCX...
    emitToken(TokenKind.OpenTag, State.InShortComment, sectionStart + 1);
  }
}

function parseOpeningNormalComment() {
  if (char === Chars.Cl) {
    // <!--
    emitToken(TokenKind.OpenTag, State.InNormalComment, index + 1);
  } else {
    emitToken(TokenKind.OpenTag, State.InShortComment, sectionStart + 1);
  }
}

function parseNormalComment() {
  if (char === Chars.Cl) {
    // <!-- ... -
    emitToken(TokenKind.Literal, State.ClosingNormalComment);
  }
}

function parseShortComment() {
  if (char === Chars.Gt) {
    // <! ... >
    emitToken(TokenKind.Literal);
    emitToken(TokenKind.OpenTagEnd);
  }
}

function parseClosingNormalComment() {
  offset = index - sectionStart;
  if (offset === 2) {
    if (char === Chars.Gt) {
      // <!-- xxx -->
      emitToken(TokenKind.OpenTagEnd);
    } else if (char === Chars.Cl) {
      // <!-- xxx ---
      emitToken(TokenKind.Literal, void 0, sectionStart + 1);
    } else {
      // <!-- xxx --x
      state = State.InNormalComment;
    }
  } else if (char !== Chars.Cl) {
    // <!-- xxx - ...
    state = State.InNormalComment;
  }
}

function parseClosingTag() {
  offset = index - sectionStart;
  if (inStyle) {
    if (char === Chars.Lt) {
      sectionStart -= 2;
      emitToken(TokenKind.Literal, State.BeforeOpenTag);
    } else if (offset < style.length) {
      if (style.lower[offset] !== char && style.upper[offset] !== char) {
        sectionStart -= 2;
        state = State.Literal;
      }
    } else if (char === Chars.Gt) {
      emitToken(TokenKind.CloseTag);
    } else if (!isWhiteSpace()) {
      sectionStart -= 2;
      state = State.Literal;
    }
  } else if (inScript) {
    if (char === Chars.Lt) {
      sectionStart -= 2;
      emitToken(TokenKind.Literal, State.BeforeOpenTag);
    } else if (offset < script.length) {
      if (script.lower[offset] !== char && script.upper[offset] !== char) {
        sectionStart -= 2;
        state = State.Literal;
      }
    } else if (char === Chars.Gt) {
      emitToken(TokenKind.CloseTag);
    } else if (!isWhiteSpace()) {
      sectionStart -= 2;
      state = State.Literal;
    }
  } else if (char === Chars.Gt) {
    // </ xxx >
    emitToken(TokenKind.CloseTag);
  }
}

function unexpected() {
  throw new SyntaxError(
    `Unexpected token "${buffer.charAt(
      index,
    )}" at ${index} when parse ${state}`,
  );
}
