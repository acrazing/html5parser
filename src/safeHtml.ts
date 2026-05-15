/*
 * @author acrazing joking.young@gmail.com
 * @since 2020-09-09 22:53:14
 */

import { selfCloseTags } from './config';
import { parse } from './parse';
import { SyntaxKind } from './types';
import type { INode } from './types';

/**
 * Options used to sanitize and stringify HTML.
 */
export interface SafeHtmlOptions {
  /**
   * Tag names allowed in the sanitized output.
   */
  allowedTags: string[];
  /**
   * Attribute names allowed on every allowed tag.
   */
  allowedAttrs: string[];
  /**
   * Attribute names allowed only for specific tags.
   */
  tagAllowedAttrs: Record<string, string[]>;
  /**
   * URL pattern allowed for href and src attributes.
   */
  allowedUrl: RegExp;
}

/**
 * Default safe HTML allowlist.
 */
export const safeHtmlDefaultOptions: SafeHtmlOptions = {
  allowedTags: [
    'a',
    'abbr',
    'address',
    'area',
    'article',
    'aside',
    'b',
    'bdi',
    'bdo',
    'big',
    'blockquote',
    'br',
    'button',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'data',
    'dd',
    'del',
    'dfn',
    'div',
    'dl',
    'dt',
    'em',
    'figcaption',
    'figure',
    'footer',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'hr',
    'i',
    'img',
    'ins',
    'kbd',
    'label',
    'li',
    'main',
    'map',
    'ol',
    'p',
    'picture',
    'pre',
    'q',
    'rp',
    'rt',
    'ruby',
    's',
    'samp',
    'section',
    'small',
    'span',
    'strong',
    'sub',
    'summary',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'time',
    'tr',
    'u',
    'ul',
    'var',
    'wbr',
  ],
  allowedAttrs: ['style'],
  tagAllowedAttrs: {
    a: ['href', 'target'],
    img: ['src'],
    td: ['rowspan', 'colspan'],
    th: ['rowspan', 'colspan'],
    time: ['datetime'],
    colgroup: ['span'],
    col: ['span'],
  },
  allowedUrl: /^(?:mailto|tel|https?|ftp|[^:]*[^a-z0-9.+-][^:]*):|^[^:]*$/i,
};

/**
 * Sanitize an HTML string using the configured allowlist.
 */
export function safeHtml(input: string, options: Partial<SafeHtmlOptions> = {}): string {
  const config: SafeHtmlOptions = {
    ...safeHtmlDefaultOptions,
    ...options,
    tagAllowedAttrs: {
      ...safeHtmlDefaultOptions.tagAllowedAttrs,
      ...options.tagAllowedAttrs,
    },
  };
  const ast = parse(input);
  return stringify(ast, config, input);
}

function stringify(ast: INode[], config: SafeHtmlOptions, input: string): string {
  return ast
    .map((node) => {
      if (node.type === SyntaxKind.Text) {
        return node.value;
      }
      if (config.allowedTags.indexOf(node.name) === -1) {
        return '';
      }
      if (selfCloseTags.has(node.name)) {
        if (node.body !== void 0) {
          throw new Error(`self closed tag "${node.name}" should not have body`);
        }
      } else {
        if (!node.body || !node.close) {
          throw new Error(`tag "${node.name}" should have body and close`);
        }
      }
      const attrs = node.attributes
        .filter((a) => {
          if (
            config.allowedAttrs.indexOf(a.name.value) > -1 ||
            config.tagAllowedAttrs[node.name]?.indexOf(a.name.value) > -1
          ) {
            if (!a.value) {
              return true;
            }
            if (a.name.value !== 'src' && a.name.value !== 'href') {
              return true;
            }
            if (config.allowedUrl.test(a.value.value)) {
              return true;
            }
            return false;
          }
          return false;
        })
        .map((a) => input.substring(a.start, a.end))
        .join(' ');
      const head = '<' + node.rawName + (attrs ? ' ' + attrs : '') + '>';
      if (!node.body) {
        return head;
      }
      return head + stringify(node.body, config, input) + `</${node.rawName}>`;
    })
    .join('');
}
