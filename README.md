# html5parser

`html5parser` is a super fast and tiny **HTML5** parser.

## Highlights

- **[Fast](#benchmark)**: maybe the fastest one you can find on GitHub.
- **Tiny**: the fully packaged bundle size is less than `5kb`.
- **Cross platform**: works in the modern browsers and Node.js.
- **[HTML5 only](#warnings)**: any thing not in the specification will be ignored.
- **Accurate**: every token could be located in source file.

## Table of Contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [API Reference](#api-reference)
  - Core
  - [tokenize()](#tokenizeinput)
  - [parse()](#parseinput)
  - Utilities
  - [walk()](#walkast-options)
  - [safeHtml()](#safehtmlinput)
    - [safeHtmlDefaultOptions](#safehtmldefaultoptions)
- [Warnings](#warnings)
- [Benchmark](#benchmark)

## Installation

1. Package manager

   ```bash
   npm i -S html5parser

   # or var yarn
   yarn add html5parser
   ```

2. CDN

   ```html
   <script src="https://unpkg.com/html5parser@latest/dist/html5parser.umd.js"></script>
   ```

## Quick start

[![Edit html5parser - quick start](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/keen-wind-2mpwr?fontsize=14&hidenavigation=1&theme=dark)

```typescript jsx
import { parse, walk, SyntaxKind } from 'html5parser';

const ast = parse('<!DOCTYPE html><head><title>Hello html5parser!</title></head></html>');

walk(ast, {
  enter: (node) => {
    if (node.type === SyntaxKind.Tag && node.name === 'title' && Array.isArray(node.body)) {
      const text = node.body[0];
      if (text.type !== SyntaxKind.Text) {
        return;
      }
      const div = document.createElement('div');
      div.innerHTML = `The title of the input is <strong>${text.value}</strong>`;
      document.body.appendChild(div);
    }
  },
});
```

## API Reference

### tokenize(input)

Low level API to parse string to tokens:

```typescript jsx
function tokenize(input: string): IToken[];
```

- `IToken`

  ```typescript jsx
  interface IToken {
    start: number;
    end: number;
    value: string;
    type: TokenKind;
  }
  ```

- `TokenKind`

  ```typescript jsx
  const enum TokenKind {
    Literal,
    OpenTag, // trim leading '<'
    OpenTagEnd, // trim tailing '>', only could be '/' or ''
    CloseTag, // trim leading '</' and tailing '>'
    Whitespace, // the whitespace between attributes
    AttrValueEq,
    AttrValueNq,
    AttrValueSq,
    AttrValueDq,
  }
  ```

### parse(input)

Core API to parse string to AST:

```typescript jsx
function parse(input: string, options?: ParseOptions): INode[];
```

- `ParseOptions`

  ```typescript jsx
  interface ParseOptions {
    // create tag's attributes map
    // if true, will set ITag.attributeMap property
    // as a `Record<string, IAttribute>`
    setAttributeMap: boolean;
  }
  ```

- `INode`

  ```typescript jsx
  export type INode = IText | ITag;
  ```

- `ITag`

  ```typescript jsx
  export interface ITag extends IBaseNode {
    type: SyntaxKind.Tag;
    // original open tag, <Div id="id">
    open: IText;
    // lower case tag name, div
    name: string;
    // original case tag name, Div
    rawName: string;
    attributes: IAttribute[];
    // the attribute map, if `options.setAttributeMap` is `true`
    // this will be a Record, key is the attribute name literal,
    // value is the attribute self.
    attributeMap: Record<string, IAttribute> | undefined;
    body:
      | Array<ITag | IText> // with close tag
      | undefined // self closed
      | null; // EOF before open tag end
    // original close tag, </DIV >
    close:
      | IText // with close tag
      | undefined // self closed
      | null; // EOF before end or without close tag
  }
  ```

- `IAttribute`

  ```typescript jsx
  export interface IAttribute extends IBaseNode {
    name: IText;
    value: IAttributeValue | undefined;
  }
  ```

- `IAttributeValue`

  ```typescript jsx
  export interface IAttributeValue extends IBaseNode {
    value: string;
    quote: "'" | '"' | undefined;
  }
  ```

- `IText`

  ```typescript jsx
  export interface IText extends IBaseNode {
    type: SyntaxKind.Text;
    value: string;
  }
  ```

- `IBaseNode`

  ```typescript jsx
  export interface IBaseNode {
    start: number;
    end: number;
  }
  ```

- `SyntaxKind`

  ```typescript jsx
  export enum SyntaxKind {
    Text = 'Text',
    Tag = 'Tag',
  }
  ```

### walk(ast, options)

Visit all the nodes of the AST with specified callbacks:

```typescript jsx
function walk(ast: INode[], options: WalkOptions): void;
```

- `IWalkOptions`

  ```typescript jsx
  export interface IWalkOptions {
    enter?(node: INode, parent: INode | void, index: number): void;
    leave?(node: INode, parent: INode | void, index: number): void;
  }
  ```

### safeHtml(input)

Parse input to AST and keep the tags and attributes by whitelists, and then
print it to a string.

```typescript jsx
function safeHtml(input: string, options?: Partial<SafeHtmlOptions>): string;
```

<a name="safehtmloptions"></a>

- `SafeHtmlOptions`

  ```typescript jsx
  export interface SafeHtmlOptions {
    allowedTags: string[];
    allowedAttrs: string[];
    tagAllowedAttrs: Record<string, string[]>;
    allowedUrl: RegExp;
  }
  ```

#### safeHtmlDefaultOptions

The default options of [`safeHtml`](#safehtmlinput), you can modify it, its
effect is global.

```typescript jsx
const safeHtmlDefaultOptions: SafeHtmlOptions;
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

```
The MIT License (MIT)

Copyright (c) 2020 acrazing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
