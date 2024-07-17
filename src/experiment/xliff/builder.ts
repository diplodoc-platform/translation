import Token from 'markdown-it/lib/token';

import {ReplacePart, TokenExtraMap} from '../types';
import {floatToken, getExtraToken, hasTextChildren, safeSlice, toJsonF} from '../utils';

import {GElement} from './elements/GElement';
import {SourceElement} from './elements/SourceElement';
import {TextElement} from './elements/TextElement';
import {TransUnitElement} from './elements/TransUnitElement';
import {XElement} from './elements/XElement';
import {Xliff} from './xliff';

const tokenNameCType = {
  link: 'link',
  strong: 'bold',
  em: 'italic',
  image: 'image',
};

export const buildXliff = (
  replaceParts: ReplacePart[],
  tokenExtraMap: TokenExtraMap,
  mdData: string,
) => {
  const xliff = new Xliff();

  replaceParts.forEach(({token, id, yamlToken}) => {
    let transUnit;
    if (yamlToken) {
      const data = yamlToken.content;
      transUnit = buildTransUnit(id, yamlToken, tokenExtraMap, data);
    } else {
      transUnit = buildTransUnit(id, token, tokenExtraMap, mdData);
    }
    xliff.appendTransUnit(transUnit);
  });

  return xliff;
};

function buildTransUnit(
  transUnitId: string,
  inlineToken: Token,
  tokenExtraMap: TokenExtraMap,
  mdData: string,
) {
  const transUnit = new TransUnitElement(transUnitId);

  const source = new SourceElement();
  transUnit.appendElement(source);

  let level = 0;
  const levelToken = [source];
  inlineToken.children?.forEach((token) => {
    const {id, start, end} = getExtraToken(tokenExtraMap, token);
    if (!id) {
      throw new Error('Token without id');
    }
    const raw = safeSlice(mdData, start, end);

    const parentElement = levelToken[level];
    const typeM = /^(.+)_(open|close)$/.exec(token.type);
    if (typeM) {
      const [, name, state] = typeM;
      if (state === 'open') {
        const element = new GElement(id, raw);
        if (name in tokenNameCType) {
          element.setAttr('ctype', tokenNameCType[name as keyof typeof tokenNameCType]);
        }
        element.setAttr('x-type', name);
        element.setAttr('x-begin', raw);

        levelToken.push(element);
        parentElement.appendElement(element);
        level++;
      } else {
        level--;
        const element = levelToken.pop() as GElement;
        element.equivText += `{{text}}${raw}`;
        element.setAttr('x-end', raw);
      }
      return;
    }

    if (token.type === 'text') {
      raw.split(/\n/).forEach((rawLine, idx) => {
        if (idx !== 0) {
          const element = new XElement(`${id}--${idx}`, '');
          element.setAttr('ctype', 'lb');
          parentElement.appendElement(element);
        }
        if (rawLine.length > 0) {
          const element = new TextElement(rawLine);
          parentElement.appendElement(element);
        }
      });
    } else if (raw.length > 0) {
      const element = new XElement(id, raw);
      element.setAttr('x-type', token.type);
      parentElement.appendElement(element);
    }
  });

  if (level !== 0) {
    // eslint-disable-next-line no-console
    console.error('Some GElement not closed', toJsonF(transUnit));
    throw new Error('Some GElement not closed');
  }

  return transUnit;
}

export function prepareInlineToken(
  inlineToken: Token,
  tokenExtraMap: TokenExtraMap,
  mdData: string,
) {
  const {
    start: inlineTokenStart,
    end: inlineTokenEnd,
    level: inlineTokenLevel,
  } = getExtraToken(tokenExtraMap, inlineToken);

  const children = (inlineToken.children || []).reduce((acc, token) => {
    const tokens = [token];
    for (let i = 0; i < tokens.length; i++) {
      const tokenLocal = tokens[i];
      if (hasTextChildren(tokenLocal)) {
        tokens.splice(i, 1, ...floatToken(mdData, tokenExtraMap, tokenLocal));
        i--;
      }
    }
    acc.push(...tokens);
    return acc;
  }, [] as Token[]);

  const putToken = (arr: Token[], index: number, start: number, end: number, level: number) => {
    const textToken = new Token('text', '', 0);
    textToken.content = mdData.slice(start, end);
    tokenExtraMap.set(textToken, {
      start,
      end,
      level,
    });
    arr.splice(index, 0, textToken);
  };

  let lastPos = inlineTokenStart;
  for (let i = 0; i < children.length; i++) {
    const token = children[i];
    const {start, end} = getExtraToken(tokenExtraMap, token);
    if (start - lastPos > 0) {
      putToken(children, i, lastPos, start, inlineTokenLevel + 1);
      i++;
    }
    lastPos = end;
  }
  if (inlineTokenEnd - lastPos > 0) {
    putToken(children, children.length, lastPos, inlineTokenEnd, inlineTokenLevel + 1);
  }

  return children;
}

export function markTokens(tokens: Token[], tokenExtraMap: TokenExtraMap) {
  let textIndex = 0;
  let elementIndex = 0;
  for (let i = 0, len = tokens.length; i < len; i++) {
    const token = tokens[i];
    const extraToken = getExtraToken(tokenExtraMap, token);
    if (token.type === 'text') {
      extraToken.id = `t${++textIndex}`;
    } else {
      extraToken.id = `e${++elementIndex}`;
    }
  }
}
