import MarkdownIt from 'markdown-it';
// todo: publish custom-renderer make it dependency
// @ts-ignore
import {customRenderer} from '/Users/moki-codes/code/diplodoc/markdown-it-markdown-renderer';

import {rules, hooks} from './index';

export type XLFParameters = {
    markdown: string;
};

export type XLFOutput = {
    xlf: string;
};

function xlf(parameters: XLFParameters) {
    if (!validate(parameters)) {
        throw new Error('invalid parameters');
    }

    const xlfRenderer = new MarkdownIt('commonmark', {html: true});

    xlfRenderer.use(customRenderer, {rules, hooks});

    return {xlf: xlfRenderer.render(parameters.markdown)};
}

function validate(parameters: XLFParameters) {
    return parameters.markdown !== undefined;
}

export {xlf};
export default {xlf};
