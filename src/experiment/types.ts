import {Token} from 'markdown-it';

export interface ExtraToken {
  start: number;
  end: number;
  level: number;
  yamlToken?: Token;
  id?: string;
  linePosList?: LinePosition[];
}

export type TokenExtraMap = Map<Token, ExtraToken>;

export interface ReplacePart extends ExtraToken {
  id: string;
  token: Token;
}

export interface LinePosition {
  start: number;
}
