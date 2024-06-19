import type Renderer from 'markdown-it/lib/renderer';

import {generateCloseG, generateOpenG, generateX} from 'src/xliff/generator';

const open = (ctype: string) => (tokens: Token[], i: number) => {
  const token = tokens[i];
  const markup = token.markup;

  if (token.g) {
    return generateOpenG({
      ctype,
      equivText: `${markup}{{text}}${markup}`,
      xBegin: markup,
      xEnd: markup,
    });
  }

  return generateX({
    ctype: ctype + '_open',
    equivText: markup,
  });
};

const close = (ctype: string) => (tokens: Token[], i: number) => {
  const token = tokens[i];
  const markup = token.markup;

  if (token.g) {
    return generateCloseG();
  }

  return generateX({
    ctype: ctype + '_close',
    equivText: markup,
  });
};

export const pair: Renderer.RenderRuleRecord = {
  strong_open: open('bold'),
  strong_close: close('bold'),
  em_open: open('italic'),
  em_close: close('italic'),
  s_open: open('strikethrough'),
  s_close: close('strikethrough'),
  sup_open: open('sup'),
  sup_close: close('sup'),
  monospace_open: open('monospace'),
  monospace_close: close('monospace'),
};
