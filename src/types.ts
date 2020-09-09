/*!
 *
 * Copyright 2017 - acrazing
 *
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-18 15:17:51
 * @version 1.0.0
 * @desc types.ts
 */

export enum SyntaxKind {
  Text = 'Text',
  Tag = 'Tag',
}

export interface IBaseNode {
  start: number;
  end: number;
}

export interface IText extends IBaseNode {
  type: SyntaxKind.Text;
  value: string;
}

export interface IAttributeValue extends IBaseNode {
  value: string;
  quote: "'" | '"' | undefined;
}

export interface IAttribute extends IBaseNode {
  name: IText;
  value: IAttributeValue | undefined;
}

export interface ITag extends IBaseNode {
  type: SyntaxKind.Tag;
  // original open tag, <Div id="id">
  open: IText;
  // lower case tag name, div
  name: string;
  // original case tag name, Div
  rawName: string;
  attributes: IAttribute[];
  // the attribute map, if `options.setAttributeMap` is `true`
  // this will be a Record, key is the attribute name literal,
  // value is the attribute self.
  attributeMap: Record<string, IAttribute> | undefined;
  body:
    | Array<ITag | IText> // with close tag
    | undefined // self closed
    | null; // EOF before open tag end
  // original close tag, </DIV >
  close:
    | IText // with close tag
    | undefined // self closed
    | null; // EOF before end or without close tag
}

export type INode = IText | ITag;
