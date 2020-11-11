/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-20 21:41:39
 * @version 1.0.0
 * @desc utils.ts
 */

export function getLineRanges(input: string) {
  return input.split('\n').reduce(
    (arr, line) => {
      arr.push(line.length + 1 + arr[arr.length - 1]);
      return arr;
    },
    [0],
  );
}

export function getPosition(ranges: number[], offset: number): [number, number] {
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
