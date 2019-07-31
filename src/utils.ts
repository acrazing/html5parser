/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-20 21:41:39
 * @version 1.0.0
 * @desc utils.ts
 */

import { tokenize } from './tokenize';

export function inspectToken(input: string): string {
  const tokens = tokenize(input);
  let output = '';
  let upper = '';
  let down = '';
  const max = 120;
  let pos: string;
  let value: string;
  let width: number;
  for (const token of tokens) {
    pos = token.start.toString();
    value = JSON.stringify(token.value);
    value = value.substr(1, value.length - 2);
    width = Math.max(pos.length, value.length) + 1;
    upper += value.padEnd(width, ' ') + '|';
    down += pos.padEnd(width, ' ') + '|';
    if (upper.length > max) {
      output += `${upper}\n${down}\n\n`;
      upper = '';
      down = '';
    }
  }
  if (upper.length > 0) {
    output += `${upper}\n${down}\n`;
  }
  return output;
}

export function getLineRanges(input: string) {
  return input.split('\n').reduce(
    (arr, line) => {
      arr.push(line.length + 1 + arr[arr.length - 1]);
      return arr;
    },
    [0],
  );
}

export function getPosition(
  ranges: number[],
  offset: number,
): [number, number] {
  let line = NaN;
  let column = NaN;
  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i] > offset) {
      line = i;
      column = offset - ranges[i - 1] + 1;
      break;
    }
  }
  return [line, column];
}
