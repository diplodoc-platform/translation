export type NonEmptyString = '${.*}';

export type Gobbler<I = string | Token | (string | Token)[]> = (
  content: string,
  window: [number, number],
  token: I,
  index: number,
) => [number, number] | [number, number, string];
