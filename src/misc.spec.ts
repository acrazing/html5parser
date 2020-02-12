/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-22 22:17:46
 * @version 1.0.0
 * @desc misc.spec.ts
 */

import * as fs from 'fs-extra';
import fetch from 'node-fetch';
import * as path from 'path';
import { parse } from './parse';

function run(url: string) {
  const id = url.replace(/[^\w\d]+/g, '_').replace(/^_+|_+$/g, '');
  return fetch(url)
    .then((r) => r.text())
    .then((d) => {
      console.log('[FETCH:OK]: %s', url);
      fs.outputFileSync(path.join(process.cwd(), 'temp', `${id}.html`), d);
      console.time('parse:' + url);
      const ast = parse(d);
      console.timeEnd('parse:' + url);
      fs.outputJSONSync(path.join(process.cwd(), 'temp', `${id}.json`), ast, {
        spaces: 2,
      });
    })
    .catch((err) => {
      console.error('[ERR]: %s, %s', id, err.message);
    });
}

const scenes = [
  'https://www.baidu.com/',
  'https://www.qq.com/?fromdefault',
  'https://www.taobao.com/',
];

describe('real scenarios', () => {
  for (const scene of scenes) {
    it(`parse ${scene}`, async () => run(scene));
  }
});
