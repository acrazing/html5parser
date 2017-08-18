# html5parser

A simple and fast html5 parser, the result could be manipulated like
ECMAScript ESTree, especially about the attributes.

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

const ast = html.parse()

html.walk(ast, {
  enter: (node) => {
    if (node.type === html.SyntaxKind.Tag) {
      for (const attr of node.attributes) {
        if (attr.value !== void 0) {
          console.log(input.substring(attr.value.start, attr.value.end))
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
```

## Spec

The AST tree structure: [types.ts](./src/types.ts)

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
