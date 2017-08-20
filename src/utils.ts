/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-20 21:41:39
 * @version 1.0.0
 * @desc utils.ts
 */

import { tokenize } from './tokenize'

export function inspectToken(input: string): string {
  const tokens = tokenize(input)
  let output   = ''
  let upper    = ''
  let down     = ''
  const max    = 120
  let pos: string
  let value: string
  let width: number
  for (const token of tokens) {
    pos   = token.start.toString()
    value = JSON.stringify(token.value)
    value = value.substr(1, value.length - 2)
    width = Math.max(pos.length, value.length) + 1
    upper += value.padEnd(width, ' ') + '|'
    down += pos.padEnd(width, ' ') + '|'
    if (upper.length > max) {
      output += `${upper}\n${down}\n\n`
      upper = ''
      down  = ''
    }
  }
  if (upper.length > 0) {
    output += `${upper}\n${down}\n`
  }
  return output
}

if (!module.parent) {
  console.log(inspectToken(`
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
    `))
}
