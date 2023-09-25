import {
    CustomRendererHook,
    CustomRendererHooks,
    CustomRendererLifeCycle,
} from '@diplodoc/markdown-it-custom-renderer';

export type AdditionalHooks = Record<string, CustomRendererHook | CustomRendererHook[]>;
export const mergeAdditionalHooks = (
    defaultHooks: CustomRendererHooks,
    additionalHooks?: AdditionalHooks,
) => {
    const result: CustomRendererHooks = {};
    if (!additionalHooks) {
        return defaultHooks;
    }

    const enumAddtionalHooks = Object.keys(additionalHooks).reduce(
        (acc: CustomRendererHooks, key: string) => {
            acc[lifeCycleStringToEnums(key as keyof typeof CustomRendererLifeCycle)] =
                additionalHooks[key];
            return acc;
        },
        {},
    );

    const keys = new Set([...Object.keys(defaultHooks), ...Object.keys(enumAddtionalHooks)]);
    for (const key of keys) {
        result[key] = [defaultHooks[key], enumAddtionalHooks[key]].flat().filter((hook) => hook);
    }
    return result;
};

const lifeCycleStringToEnums = (
    lifeCycle: keyof typeof CustomRendererLifeCycle,
): CustomRendererLifeCycle => {
    return CustomRendererLifeCycle[lifeCycle];
};
