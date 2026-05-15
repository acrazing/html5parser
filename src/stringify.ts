/*
 * @author acrazing joking.young@gmail.com
 * @since 2026-05-15 15:16:00
 */

import { SyntaxKind } from './types';
import type { IAttribute, INode, ITag } from './types';

/**
 * Set a tag attribute and keep attributeMap in sync when it exists.
 */
export function setAttribute(tag: ITag, name: string, value?: string): void {
  const attr = findAttribute(tag, name);
  if (attr) {
    attr.name.value = name;
    attr.value =
      value === void 0
        ? void 0
        : {
            start: attr.value?.start ?? attr.end,
            end: attr.value?.end ?? attr.end,
            value,
            quote: attr.value?.quote ?? '"',
          };
    attr.end = attr.value?.end ?? attr.name.end;
  } else {
    tag.attributes.push(createAttribute(name, value));
  }
  if (tag.attributeMap) {
    tag.attributeMap[name] = findAttribute(tag, name) as IAttribute;
  }
}

/**
 * Remove all tag attributes with the provided name and keep attributeMap in sync when it exists.
 */
export function removeAttribute(tag: ITag, name: string): void {
  for (let index = tag.attributes.length - 1; index >= 0; index--) {
    if (tag.attributes[index].name.value === name) {
      tag.attributes.splice(index, 1);
    }
  }
  if (tag.attributeMap) {
    delete tag.attributeMap[name];
  }
}

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

function findAttribute(tag: ITag, name: string): IAttribute | undefined {
  return tag.attributes.find((attr) => attr.name.value === name);
}

function createAttribute(name: string, value?: string): IAttribute {
  return {
    start: 0,
    end: 0,
    name: {
      start: 0,
      end: 0,
      type: SyntaxKind.Text,
      value: name,
    },
    value:
      value === void 0
        ? void 0
        : {
            start: 0,
            end: 0,
            value,
            quote: '"',
          },
  };
}
