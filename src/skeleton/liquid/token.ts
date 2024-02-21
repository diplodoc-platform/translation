export type Token = {
    type: TokenType;
    value: string;
};

export type TokenType = 'text' | 'hardbreak' | 'liquid' | 'variable';

export type TokenSubType =
    | If
    | Else
    | EndIf
    | Function
    | Filter
    | Variable
    | ForInLoop
    | EndForInLoop
    | Newline
    | Include
    | ListTabs
    | EndListTabs
    | Attributes
    | Literal;

export type Literal = 'Literal';
export type Space = 'Space';
export type Newline = 'Newline';
export type If = 'If';
export type Else = 'Else';
export type EndIf = 'EndIf';
export type Function = 'Function';
export type Filter = 'Filter';
export type Variable = 'Variable';
export type ForInLoop = 'ForInLoop';
export type EndForInLoop = 'EndForInLoop';
export type Include = 'Include';
export type ListTabs = 'ListTabs';
export type EndListTabs = 'EndListTabs';
export type Attributes = 'Attributes';
