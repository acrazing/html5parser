/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-18 15:40:16
 * @version 1.0.0
 * @desc entities.d.ts
 */

declare module 'entities/lib/decode' {
  export function XML(data: string): string;

  export function HTML(data: string): string;

  export function HTMLStrict(data: string): string;
}

declare module 'entities/lib/decode_codepoint' {
  function decodeCodePoint(codePoint: number): string;

  export = decodeCodePoint
}

declare module 'entities/lib/encode' {
  export function XML(data: string): string;

  export function HTML(data: string): string;

  export function escape(data: string): string;
}

declare module 'entities/maps/decode.json' {
  const decodeMap: {
    [key: number]: number;
    [key: string]: number;
  }

  export = decodeMap
}

declare module 'entities/maps/entities.json' {
  const entitiesMap: {
    [key: string]: string;
  }

  export = entitiesMap
}

declare module 'entities/maps/legacy.json' {
  const legacyMap: {
    [key: string]: string;
  }

  export = legacyMap
}

declare module 'entities/maps/xml.json' {
  const xmlMap: {
    [key: string]: string;
  }

  export = xmlMap
}

declare module 'entities' {
  export function decode(data: string, level?: number): string;

  export function decodeStrict(data: string, level?: number): string;

  export function encode(data: string, level?: number): string;

  export function encodeXML(data: string): string;

  export function encodeHTML4(data: string): string;

  export function encodeHTML5(data: string): string;

  export function encodeHTML(data: string): string;

  export function decodeXML(data: string): string;

  export function decodeXMLStrict(data: string): string;

  export function decodeHTML4(data: string): string;

  export function decodeHTML5(data: string): string;

  export function decodeHTML(data: string): string;

  export function decodeHTML4Strict(data: string): string;

  export function decodeHTML5Strict(data: string): string;

  export function decodeHTMLStrict(data: string): string;

  export function escape(data: string): string;
}