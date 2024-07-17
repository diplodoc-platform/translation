import MarkdownIt, {Token} from 'markdown-it';
import ParserBlock from 'markdown-it/lib/parser_block';
import Core from 'markdown-it/lib/parser_core';
import StateBlock from 'markdown-it/lib/rules_block/state_block';
import StateCore from 'markdown-it/lib/rules_core/state_core';

const getTermDefinitions = (md: MarkdownIt) => {
  const termDefinitions: ParserBlock.RuleBlock = function (
    this: MarkdownIt,
    state,
    startLine,
    endLine,
    silent,
  ) {
    let ch;
    let labelEnd;
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    if (pos + 2 >= max) {
      return false;
    }

    if (state.src.charCodeAt(pos++) !== 0x5b /* [ */) {
      return false;
    }
    if (state.src.charCodeAt(pos++) !== 0x2a /* * */) {
      return false;
    }

    const labelStart = pos;

    for (; pos < max; pos++) {
      ch = state.src.charCodeAt(pos);
      if (ch === 0x5b /* [ */) {
        return false;
      } else if (ch === 0x5d /* ] */) {
        labelEnd = pos;
        break;
      } else if (ch === 0x5c /* \ */) {
        pos++;
      }
    }

    const newLineReg = new RegExp(/^(\r\n|\r|\n)/);
    const termReg = new RegExp(/^\[\*(\w+)]:/);
    let currentLine = startLine;

    // Allow multiline term definition
    for (; currentLine < endLine; currentLine++) {
      const nextLineStart = state.bMarks[currentLine + 1];
      const nextLineEnd = state.eMarks[currentLine + 1];

      const nextLine =
        nextLineStart === nextLineEnd
          ? state.src[nextLineStart]
          : state.src.slice(nextLineStart, nextLineEnd);

      if (newLineReg.test(nextLine) || termReg.test(nextLine)) {
        break;
      }

      // eslint-disable-next-line no-param-reassign
      state.line = currentLine + 1;
    }

    max = state.eMarks[currentLine];

    if (!labelEnd || labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3a /* : */) {
      return false;
    }

    if (silent) {
      return true;
    }

    const label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
    const title = state.src.slice(labelEnd + 2, max).trim();

    if (label.length === 0 || title.length === 0) {
      return false;
    }

    const rawLabel = state.src.slice(labelStart - 2, labelEnd + 2);
    const rawTitle = state.src.slice(labelEnd + 2, max);

    return processTermDefinition(
      md,
      state,
      currentLine,
      startLine,
      endLine,
      label,
      title,
      rawLabel,
      rawTitle,
    );
  };

  return termDefinitions;
};

function processTermDefinition(
  md: MarkdownIt,
  state: StateBlock,
  currentLine: number,
  _startLine: number,
  _endLine: number,
  label: string,
  title: string,
  rawLabel: string,
  rawTitle: string,
) {
  if (!state.env.terms) {
    // eslint-disable-next-line no-param-reassign
    state.env.terms = {};
  }

  // If term inside definition

  if (typeof state.env.terms[':' + label] === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    state.env.terms[':' + label] = title;
  }

  const termBlock = new state.Token('term_block', '', 0);
  state.tokens.push(termBlock);
  termBlock.children = [];
  termBlock.content = rawLabel + rawTitle;

  const termLabel = new state.Token('term_label', '', 0);
  termBlock.children.push(termLabel);
  termLabel.content = rawLabel;

  const termContent = new state.Token('term_content', '', 0);
  termBlock.children.push(termContent);
  termContent.content = rawTitle;
  termContent.children = md.parse(title, state.env);

  /** current line links to end of term definition */
  // eslint-disable-next-line no-param-reassign
  state.line = currentLine + 1;

  return true;
}

const getTermReplace = (md: MarkdownIt) => {
  const termReplace: Core.RuleCore = function (state: StateCore) {
    const escapeRE = md.utils.escapeRE;
    const arrayReplaceAt = md.utils.arrayReplaceAt;

    const blockTokens = state.tokens;

    if (!state.env.terms) {
      return;
    }

    const regTerms = Object.keys(state.env.terms)
      .map((el) => el.slice(1))
      .map(escapeRE)
      .join('|');
    const regText = '\\[([^\\[]+)\\](\\(\\*(' + regTerms + ')\\))';
    const reg = new RegExp(regText, 'g');

    for (let j = 0, l = blockTokens.length; j < l; j++) {
      if (blockTokens[j].type === 'heading_open') {
        while (blockTokens[j].type !== 'heading_close') {
          j++;
        }
        continue;
      }

      if (blockTokens[j].type !== 'inline') {
        continue;
      }

      let tokens = blockTokens[j].children as Token[];

      for (let i = tokens.length - 1; i >= 0; i--) {
        const currentToken = tokens[i];
        if (currentToken.type === 'link_close') {
          while (tokens[i].type !== 'link_open') {
            i--;
          }
          continue;
        }

        if (currentToken.type !== 'text') {
          continue;
        }

        let pos = 0;
        const text = currentToken.content;
        reg.lastIndex = 0;
        const nodes = [];

        let termLocal: RegExpExecArray | null;
        while ((termLocal = reg.exec(text))) {
          const termRaw = termLocal[0];
          const termTitle = termLocal[1];

          if (termLocal.index > 0 || termTitle.length > 0) {
            const token = new state.Token('text', '', 0);
            token.content = text.slice(pos, termLocal.index);
            nodes.push(token);
          }

          const termLink = new state.Token('term_link', '', 0);
          nodes.push(termLink);
          termLink.content = termRaw;
          termLink.children = [];

          const textToken = new state.Token('text', '', 0);
          textToken.content = termTitle;
          termLink.children.push(textToken);

          pos = reg.lastIndex;
        }

        if (!nodes.length) {
          continue;
        }

        if (pos < text.length) {
          const token = new state.Token('text', '', 0);
          token.content = text.slice(pos);
          nodes.push(token);
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  };

  return termReplace;
};

export function term(md: MarkdownIt) {
  const defaultLinkValidation = md.validateLink;
  // eslint-disable-next-line no-param-reassign
  md.validateLink = function (url) {
    if (url.startsWith('*')) {
      return false;
    }

    return defaultLinkValidation(url);
  };

  md.block.ruler.before('reference', 'termDefinitions', getTermDefinitions(md), {
    alt: ['paragraph', 'reference'],
  });

  md.core.ruler.after('linkify', 'termReplace', getTermReplace(md));
}
