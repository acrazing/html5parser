/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-22 22:17:46
 * @version 1.0.0
 * @desc misc.spec.ts
 */

import * as fs from 'fs'
import fetch from 'node-fetch'
import * as path from 'path'
import { parse } from './parse'

function run(id: string, url: string) {
  fetch(url).then((r) => r.text()).then((d) => {
    fs.writeFileSync(path.join(process.cwd(), 'temp', `${id}.html`), d)
    const ast = parse(d)
    fs.writeFileSync(path.join(process.cwd(), 'temp', `${id}.json`), JSON.stringify(ast, void 0, 2))
    console.log('[OK]: %s, %s', id, url)
  }).catch((err) => {
    console.error('[ERR]: %s, %s', id, err.message)
  })
}

for (const scene of [
  [
    'baidu',
    'https://www.baidu.com/',
  ],
  [
    'same',
    'https://same.com',
  ],
  [
    'github',
    'https://github.com',
  ],
  [
    'tieba',
    'https://tieba.baidu.com',
  ],
]) {
  run(scene[0], scene[1])
}
