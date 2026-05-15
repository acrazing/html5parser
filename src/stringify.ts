/*
 * @author acrazing joking.young@gmail.com
 * @since 2026-05-15 15:16:00
 */

import { SyntaxKind } from './types';
import type { IAttribute, INode, ITag } from './types';

/**
 * Serialize parsed AST nodes back to HTML.
 */
export function stringify(ast: INode | INode[]): string {
  if (Array.isArray(ast)) {
    return ast.map(stringifyNode).join('');
  }
  return stringifyNode(ast);
}

function stringifyNode(node: INode): string {
  if (node.type === SyntaxKind.Text) {
    return node.value;
  }
  return stringifyTag(node);
}

function stringifyTag(tag: ITag): string {
  if (tag.body === null) {
    return stringifyOpenTag(tag, false);
  }
  if (tag.name === '!--' || tag.name === '!' || tag.name === '') {
    return stringifySpecialTag(tag);
  }

  const open = stringifyOpenTag(tag);
  if (tag.body === void 0) {
    return open;
  }
  const close = tag.close === null ? '' : `</${tag.rawName}>`;
  return open + stringify(tag.body) + close;
}

function stringifySpecialTag(tag: ITag): string {
  const body = tag.body ? stringify(tag.body) : '';
  if (tag.name === '!--') {
    return `<!--${body}${tag.close === null ? '' : '-->'}`;
  }
  if (tag.name === '!') {
    return `<!${body}${tag.close === null ? '' : '>'}`;
  }
  return `<${body}${tag.close === null ? '' : '>'}`;
}

function stringifyOpenTag(tag: ITag, close = true): string {
  const attrs = tag.attributes.map(stringifyAttribute).join(' ');
  return `<${tag.rawName}${attrs ? ` ${attrs}` : ''}${close ? '>' : ''}`;
}

function stringifyAttribute(attr: IAttribute): string {
  if (!attr.value) {
    return attr.name.value;
  }
  if (attr.value.quote === void 0) {
    return `${attr.name.value}=${attr.value.value}`;
  }
  return `${attr.name.value}=${attr.value.quote}${attr.value.value}${attr.value.quote}`;
}
