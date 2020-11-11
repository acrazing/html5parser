/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 00:54:46
 * @version 1.0.0
 * @desc parse.ts
 */

import { noNestedTags, selfCloseTags } from './config';
import { IToken, tokenize, TokenKind } from './tokenize';
import { IAttribute, IAttributeValue, INode, ITag, IText, SyntaxKind } from './types';
import { getLineRanges, getPosition } from './utils';
import { walk } from './walk';

interface IContext {
  parent: IContext | undefined;
  tag: ITag;
}

export interface ParseOptions {
  // create tag's attributes map
  // if true, will set ITag.attributeMap property
  // as a `Record<string, IAttribute>`
  setAttributeMap: boolean;
}

let index: number;
let count: number;
let tokens: IToken[];
let tagChain: IContext | undefined;
let nodes: INode[];
let token: IToken;
let node: IText | undefined;
let buffer: string;
let lines: number[] | undefined;
let parseOptions: ParseOptions | undefined;

function init(input?: string, options?: ParseOptions) {
  if (input === void 0) {
    count = 0;
    tokens.length = 0;
    buffer = '';
  } else {
    tokens = tokenize(input);
    count = tokens.length;
    buffer = input;
  }
  index = 0;
  tagChain = void 0;
  nodes = [];
  token = void 0 as any;
  node = void 0;
  lines = void 0;
  parseOptions = options;
}

function pushNode(_node: ITag | IText) {
  if (!tagChain) {
    nodes.push(_node);
  } else if (
    _node.type === SyntaxKind.Tag &&
    _node.name === tagChain.tag.name &&
    noNestedTags[_node.name]
  ) {
    tagChain = tagChain.parent;
    pushNode(_node);
  } else if (tagChain.tag.body) {
    tagChain.tag.end = _node.end;
    tagChain.tag.body.push(_node);
  }
}

function pushTagChain(tag: ITag) {
  tagChain = { parent: tagChain, tag: tag };
  node = void 0;
}

function createLiteral(start = token.start, end = token.end, value = token.value): IText {
  return { start, end, value, type: SyntaxKind.Text };
}

function createTag(): ITag {
  return {
    start: token.start - 1, // include <
    end: token.end,
    type: SyntaxKind.Tag,
    open: createLiteral(token.start - 1), // not finished
    name: token.value,
    rawName: buffer.substring(token.start, token.end),
    attributes: [],
    attributeMap: void 0,
    body: null,
    close: null,
  };
}

function createAttribute(): IAttribute {
  return {
    start: token.start,
    end: token.end,
    name: createLiteral(),
    value: void 0,
  };
}

function createAttributeValue(): IAttributeValue {
  return {
    start: token.start,
    end: token.end,
    value:
      token.type === TokenKind.AttrValueNq
        ? token.value
        : token.value.substr(1, token.value.length - 2),
    quote:
      token.type === TokenKind.AttrValueNq
        ? void 0
        : token.type === TokenKind.AttrValueSq
        ? "'"
        : '"',
  };
}

function appendLiteral(_node: IText | IAttributeValue = node as IText) {
  _node.value += token.value;
  _node.end = token.end;
}

function unexpected() {
  if (lines === void 0) {
    lines = getLineRanges(buffer);
  }
  const [line, column] = getPosition(lines, token.start);
  throw new Error(
    `Unexpected token "${token.value}(${token.type})" at [${line},${column}]` +
      (tagChain ? ` when parsing tag: ${JSON.stringify(tagChain.tag.name)}.` : ''),
  );
}

function buildAttributeMap(tag: ITag) {
  tag.attributeMap = {};
  for (const attr of tag.attributes) {
    tag.attributeMap[attr.name.value] = attr;
  }
}

const enum OpenTagState {
  BeforeAttr,
  InName,
  AfterName,
  AfterEqual,
  InValue,
}

