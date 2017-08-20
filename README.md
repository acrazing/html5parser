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
import * as html from 'html5parser'

const input = `
<!DOCTYPE html>
<html>
  <body>
    <h1 id="hello">Hello world</h1>
  </body>
</html>
`

const ast = html.parse(input)

html.walk(ast, {
  enter: (node) => {
    if (node.type === html.SyntaxKind.Tag) {
      for (const attr of node.attributes) {
        if (attr.value !== void 0) {
          // This is used for present the ranges of attributes.
          console.log(input.substring(attr.value.start, attr.value.end))
          // you can get the value directly:
          console.log(attr.value.value)
        }
      }
    }
  }
})

// Should output:
// hello
```

## API

```ts
// Top level API, parse html to ast tree
export function parse(input: string): INode[];

// Low level API, get tokens
export function tokenize(input: string): IToken[];

// Utils API, walk the ast tree
export function walk(ast: INode[], options: IWalkOptions): void;
```

## Abstract Syntax Tree Spec

1. `IBaseNode`: the base struct for all the nodes:
    ```ts
    export interface IBaseNode {
      start: number;  // the start position of the node (include)
      end: number;    // the end position of the node (exclude)
    }
    ```
2. `IText`: The text node struct:
    ```ts
    export interface IText extends IBaseNode {
      type: SyntaxKind.Text;
      value: string;  // text value
    }
    ```
3. `ITag`: The tag node struct
    ```ts
    export interface ITag extends IBaseNode {
      type: SyntaxKind.Tag;
      open: IText;  // the open tag, just like <div>, <img/>, etc.
      name: string; // the tag name, just like div, img, etc.
      attributes: IAttribute[]; // the attributes
      body: Array<ITag | IText> // with close tag, if body is empty, it is empty array, just like <div></div>
        | void // self closed, just like <div/>, <img>
        | null; // eof before open tag end just liek <div
      close: IText // with close tag, just like </div>, etc.
        | void // self closed, just like open with <div/> <img>
        | null; // eof before open tag end or without close tag for not self closed tag
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
      quote: '\'' | '"' | void; // the quote type
    }
    ```
6. `INode`: the exposed nodes:
    ```ts
    export type INode = ITag | IText
    ```

## Warning

This is use for HTML5, that means:

1. All tags like `<? ... ?>`, `<! ... >` (except for `<!doctype ...>`, case insensitive)
is treated as `Comment`, that means `CDATASection` is treated as comment.
2. Special tag names:
  - `"!doctype"` (case insensitive), the doctype declaration
  - `"!"`: short comment
  - `"!--"`: normal comment
  - `""`(empty string): short comment, for `<? ... >`, the leading `?` is treated as comment content

## License

[MIT](./LICENSE)
