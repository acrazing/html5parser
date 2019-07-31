/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 15:56:14
 * @version 1.0.0
 * @desc config.ts
 */

function createMap<T>(
  keys: string,
  value: T,
): { [key: number]: T; [key: string]: T } {
  return keys.split(',').reduce(
    (pre, now) => {
      pre[now] = value;
      return pre;
    },
    {} as any,
  );
}

export const selfCloseTags = createMap<true>(
  'area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr,!doctype,,!,!--',
  true,
);

export const rawTextTags = createMap<true>('script,style', true);

export const noNestedTags = createMap<true>('li,option,select,textarea', true);

export const ANY: any = void 0;
