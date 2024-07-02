import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import {Consumer} from 'src/consumer';
import {Liquid} from 'src/skeleton/liquid';
import {token} from 'src/utils';
import {mt} from 'src/symbols';

function isAutolink(token: Token) {
  return token.markup === 'autolink';
}

function isRefLink(open: Token, text: Token, close: Token) {
  if (open?.type !== 'link_open') {
    return false;
  }

  if (text?.type !== 'text') {
    return false;
  }

  if (close?.type !== 'link_close') {
    return false;
  }

  return text?.content === '{#T}';
}

function find(type: string, tokens: Token[], idx: number) {
  while (tokens.length > idx) {
    if (tokens[idx].type === type) {
      return tokens[idx];
    }
    idx++;
  }

  return null;
}

export const link: Renderer.RenderRuleRecord = {
  link_open: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
    const open = tokens[idx];
    const close = find('link_close', tokens, idx + 1) as Token;

    if (isAutolink(open)) {
      const autolink = token('link_auto', {
        content: '<' + Liquid.unescape(tokens[idx + 1].content) + '>',
      });

      tokens.splice(idx, 3, autolink);

      return '';
    }

    // Fake content is important for segmentation.
    // It forces to properly split same strings
    // "A [](./empty/link). B."
    if (close === tokens[idx + 1]) {
      tokens.splice(idx + 1, 0, token('text', {content: mt}));
    }

    const text = tokens[idx + 1];

    open.skip = '[';
    close.open = open;

    if (isRefLink(open, text, close)) {
      open.reflink = true;
      text.reflink = true;
    }

    open.attrSet('href', Liquid.unescape(open.attrGet('href') || ''));

    return '';
  },
  link_close: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
    const close = tokens[idx];
    const open = close.open;

    if (open?.type !== 'link_open') {
      throw new Error('failed to render link token');
    }

    const titleAttr = Liquid.unescape(open.attrGet('title') || '');

    const skip = (close.skip = (close.skip || []) as string[]);
    skip.push(')');

    if (titleAttr) {
      const consumer = new Consumer(titleAttr, this.state, this.state.hash);
      const tokenizer = new Liquid(titleAttr);
      const tokens = tokenizer.tokenize();
      const parts = consumer.process(tokens);

      open.attrSet('title', consumer.content);
      close.beforeDrop = (consumer: Consumer) => {
        parts.forEach(({part, past}) => consumer.consume(part, past));
      };
    } else {
      skip.unshift('(');
    }

    return '';
  },
};
