import yaml from 'js-yaml';
import markdownit from 'markdown-it';
import Token from 'markdown-it/lib/token';

import {liquidOperator} from '../plugins/liquid/liquidOperator';
import {liquidVariable} from '../plugins/liquid/liquidVariable';
import {childrenTokenSearch} from '../tokenSearch';
import {TokenExtraMap} from '../types';

const mdYaml = markdownit().use(liquidVariable).use(liquidOperator);
mdYaml.inline.ruler.enableOnly(['liquidOperator', 'liquidVariable']);

export function tokenizeYaml(rawYaml: string, tokenExtraMap: TokenExtraMap, level: number) {
    const yamlStr = /^["']/.test(rawYaml) ? rawYaml : JSON.stringify(rawYaml);

    const raw = yaml.load(yamlStr);
    if (typeof raw !== 'string') {
        throw new Error('Yaml is not string');
    }

    const token = new Token('inline', '', 0);
    token.content = raw;
    token.children = [];
    tokenExtraMap.set(token, {
        start: 0,
        end: raw.length,
        level,
    });

    mdYaml.inline.parse(raw, mdYaml, null, token.children);

    const levelTokenType: string[] = ['inline'];
    childrenTokenSearch(raw, tokenExtraMap, token.children, levelTokenType, 0, level + 1);

    return token;
}

export function yamlVariableReplace(dataArg: string) {
    let data = dataArg;

    const variableReplaceList: {pos: number; text: string}[] = [];
    data = data.replace(/\{\{.+?}}/g, (text, pos) => {
        variableReplaceList.push({pos, text});
        return `__${'a'.repeat(text.length - 4)}__`;
    });

    const revert = (dataArgLocal: string) => {
        let dataLocal = dataArgLocal;
        variableReplaceList.forEach(({pos, text}) => {
            dataLocal = dataLocal.slice(0, pos) + text + dataLocal.slice(pos + text.length);
        });
        return dataLocal;
    };
    return {data, revert};
}
