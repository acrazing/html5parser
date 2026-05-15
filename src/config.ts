/*
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-19 15:56:14
 */

/**
 * HTML tags that do not require closing tags.
 */
export const selfCloseTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  '!doctype',
  '',
  '!',
  '!--',
]);

/**
 * Tags that implicitly close a previous tag of the same name.
 */
export const noNestedTags = new Set(['li', 'option', 'select', 'textarea']);
