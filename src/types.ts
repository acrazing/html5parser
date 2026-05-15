/*
 * @author acrazing joking.young@gmail.com
 * @since 2017-08-18 15:17:51
 */

/**
 * Node kinds returned by the parser.
 */
export enum SyntaxKind {
  /**
   * Plain text content.
   */
  Text = 'Text',
  /**
   * HTML tag node.
   */
  Tag = 'Tag',
}

/**
 * Common source range shared by every AST node.
 */
export interface IBaseNode {
  /**
   * Zero-based start offset in the source string.
   */
  start: number;
  /**
   * Zero-based end offset in the source string.
   */
  end: number;
}

/**
 * Text node in the parsed AST.
 */
export interface IText extends IBaseNode {
  /**
   * Discriminator for text nodes.
   */
  type: SyntaxKind.Text;
  /**
   * Original text content.
   */
  value: string;
}

/**
 * Parsed attribute value, with quote information preserved.
 */
export interface IAttributeValue extends IBaseNode {
  /**
   * Attribute value without surrounding quotes.
   */
  value: string;
  /**
   * Quote character used by the source value, or undefined for unquoted values.
   */
  quote: "'" | '"' | undefined;
}

/**
 * Parsed tag attribute.
 */
export interface IAttribute extends IBaseNode {
  /**
   * Attribute name token.
   */
  name: IText;
  /**
   * Attribute value, if the source provided one.
   */
  value: IAttributeValue | undefined;
}

/**
 * Tag node in the parsed AST.
 */
export interface ITag extends IBaseNode {
  /**
   * Discriminator for tag nodes.
   */
  type: SyntaxKind.Tag;
  /**
   * Original opening tag text, such as <Div id="id">.
   */
  open: IText;
  /**
   * Lowercase tag name, such as div.
   */
  name: string;
  /**
   * Tag name with original casing, such as Div.
   */
  rawName: string;
  /**
   * Attributes in source order.
   */
  attributes: IAttribute[];
  /**
   * Attribute lookup map when ParseOptions.setAttributeMap is true.
   */
  attributeMap: Record<string, IAttribute> | undefined;
  /**
   * Child nodes for paired tags, undefined for self-closed tags, or null when the opening tag is incomplete.
   */
  body: Array<ITag | IText> | undefined | null;
  /**
   * Original closing tag text, undefined for self-closed tags, or null when missing.
   */
  close: IText | undefined | null;
}

/**
 * Any node returned by parse.
 */
export type INode = IText | ITag;
