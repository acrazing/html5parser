/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-18 16:57:10
 * @version 1.0.0
 * @desc ts.ts
 */

let code: 1 | 2

function change(value: 1 | 2) {
  code = value
}

function detect() {
  code = 1
  LOOP:
    while (true) {
      switch (code) {
        case 1:
          change(2)
          break
        default:
          break LOOP
      }
    }
}