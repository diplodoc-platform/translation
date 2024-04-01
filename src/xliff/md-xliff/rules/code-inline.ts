import type Renderer from 'markdown-it/lib/renderer';
import type Token from 'markdown-it/lib/token';

import {generateX} from 'src/xliff/generator';

export const codeInline: Renderer.RenderRuleRecord = {
  code_inline_open: codeInlineRule('open'),
  code_inline_close: codeInlineRule('close'),
};

function codeInlineRule(dir: string) {
  return function (tokens: Token[], i: number) {
    const {markup} = tokens[i];

    return generateX({
      ctype: `code_${dir}`,
      equivText: markup,
    });
  };
}
