import {CustomRendererHooks} from '@diplodoc/markdown-it-custom-renderer';

export const mergeAdditionalHooks = (
    defaultHooks: CustomRendererHooks,
    additionalHooks?: CustomRendererHooks,
) => {
    const result: CustomRendererHooks = {};
    if (!additionalHooks) {
        return defaultHooks;
    }

    const keys = new Set([...Object.keys(defaultHooks), ...Object.keys(additionalHooks)]);
    for (const key of keys) {
        result[key] = [defaultHooks[key], additionalHooks[key]].flat().filter((hook) => hook);
    }
    return result;
};
