# html5parser

A simple and fast html5 parser, the result could be manipulated like
ECMAScript ESTree, especially about the attributes.

## Introduction

Currently, all the public parsers, like `htmlparser2`, `parser5`, etc,
could not be used for manipulate attributes. For example: the `htmlparser2`
has `startIndex` and `endIndex` for tags and texts, but no range information
about attribute name and values. This project is used for resolve this problem.
Just added ranges for tags, texts, and attribute name and values, and else,
with the information of attribute quote type, (without or with `'`/`"`).

## Install

```bash
# var npm
npm install html5parser -S

# var yarn
yarn add html5parser
```

## Quick Start

```ts
import * as html from 'html5parser';

const input = `
<!DOCTYPE html>
<html>
  <body>
    <h1 id="hello">Hello world</h1>
  </body>
</html>
`;

const ast = html.parse(input);

html.walk(ast, {
  enter: (node) => {
    if (node.type === html.SyntaxKind.Tag) {
      for (const attr of node.attributes) {
        if (attr.value !== void 0) {
          // This is used for present the ranges of attributes.
          console.log(input.substring(attr.value.start, attr.value.end));
          // you can get the value directly:
          console.log(attr.value.value);
        }
      }
    }
  },
});

// Should output:
// hello
```

## API

```ts
// Top level API, parse html to ast tree
export function parse(input: string, options?: ParseOptions): INode[];

export interface ParseOptions {
  // create tag's attributes map
  // if true, will set ITag.attributeMap property
  // as a `Record<string, IAttribute>`
  // see {ITag#attributeMap} bellow
  setAttributeMap: boolean;
}

// Low level API, get tokens
export function tokenize(input: string): IToken[];

// Utils API, walk the ast tree
export function walk(ast: INode[], options: IWalkOptions): void;
```

## Abstract Syntax Tree Spec

1. `IBaseNode`: the base struct for all the nodes:

   ```ts
   export interface IBaseNode {
     start: number; // the start position of the node (include)
     end: number; // the end position of the node (exclude)
   }
   ```

2. `IText`: The text node struct:

   ```ts
   export interface IText extends IBaseNode {
     type: SyntaxKind.Text;
     value: string; // text value
   }
   ```

3. `ITag`: The tag node struct

   ```ts
   export interface ITag extends IBaseNode {
     type: SyntaxKind.Tag;
     open: IText;
     name: string;
     attributes: IAttribute[];
     // the attribute map, if `options.setAttributeMap` is `true`
     // this will be a Record, key is the attribute name literal,
     // value is the attribute self.
     attributeMap: Record<string, IAttribute> | undefined;
     body:
       | Array<ITag | IText> // with close tag
       | undefined // self closed
       | null; // EOF before open tag end
     close:
       | IText // with close tag
       | undefined // self closed
       | null; // EOF before end or without close tag
   }
   ```

4. `IAttribute`: the attribute struct:

   ```ts
   export interface IAttribute extends IBaseNode {
     name: IText; // the name of the attribute
     value: IAttributeValue | void; // the value of the attribute
   }
   ```

5. `IAttributeValue`: the attribute value struct:

   ```ts
   // NOTE: the range start and end contains quotes.
   export interface IAttributeValue extends IBaseNode {
     value: string; // the value text, exclude leading and tailing `'` or `"`
     quote: "'" | '"' | void; // the quote type
   }
   ```

6. `INode`: the exposed nodes:

   ```ts
   export type INode = ITag | IText;
   ```

## Warnings

This is use for HTML5, that means:

1. All tags like `<? ... ?>`, `<! ... >` (except for `<!doctype ...>`, case insensitive)
   is treated as `Comment`, that means `CDATASection` is treated as comment.
2. Special tag names:

- `"!doctype"` (case insensitive), the doctype declaration
- `"!"`: short comment
- `"!--"`: normal comment
- `""`(empty string): short comment, for `<? ... >`, the leading `?` is treated as comment content

## Benchmark

Thanks for [htmlparser-benchmark](https://github.com/AndreasMadsen/htmlparser-benchmark),
I created a pull request at [pulls/7](https://github.com/AndreasMadsen/htmlparser-benchmark/pull/7/files),
and its result on my MacBook Pro is:

```bash
$ npm test

> htmlparser-benchmark@1.1.3 test ~/htmlparser-benchmark
> node execute.js

gumbo-parser failed (exit code 1)
high5 failed (exit code 1)

html-parser        : 28.6524 ms/file ± 21.4282

html5              : 130.423 ms/file ± 161.478

html5parser        : 2.37975 ms/file ± 3.30717

htmlparser         : 16.6576 ms/file ± 109.840

htmlparser2-dom    : 3.45602 ms/file ± 5.05830

htmlparser2        : 2.61135 ms/file ± 4.33535
hubbub failed (exit code 1)
libxmljs failed (exit code 1)

neutron-html5parser: 2.89331 ms/file ± 2.94316
parse5 failed (exit code 1)

sax                : 10.2110 ms/file ± 13.5204
```

## License

[MIT](./LICENSE)
