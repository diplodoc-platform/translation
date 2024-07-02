import Renderer from 'markdown-it/lib/renderer';
import {Liquid} from '../liquid';

export const text: Renderer.RenderRuleRecord = {
  text_special: (tokens: Token[], i: number) => {
    tokens[i].type = 'text';
    tokens[i].content = tokens[i].markup;

    return '';
  },
  text: function (tokens: Token[], i: number) {
    const token = tokens[i];

    if (token?.generated !== 'liquid' && token.content) {
      const tokenizer = new Liquid(token.content);
      const liquidTokens = tokenizer.tokenize();

      if (liquidTokens.length > 1 || liquidTokens[0].type !== 'text') {
        tokens.splice(i, 1, ...liquidTokens);
      }
    }

    return '';
  },
};
