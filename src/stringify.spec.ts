/*
 * @author acrazing joking.young@gmail.com
 * @since 2026-05-15 15:16:00
 */

import * as assert from 'node:assert';
import { parse } from './parse';
import { stringify } from './stringify';
import { SyntaxKind } from './types';
import type { IAttribute, INode, ITag } from './types';

function assertTagNode(node: INode): asserts node is ITag {
  assert.strictEqual(node.type, SyntaxKind.Tag);
}

function attr(name: string, value?: string, quote: "'" | '"' | undefined = '"'): IAttribute {
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
            quote,
          },
  };
}

describe('stringify', () => {
  it('serializes parsed HTML back to HTML', () => {
    const input =
      '<!doctype html><DIV a b=c d=\'e\' f="g"><span>Text</span><img src=x></DIV><!-- comment --><! short ><? pi ?>';
    assert.strictEqual(stringify(parse(input)), input);
  });

  it('serializes a single node', () => {
    const ast = parse('<span>Text</span>');
    assert.strictEqual(stringify(ast[0]), '<span>Text</span>');
  });

  it('reflects attribute value mutations through attributeMap', () => {
    const ast = parse('<a href="before" disabled>Link</a>', {
      setAttributeMap: true,
    });
    assertTagNode(ast[0]);
    ast[0].attributeMap!.href.value!.value = 'after';
    assert.strictEqual(stringify(ast), '<a href="after" disabled>Link</a>');
  });

  it('serializes attributes added to attributes array', () => {
    const ast = parse('<a href="link">Link</a>');
    assertTagNode(ast[0]);
    ast[0].attributes.push(attr('target', '_blank'));
    assert.strictEqual(stringify(ast), '<a href="link" target="_blank">Link</a>');
  });

  it('preserves missing close tags from the AST shape', () => {
    assert.strictEqual(stringify(parse('<div>Text')), '<div>Text');
  });

  it('serializes incomplete open tags without a closing angle bracket', () => {
    assert.strictEqual(stringify(parse('<div')), '<div');
  });
});
