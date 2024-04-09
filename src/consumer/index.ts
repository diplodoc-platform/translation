import {token} from 'src/utils';
import {dropUselessTokens, eruler, gobble} from './utils';
import {split} from './split';

const replace = (from: number, to: number, source: string, past: string) => {
  const start = source.slice(0, from);
  const end = source.slice(to);

  return start + past + end;
};

const last = <T>(array: T[], fallback: T): T => array.length ? array[array.length - 1] : fallback;

function countStartIndexes(acc: number[], line: string) {
  acc.push(acc[acc.length - 1] + line.length + 1);

  return acc;
}

export type ConsumerOptions = {
  compact?: boolean;
  code?: CodeProcessing;
};

export enum CodeProcessing {
  NO = 'no',
  ALL = 'all',
  PRECISE = 'precise',
  ADAPTIVE = 'adaptive',
}

export class Consumer {
  gap = 0;

  lines: number[];

  compact: boolean;

  content: string;

  code: CodeProcessing | undefined;

  hash: (tokens: Token[]) => string;

  get limit() {
    return last(this.limits, Infinity) + this.gap;
  }

  private cursor = 0;

  private limits: number[] = [];

  constructor(content: string, options: ConsumerOptions, hash: (tokens: Token[]) => string) {
    this.lines = content.split('\n').reduce(countStartIndexes, [0]);
    this.compact = Boolean(options.compact);
    this.code = options.code;
    this.content = content;
    this.hash = hash;
  }

  process = (tokens: Token | Token[], window?: [number, number] | null) => {
    tokens = ([] as Token[]).concat(tokens);

    if (window) {
      this.setWindow(window);
    }

    const parts = split(tokens);

    const result = parts.map((part) => this.consume(part)).filter(Boolean) as {
      part: Token[];
      past: string;
    }[];

    if (window) {
      this.unsetWindow();
    }

    return result;
  };

  consume = (part: Token[], past?: string) => {
    let [before, tokens, after] = dropUselessTokens(part);

    if (!this.compact && tokens.length) {
      [before, tokens, after] = [[], part, []];
    }

    if (before.length) {
      this.drop(before);
      const [start, end] = this.erule(before);
      this.cursor = start > -1 ? end : this.cursor;
    }

    if (tokens.length === 1 && tokens[0].type !== 'text') {
      tokens[0] = token('text', {
        content: tokens[0].content,
      });
    }

    if (tokens.length) {
      // erule has side effects and can modify tokens content
      // so we need to generate xliff only after original content replacement
      const [start, end] = this.erule(tokens);
      past = past || this.hash(tokens);

      this.content = replace(start, end, this.content, past);
      this.cursor = start + past.length;
      this.gap -= end - start - past.length;
    }

    if (after.length) {
      this.drop(after);
      const [start, end] = this.erule(after);
      this.cursor = start > -1 ? end : this.cursor;
    }

    return past ? {part, past} : null;
  };

  private erule(tokens: Token[]) {
    return eruler(
      this.content,
      [this.cursor, this.limit],
      tokens,
      (content, [start, end], token, i) => {
        const [from, to, match] = gobble(content, [start, end], token, i);

        token.map = [from, to];

        if (match) {
          token.content = match;
        }

        if (token.erule) {
          token.erule(this, tokens, i, [from, to]);
        }

        return [from, to];
      },
    );
  }

  private drop(tokens: Token[]) {
    tokens.forEach((token, i) => {
      if (token.beforeDrop) {
        token.beforeDrop(this, tokens[i - 1] || null, tokens[i + 1] || null);
      }
    });
  }

  private setWindow(map: [number, number] | null | undefined, gap?: number) {
    map = map || [0, this.lines.length - 1];
    gap = gap || this.gap;

    const [start, end] = [this.lines[map[0]] + gap, this.lines[map[1]]];

    this.limits.push(end);

    if (start >= this.cursor) {
      this.cursor = start;
    }
  }

  private unsetWindow() {
    this.limits.pop();
  }
}
