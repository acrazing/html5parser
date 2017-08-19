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
  Literal     = 'Literal',
  Attribute   = 'Attribute',
  Declaration = 'Declaration',
  Tag         = 'Tag',
}

export interface IBaseNode {
  start: number;
  end: number;
}

export interface ILiteral extends IBaseNode {
  type: SyntaxKind.Literal;
  value: string;
}

export interface IDeclaration extends IBaseNode {
  type: SyntaxKind.Declaration;
  value: string;
  quote: '\'' | '"' | void;
}

export interface IAttribute extends IBaseNode {
  type: SyntaxKind.Attribute;
  name: IDeclaration;
  value: IDeclaration | void;
}

export interface ITag extends IBaseNode {
  type: SyntaxKind.Tag;
  open: ILiteral;
  name: ILiteral;
  attributes: IAttribute[];
  body: Array<ITag | ILiteral> // with close tag
    | void // self closed
    | null; // eof before open tag end
  close: ILiteral // with close tag
    | void // self closed
    | null; // eof before open tag end or without close tag for not self closed tag
}

export type INode = ILiteral | IAttribute | ITag | IDeclaration
