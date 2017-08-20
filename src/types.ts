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
  Tag  = 'Tag',
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
  quote: '\'' | '"' | void;
}

export interface IAttribute extends IBaseNode {
  name: IText;
  value: IAttributeValue | void;
}

export interface ITag extends IBaseNode {
  type: SyntaxKind.Tag;
  open: IText;
  name: string;
  attributes: IAttribute[];
  body: Array<ITag | IText> // with close tag
    | void // self closed
    | null; // eof before open tag end
  close: IText // with close tag
    | void // self closed
    | null; // eof before open tag end or without close tag for not self closed tag
}

export type INode = IText | ITag
