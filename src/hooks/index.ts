import {CustomRendererHooks} from '@diplodoc/markdown-it-custom-renderer';

export const mergeHooks = (...args: CustomRendererHooks[]): CustomRendererHooks => {
    const result: CustomRendererHooks = {};
    // const keys = new Set([...Object.keys(defaultHooks), ...Object.keys(additionalHooks)]);
    const keys: Set<string> = new Set([...args.map(Object.keys)].flat());
    for (const key of keys) {
        result[key] = [...args.map((hook) => hook[key])].flat().filter(Boolean);
    }
    return result;
};
