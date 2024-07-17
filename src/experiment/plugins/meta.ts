import yaml from 'js-yaml';
import markdownIt from 'markdown-it';
import ParserBlock from 'markdown-it/lib/parser_block';
import StateBlock from 'markdown-it/lib/rules_block/state_block';
import Token from 'markdown-it/lib/token';

import {YamlQuoteQuotingType} from '../constants';
import {yamlVariableReplace} from '../utils';

/* eslint-disable no-param-reassign */

function get(state: StateBlock, line: number) {
  const pos = state.bMarks[line];
  const max = state.eMarks[line];
  return state.src.slice(pos, max);
}

const tokenize: ParserBlock.RuleBlock = function (state, startLine, endLine, silent) {
  if (startLine !== 0 || state.blkIndent !== 0) {
    return false;
  }
  if (state.tShift[startLine] < 0) {
    return false;
  }
  const metaOpen = get(state, startLine);
  if (metaOpen !== '---') {
    return false;
  }

  let metaClose = '';
  const data = [];
  let line = startLine;
  while (line < endLine) {
    line++;
    const str = get(state, line);
    if (str === '---') {
      metaClose = str;
      break;
    }
    if (state.tShift[line] < 0) {
      break;
    }
    data.push(str);
  }

  let body = data.join('\n');

  // `{{}}` syntax break yaml file, so, replace it
  const variableReplaceResult = yamlVariableReplace(body);
  const revertVariableReplace = () => {
    body = variableReplaceResult.revert(body);
  };
  body = variableReplaceResult.data;

  type Item = {
    result?: string | boolean;
    kind?: string;
    openPos: number;
    closePos?: number;
    parent?: Item;
    children: Item[];
  };

  const newItem = (openPos: number): Item => {
    return {
      openPos,
      children: [],
    };
  };

  let level = -1;
  const levelCursor: Item[] = [];

  yaml.load(body, {
    json: true,
    listener: (eventType, stateLocal) => {
      switch (eventType) {
        case 'open': {
          const parent = levelCursor[level];
          level++;
          const item = newItem(stateLocal.position);
          levelCursor[level] = item;
          if (parent) {
            parent.children.push(item);
          }
          break;
        }
        case 'close': {
          const cursor = levelCursor[level];
          if (!cursor) {
            throw new Error('lastItem is empty');
          }
          cursor.kind = stateLocal.kind;
          cursor.closePos = stateLocal.position;
          cursor.result = stateLocal.result;
          level--;
          break;
        }
        default: {
          throw new Error(`Unknown event ${eventType}`);
        }
      }

      /*const {schema, filename, input, implicitTypes, typeMap, onWarning, legacy, json, ...other} = state as any;
            const fragment = body.slice(state.position, state.position + 100);
            const {kind, result} = state;
            console.log('listen', toJsonF({
                eventType,
                fragment,
                kind,
                result,
                other,
            }));*/
    },
  });

  revertVariableReplace();

  const root = levelCursor[0];

  if (!silent) {
    const openToken = state.push('meta_open_tag', '', 1);
    openToken.content = metaOpen;
    openToken.map = [startLine, startLine];

    const bodyToken = state.push('meta_body', '', 0);
    bodyToken.content = body;
    bodyToken.map = [startLine + 1, line - 1];

    bodyToken.children = [];
    const bodyChildren = bodyToken.children;

    const processItem = (item: Item, children: Token[], postfix = '') => {
      // pass bool value
      if (typeof item.result === 'boolean') {
        postfix += '-bool';
      }
      const kindToken = new Token(`yaml_${item.kind}${postfix ? `-${postfix}` : ''}`, '', 0);
      const content = body.slice(item.openPos, item.closePos).trimStart();
      kindToken.content = content;
      children.push(kindToken);

      kindToken.children = [];
      const subChildren = kindToken.children;

      if (postfix === 'value') {
        const inlineToken = new Token('inline', '', 0);
        inlineToken.attrSet('yaml', 'true');

        let idPostfix = '_yaml';
        const quotingType = YamlQuoteQuotingType[content[0] as keyof typeof YamlQuoteQuotingType];
        if (quotingType) {
          idPostfix += `_${quotingType}`;
        }

        inlineToken.attrSet('idPostfix', idPostfix);
        inlineToken.content = content;
        subChildren.push(inlineToken);
        inlineToken.children = [];

        const textToken = new Token('text', '', 0);
        textToken.content = content;
        inlineToken.children.push(textToken);
      }

      switch (item.kind) {
        case 'mapping': {
          while (item.children.length) {
            const [key, value] = item.children.splice(0, 2);
            processItem(key, subChildren, 'key');
            if (value.kind === 'scalar') {
              processItem(value, subChildren, 'value');
            } else {
              processItem(value, subChildren, 'array');
            }
          }
          break;
        }
        case 'sequence': {
          item.children.forEach((itemLocal) => {
            processItem(itemLocal, subChildren, 'item');
          });
          break;
        }
        default: {
          item.children.forEach((itemLocal) => {
            processItem(itemLocal, subChildren, 'value');
          });
        }
      }
    };
    processItem(root, bodyChildren);

    const closeToken = state.push('meta_close_tag', '', -1);
    closeToken.content = metaClose;
    closeToken.map = [line, line];
  }

  state.line = line + 1;
  return true;
};

export function meta(md: markdownIt) {
  md.block.ruler.before('code', 'meta', tokenize, {alt: []});
}
