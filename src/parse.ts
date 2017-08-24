/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 * @version 1.0.0
 * @desc parse.ts
 */

import { ANY, noNestedTags, selfCloseTags } from './config'
import { IToken, tokenize, TokenKind } from './tokenize'
import { IAttribute, IAttributeValue, INode, ITag, IText, SyntaxKind } from './types'
import { getLineRanges, getPosition } from './utils'

interface IContext {
  parent: IContext | void;
  tag: ITag;
}

let index: number
let count: number
let tokens: IToken[]
let tagChain: IContext | void
let nodes: INode[]
let token: IToken
let node: IText | void
let buffer: string
let lines: number[] | void

function init(input?: string) {
  if (input === void 0) {
    count         = 0
    tokens.length = 0
    buffer        = ''
  } else {
    tokens = tokenize(input)
    count  = tokens.length
    buffer = input
  }
  index    = 0
  tagChain = void 0
  nodes    = []
  token    = void 0 as any
  node     = void 0
  lines    = void 0
}

function pushNode(_node: ITag | IText) {
  if (!tagChain) {
    nodes.push(_node)
  } else if (_node.type === SyntaxKind.Tag && _node.name === tagChain.tag.name && noNestedTags[_node.name]) {
    tagChain = tagChain.parent
    pushNode(_node)
  } else if (tagChain.tag.body) {
    tagChain.tag.end = _node.end
    tagChain.tag.body.push(_node)
  }
}

function pushTagChain(tag: ITag) {
  tagChain = { parent: tagChain, tag: tag }
  node     = void 0
}

function createLiteral(start = token.start, end = token.end, value = token.value): IText {
  return { start, end, value, type: SyntaxKind.Text }
}

function createTag(): ITag {
  return {
    start: token.start - 1, // include <
    end: token.end,
    type: SyntaxKind.Tag,
    open: createLiteral(token.start - 1), // not finished
    name: token.value,
    attributes: [],
    body: null,
    close: null,
  }
}

function createAttribute(): IAttribute {
  return {
    start: token.start,
    end: token.end,
    name: createLiteral(),
    value: void 0,
  }
}

function createAttributeValue(): IAttributeValue {
  return {
    start: token.start,
    end: token.end,
    value: token.type === TokenKind.AttrValueNq
      ? token.value
      : token.value.substr(1, token.value.length - 2),
    quote: token.type === TokenKind.AttrValueNq ? void 0 : token.type === TokenKind.AttrValueSq ? '\'' : '"',
  }
}

function appendLiteral(_node: IText = node as IText) {
  _node.value += token.value
  _node.end = token.end
}

function unexpected() {
  if (lines === void 0) {
    lines = getLineRanges(buffer)
  }
  const [line, column] = getPosition(lines, token.start)
  throw new Error(
    `Unexpected token "${token.value}(${token.type})" at [${line},${column}]`
    + (tagChain ? ` when parsing tag: ${JSON.stringify(tagChain.tag.name)}.` : ''),
  )
}

function parseOpenTag() {
  let state: 0 /* before attr */ | 1 /* in name */ | 2 /* after name */ | 3 /* after = */ | 4 /* in value */ = 0

  let attr: IAttribute = ANY

  const tag = createTag()
  pushNode(tag)
  if (tag.name === '' || tag.name === '!' || tag.name === '!--') {
    tag.open.value = '<' + tag.open.value
    if (index === count) {
      return
    } else {
      token = tokens[++index]
      if (token.type !== TokenKind.OpenTagEnd) {
        node     = createLiteral()
        tag.body = [node]
        while (++index < count) {
          token = tokens[index]
          if (token.type === TokenKind.OpenTagEnd) {
            break
          }
          appendLiteral()
        }
      }
      tag.close = createLiteral(token.start, token.end + 1, `${token.value}>`)
      tag.end   = tag.close.end
    }
    return
  }
  while (++index < count) {
    token = tokens[index]
    if (token.type === TokenKind.OpenTagEnd) {
      tag.end = tag.open.end = token.end + 1
      tag.open.value = buffer.substring(tag.open.start, tag.open.end)
      if (token.value === '' && !selfCloseTags[tag.name]) {
        tag.body = []
        pushTagChain(tag)
      } else {
        tag.body = void 0
      }
      break
    } else if (state === 0) {
      if (token.type !== TokenKind.Whitespace) {
        attr  = createAttribute()
        state = 1
        tag.attributes.push(attr)
      }
    } else if (state === 1) {
      if (token.type === TokenKind.Whitespace) {
        state = 2
      } else if (token.type === TokenKind.AttrValueEq) {
        state = 3
      } else {
        appendLiteral(attr.name)
      }
    } else if (state === 2) {
      if (token.type !== TokenKind.Whitespace) {
        if (token.type === TokenKind.AttrValueEq) {
          state = 3
        } else {
          attr  = createAttribute()
          state = 1
          tag.attributes.push(attr)
        }
      }
    } else if (state === 3) {
      if (token.type !== TokenKind.Whitespace) {
        attr.value = createAttributeValue()
        if (token.type === TokenKind.AttrValueNq) {
          state = 4
        } else {
          attr.end = attr.value.end
          state    = 0
        }
      }
    } else {
      if (token.type === TokenKind.Whitespace) {
        attr.end = (attr.value as IAttributeValue).end
        state    = 0
      } else {
        appendLiteral(attr.value as any)
      }
    }
  }
}

function parseCloseTag() {
  let _context: IContext | void = tagChain
  while (true) {
    if (!_context || token.value.startsWith(_context.tag.name)) {
      break
    }
    _context = _context.parent
  }
  if (!_context) {
    return
  }
  _context.tag.close = createLiteral(token.start - 2, token.end + 1, `</${token.value}>`)
  _context.tag.end   = _context.tag.close.end
  _context           = _context.parent
  tagChain           = _context
}

export function parse(input: string): INode[] {
  init(input)
  while (index < count) {
    token = tokens[index]
    switch (token.type) {
      case TokenKind.Literal:
        if (!node) {
          node = createLiteral()
          pushNode(node)
        } else {
          appendLiteral(node)
        }
        break
      case TokenKind.OpenTag:
        node = void 0
        parseOpenTag()
        break
      case TokenKind.CloseTag:
        node = void 0
        parseCloseTag()
        break
      default:
        unexpected()
        break
    }
    index++
  }
  const _nodes = nodes
  init()
  return _nodes
}
