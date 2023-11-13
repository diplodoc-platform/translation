export type Token = {
    type: TokenType;
    value: string;
};

export type TokenType =
    | If
    | Else
    | EndIf
    | Function
    | Filter
    | Variable
    | ForInLoop
    | EndForInLoop
    | Text
    | Space
    | Newline;

export type Text = 'Text';
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
