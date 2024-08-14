export type Token = {
    type: TokenType;
    value: string;
};

export type TokenType = 'text' | 'hardbreak' | 'liquid' | 'variable';

export type TokenSubType = Function | Filter | Variable | Attributes | Literal;

export type Literal = 'Literal';
export type Function = 'Function';
export type Filter = 'Filter';
export type Variable = 'Variable';
export type Attributes = 'Attributes';
