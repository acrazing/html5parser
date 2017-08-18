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
  Literal   = 'Literal',
  Attribute = 'Attribute',
  Tag       = 'Tag',
}

export interface IBaseNode {
  start: number;
  end: number;
}

export interface ILiteral extends IBaseNode {
  type: SyntaxKind.Literal;
  value: string;
}

export interface IAttribute extends IBaseNode {
  type: SyntaxKind.Attribute;
  name: ILiteral;
  value: ILiteral | void;
}

export interface ITag extends IBaseNode {
  type: SyntaxKind.Tag;
  open: ILiteral;
  name: ILiteral;
  attributes: IAttribute[];
  body: Array<ITag | ILiteral> | void | null;
  close: /* with close tag */ ILiteral | /* without close tag */ void | /* input ended before close */ null;
}

export type INode = ILiteral | IAttribute | ITag
