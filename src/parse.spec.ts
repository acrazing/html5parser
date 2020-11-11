/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-20 17:32:24
 * @version 1.0.0
 * @desc parse.spec.ts
 */

import * as assert from 'assert';
import { parse } from './parse';
import { IAttribute, IAttributeValue, INode, ITag, IText, SyntaxKind } from './types';

export let index = 0;

export function text(input: string, start = index): IText {
  return {
    type: SyntaxKind.Text,
    start: start,
    end: index = input.length + start,
    value: input,
  };
}

export function tag(
  input: string,
  name: string,
  open: IText,
  attributes: IAttribute[],
  body: INode[] | undefined | null,
  close: IText | undefined | null,
  start: number,
  rawName = name,
): ITag {
  return {
    start: start,
    end: index = start + input.length,
    type: SyntaxKind.Tag,
    open: open,
    name: name,
    rawName: rawName,
    attributes: attributes,
    attributeMap: undefined,
    body: body,
    close: close,
  };
}

function attr(name: IText, value?: IAttributeValue): IAttribute {
  return {
    start: name.start,
    end: index = value ? value.end : name.end,
    name: name,
    value: value,
  };
}

function value(input: string, quote: undefined | "'" | '"', start = index): IAttributeValue {
  return {
    start: start,
    end: index = start + (quote === void 0 ? 0 : 2) + input.length,
    value: input,
    quote: quote,
  };
}

