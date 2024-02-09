import {CustomRendererHooks} from '@diplodoc/markdown-it-custom-renderer';
import MdIt from 'markdown-it';

const md = new MdIt();
const state = new md.core.State('', md, {});

export function token(type: string, props: Record<string, any> = {}) {
    return Object.assign(new state.Token(type, '', 0), props);
}

export const mergeHooks = (...args: CustomRendererHooks[]): CustomRendererHooks => {
    const result: CustomRendererHooks = {};
    const keys: Set<string> = new Set([...args.map(Object.keys)].flat());
    for (const key of keys) {
        result[key] = [...args.map((hook) => hook[key])].flat().filter(Boolean);
    }
    return result;
};
