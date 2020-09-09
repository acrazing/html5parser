/*
 * @since 2020-09-09 22:43:03
 * @author acrazing <joking.young@gmail.com>
 */

import { parse } from '../parse';
import { tag, text } from '../parse.spec';

describe('issue #7', () => {
  it('should parse comment as expected', () => {
    expect(parse('<!-- it is comment -->\n-\n')).toEqual([
      tag(
        '<!-- it is comment -->',
        '!--',
        text('<!--', 0),
        [],
        [text(' it is comment ')],
        text('-->'),
        0,
      ),
      text('\n-\n'),
    ]);
  });
});