const scenes: Array<{
  name: string;
  input: string;
  nodes: INode[];
}> = [
  {
    name: 'text',
    input: 'hello world',
    nodes: [text('hello world', 0)],
  },
  {
    name: 'text twice',
    input: 'hello < world',
    nodes: [text('hello < world', 0)],
  },
  {
    name: 'single tag',
    input: '<div></div>',
    nodes: [tag('<div></div>', 'div', text('<div>', 0), [], [], text('</div>'), 0)],
  },
  {
    name: 'tag attributes',
    input: '<div a1 b2=c3 d4 = e5 f6=\'g7\' h8="i9" />',
    nodes: [
      tag(
        '<div a1 b2=c3 d4 = e5 f6=\'g7\' h8="i9" />',
        'div',
        text('<div a1 b2=c3 d4 = e5 f6=\'g7\' h8="i9" />', 0),
        [
          attr(text('a1', 5)),
          attr(text('b2', index + 1), value('c3', void 0, index + 1)),
          attr(text('d4', index + 1), value('e5', void 0, index + 3)),
          attr(text('f6', index + 1), value('g7', "'", index + 1)),
          attr(text('h8', index + 1), value('i9', '"', index + 1)),
        ],
        void 0,
        null,
        0,
      ),
    ],
  },
  {
    name: 'nested tags',
    input: `
<div id="1">
  hello world
  <h1 id="h1">h1</h1>
  <img src="/src/index.ts">
  <input />
  <div id="2">
    <div id="3">
      <span>span</span>
      <empty></empty>
    </div>
  </div>
</div>
    `,
    nodes: [
      text('\n', 0),
      tag(
        `<div id="1">
  hello world
  <h1 id="h1">h1</h1>
  <img src="/src/index.ts">
  <input />
  <div id="2">
    <div id="3">
      <span>span</span>
      <empty></empty>
    </div>
  </div>
</div>`,
        'div',
        text('<div id="1">', 1),
        [attr(text('id', 6), value('1', '"', 9))],
        [
          text('\n  hello world\n  ', 13),
          tag(
            '<h1 id="h1">h1</h1>',
            'h1',
            text('<h1 id="h1">', 30),
            [attr(text('id', 34), value('h1', '"', 37))],
            [text('h1', 42)],
            text('</h1>', 44),
            30,
          ),
          text('\n  ', 49),
          tag(
            '<img src="/src/index.ts">',
            'img',
            text('<img src="/src/index.ts">', 52),
            [attr(text('src', 57), value('/src/index.ts', '"', 61))],
            void 0,
            null,
            52,
          ),
          text('\n  ', 77),
          tag('<input />', 'input', text('<input />', 80), [], void 0, null, 80),
          text('\n  ', 89),
          tag(
            `<div id="2">
    <div id="3">
      <span>span</span>
      <empty></empty>
    </div>
  </div>`,
            'div',
            text('<div id="2">', 92),
            [attr(text('id', 97), value('2', '"', 100))],
            [
              text('\n    ', 104),
              tag(
                `<div id="3">
      <span>span</span>
      <empty></empty>
    </div>`,
                'div',
                text('<div id="3">', 109),
                [attr(text('id', 114), value('3', '"', 117))],
                [
                  text('\n      ', 121),
                  tag(
                    '<span>span</span>',
                    'span',
                    text('<span>', 128),
                    [],
                    [text('span', 134)],
                    text('</span>', 138),
                    128,
                  ),
                  text('\n      ', 145),
                  tag(
                    '<empty></empty>',
                    'empty',
                    text('<empty>', 152),
                    [],
                    [],
                    text('</empty>', 159),
                    152,
                  ),
                  text('\n    ', 167),
                ],
                text('</div>', 172),
                109,
              ),
              text('\n  ', 178),
            ],
            text('</div>', 181),
            92,
          ),
          text('\n', 187),
        ],
        text('</div>', 188),
        1,
      ),
      text('\n    ', 194),
    ],
  },
  {
    name: 'doctype',
    input: '<!doctype html><html></html>',
    nodes: [
      tag(
        '<!doctype html>',
        '!doctype',
        text('<!doctype html>', 0),
        [attr(text('html', 10))],
        void 0,
        null,
        0,
      ),
      tag('<html></html>', 'html', text('<html>', 15), [], [], text('</html>', 21), 15),
    ],
  },
  {
    name: 'comments',
    input:
      '<!-- normal comment --><!- short comment -><! short-2 comment ><? qm comment ?><![CDATA[ cdata ]]>',
    nodes: [
      tag(
        '<!-- normal comment -->',
        '!--',
        text('<!--', 0),
        [],
        [text(' normal comment ', 4)],
        text('-->', 20),
        0,
      ),
      tag(
        '<!- short comment ->',
        '!',
        text('<!', 23),
        [],
        [text('- short comment -', 25)],
        text('>', 42),
        23,
      ),
      tag(
        '<! short-2 comment >',
        '!',
        text('<!', 43),
        [],
        [text(' short-2 comment ', 45)],
        text('>', 62),
        43,
      ),
      tag(
        '<? qm comment ?>',
        '',
        text('<', 63),
        [],
        [text('? qm comment ?', 64)],
        text('>', 78),
        63,
      ),
      tag(
        '<![CDATA[ cdata ]]>',
        '!',
        text('<!', 79),
        [],
        [text('[CDATA[ cdata ]]', 81)],
        text('>', 97),
        79,
      ),
    ],
  },
  {
    name: 'normal comment special',
    input: '<!---- - -- ---->',
    nodes: [
      tag(
        '<!---- - -- ---->',
        '!--',
        text('<!--', 0),
        [],
        [text('-- - -- --', 4)],
        text('-->', 14),
        0,
      ),
    ],
  },
  {
    name: 'script',
    input: '<script></div></script</script >',
    nodes: [
      tag(
        '<script></div></script</script >',
        'script',
        text('<script>', 0),
        [],
        [text('</div></script', 8)],
        text('</script >', 22),
        0,
      ),
    ],
  },
  {
    name: 'script',
    input: '<style></div></style</style >',
    nodes: [
      tag(
        '<style></div></style</style >',
        'style',
        text('<style>', 0),
        [],
        [text('</div></style', 7)],
        text('</style >', 20),
        0,
      ),
    ],
  },
  {
    name: 'tag name',
    input: '<DIV></DIV>',
    nodes: [tag('<DIV></DIV>', 'div', text('<DIV>', 0), [], [], text('</DIV>', 5), 0, 'DIV')],
  },
];

describe('parse cases', () => {
  for (const scene of scenes) {
    it(`case ${JSON.stringify(scene.name)}`, () => {
      assert.deepStrictEqual(parse(scene.input), scene.nodes);
    });
  }
});

describe('parse options', () => {
  it('should setAttributeMap', () => {
    const ast = parse(`<div same="1" diff="2" same="3" />`, {
      setAttributeMap: true,
    });
    const div = tag(
      '<div same="1" diff="2" same="3" />',
      'div',
      text('<div same="1" diff="2" same="3" />', 0),
      [
        attr(text('same', 5), value('1', '"', index + 1)),
        attr(text('diff', index + 1), value('2', '"', index + 1)),
        attr(text('same', index + 1), value('3', '"', index + 1)),
      ],
      void 0,
      null,
      0,
    );
    div.attributeMap = {
      same: div.attributes[2],
      diff: div.attributes[1],
    };
    expect(ast).toEqual([div]);
  });
});
