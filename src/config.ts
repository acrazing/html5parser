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
  'basefont',
  'bgsound',
  'br',
  'col',
  'command',
  'embed',
  'frame',
  'hr',
  'image',
  'img',
  'input',
  'keygen',
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

/**
 * Tags whose content is parsed as RCDATA.
 */
export const rcDataTags = new Set(['title', 'textarea']);

/**
 * Tags whose content is parsed as RAWTEXT.
 */
export const rawTextTags = new Set(['style', 'xmp', 'iframe', 'noembed', 'noframes']);

/**
 * Tags whose content is parsed as script data.
 */
export const scriptDataTags = new Set(['script']);

/**
 * Tags whose content is parsed as RAWTEXT when scripting is enabled.
 */
export const scriptingRawTextTags = new Set(['noscript']);

/**
 * Tags whose content is parsed as plain text until EOF.
 */
export const plainTextTags = new Set(['plaintext']);
