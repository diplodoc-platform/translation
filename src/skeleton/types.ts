export type NonEmptyString = '${.*}';

export type Gobbler<O = any, I = string | Token | (string | Token)[]> = (content: string, window: [number, number], token: I) => O;