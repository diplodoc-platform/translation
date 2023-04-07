import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer/lib/cjs';

export type HooksParameters = {
    template: string[];
};

const fst = <T>([a]: T[]) => a;
const snd = <T>([_, b]: T[]) => b;

function hooks(parameters: HooksParameters) {
    return {
        [CustomRendererLifeCycle.BeforeRender]: function () {
            return fst(parameters.template);
        },
        [CustomRendererLifeCycle.AfterRender]: function () {
            return snd(parameters.template);
        },
    };
}

export {hooks};
export default {hooks};
