import type {CustomRendererHookParameters} from 'src/renderer';
import {token} from 'src/utils';
import {gobble} from 'src/consumer/utils';

export function beforeInline(parameters: CustomRendererHookParameters) {
  const tokens = parameters.tokens as Token[];

  for (let idx = 0; idx < tokens.length; idx++) {
    if (tokens[idx].type === 'code_inline') {
      splitInlineCode(tokens, idx);
    }

    if (['softbreak', 'hardbreak'].includes(tokens[idx].type)) {
      fixBreak(tokens[idx]);
    }
  }

  return '';
}

function find(tokens: Token[], idx: number, step: number) {
  while (tokens.length > idx && idx > 0) {
    idx = idx + step;

    const token = tokens[idx];
    if (token && (token.content || token.skip || token.markup)) {
      return token;
    }
  }

  return null;
}

function fixBreak(_break: Token) {
  _break.content = '\n';
  _break.erule = function (consumer, tokens, idx) {
    const curr = tokens[idx];
    const next = find(tokens, idx, 1);
    const prev = find(tokens, idx, -1);

    let [from, to] = curr.map as [number, number];

    if (next) {
      const [_from] = gobble(consumer.content, [to, consumer.limit], next, idx);

      if (_from !== to && _from > -1) {
        to = _from;
      }
    }

    if (prev && prev.map && prev.map[1] !== from) {
      from = prev.map[1];
    }

    curr.content = consumer.content.slice(from, to);
    curr.map = [from, to];
  };
}

function splitInlineCode(tokens: Token[], idx: number) {
  const open = token('code_inline_open', {
    content: '',
    markup: tokens[idx].markup,
    skip: tokens[idx].markup,
    erule: (consumer, tokens, idx) => {
      const next = tokens[idx + 1];
      if (next && open.map) {
        const nextCh = consumer.content[open.map[1]];
        if (nextCh === ' ' && !next.content.startsWith(' ')) {
          open.markup += ' ';
        }
      }
    },
  } as Partial<Token>);

  const text = token('text', {
    // stupid special case
    content: ['`', '``', '```'].includes(tokens[idx].content)
      ? ' ' + tokens[idx].content + ' '
      : tokens[idx].content,
  });

  const close = token('code_inline_close', {
    content: '',
    markup: tokens[idx].markup,
    skip: tokens[idx].markup,
    erule: (consumer, tokens, idx) => {
      const prev = tokens[idx - 1];
      if (prev && close.map) {
        const prevCh = consumer.content[close.map[0] - 1];
        if (prevCh === ' ' && !prev.content.endsWith(' ')) {
          close.markup = ' ' + close.markup;
        }
      }
    },
  } as Partial<Token>);

  tokens.splice(idx, 1, open, text, close);
}