function parseOpenTag() {
  let state = OpenTagState.BeforeAttr;

  let attr: IAttribute = void 0 as any;

  const tag = createTag();
  pushNode(tag);
  if (tag.name === '' || tag.name === '!' || tag.name === '!--') {
    tag.open.value = '<' + tag.open.value;
    if (index === count) {
      return;
    } else {
      token = tokens[++index];
      if (token.type !== TokenKind.OpenTagEnd) {
        node = createLiteral();
        tag.body = [node];
        while (++index < count) {
          token = tokens[index];
          if (token.type === TokenKind.OpenTagEnd) {
            node = void 0;
            break;
          }
          appendLiteral();
        }
      }
      tag.close = createLiteral(token.start, token.end + 1, `${token.value}>`);
      tag.end = tag.close.end;
    }
    return;
  }
  while (++index < count) {
    token = tokens[index];
    if (token.type === TokenKind.OpenTagEnd) {
      tag.end = tag.open.end = token.end + 1;
      tag.open.value = buffer.substring(tag.open.start, tag.open.end);
      if (token.value === '' && !selfCloseTags[tag.name]) {
        tag.body = [];
        pushTagChain(tag);
      } else {
        tag.body = void 0;
      }
      break;
    } else if (state === OpenTagState.BeforeAttr) {
      if (token.type !== TokenKind.Whitespace) {
        attr = createAttribute();
        state = OpenTagState.InName;
        tag.attributes.push(attr);
      }
    } else if (state === OpenTagState.InName) {
      if (token.type === TokenKind.Whitespace) {
        state = OpenTagState.AfterName;
      } else if (token.type === TokenKind.AttrValueEq) {
        state = OpenTagState.AfterEqual;
      } else {
        appendLiteral(attr.name);
      }
    } else if (state === OpenTagState.AfterName) {
      if (token.type !== TokenKind.Whitespace) {
        if (token.type === TokenKind.AttrValueEq) {
          state = OpenTagState.AfterEqual;
        } else {
          attr = createAttribute();
          state = OpenTagState.InName;
          tag.attributes.push(attr);
        }
      }
    } else if (state === OpenTagState.AfterEqual) {
      if (token.type !== TokenKind.Whitespace) {
        attr.value = createAttributeValue();
        if (token.type === TokenKind.AttrValueNq) {
          state = OpenTagState.InValue;
        } else {
          attr.end = attr.value.end;
          state = OpenTagState.BeforeAttr;
        }
      }
    } else {
      if (token.type === TokenKind.Whitespace) {
        attr.end = attr.value!.end;
        state = OpenTagState.BeforeAttr;
      } else {
        appendLiteral(attr.value);
      }
    }
  }
}

function parseCloseTag() {
  let _context = tagChain;
  while (true) {
    if (!_context || token.value.trim() === _context.tag.name) {
      break;
    }
    _context = _context.parent;
  }
  if (!_context) {
    return;
  }
  _context.tag.close = createLiteral(
    token.start - 2,
    token.end + 1,
    buffer.substring(token.start - 2, token.end + 1),
  );
  _context.tag.end = _context.tag.close.end;
  _context = _context.parent;
  tagChain = _context;
}

export function parse(input: string, options?: ParseOptions): INode[] {
  init(input, {
    setAttributeMap: false,
    ...options,
  } as ParseOptions);
  while (index < count) {
    token = tokens[index];
    switch (token.type) {
      case TokenKind.Literal:
        if (!node) {
          node = createLiteral();
          pushNode(node);
        } else {
          appendLiteral(node);
        }
        break;
      case TokenKind.OpenTag:
        node = void 0;
        parseOpenTag();
        break;
      case TokenKind.CloseTag:
        node = void 0;
        parseCloseTag();
        break;
      default:
        unexpected();
        break;
    }
    index++;
  }
  const _nodes = nodes;
  if (parseOptions?.setAttributeMap) {
    walk(_nodes, {
      enter(node: IText | ITag): void {
        if (node.type === SyntaxKind.Tag) {
          buildAttributeMap(node);
        }
      },
    });
  }
  init();
  return _nodes;
}
