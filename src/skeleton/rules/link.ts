import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import {Consumer} from 'src/consumer';
import {token} from 'src/utils';

function isAutolink(token: Token) {
    return token.markup === 'autolink';
}

function isRefLink(open: Token, text: Token, close: Token) {
    if (open?.type !== 'link_open') {
        return false;
    }

    if (text?.type !== 'text') {
        return false;
    }

    if (close?.type !== 'link_close') {
        return false;
    }

    return text?.content === '{#T}';
}

function find(type: string, tokens: Token[], idx: number) {
    while (tokens.length > idx) {
        if (tokens[idx].type === type) {
            return tokens[idx];
        }
        idx++;
    }

    return null;
}

export const link: Renderer.RenderRuleRecord = {
    link_open: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const open = tokens[idx];
        const text = tokens[idx + 1];
        const close = find('link_close', tokens, idx + 1) as Token;

        if (isAutolink(open)) {
            const autolink = token('link_auto', {
                content: '<' + tokens[idx + 1].content + '>',
            });

            tokens.splice(idx, 3, autolink);

            return '';
        }

        open.skip = '[';
        close.open = open;

        if (isRefLink(open, text, close)) {
            open.reflink = true;
            text.reflink = true;
        }

        return '';
    },
    link_close: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const close = tokens[idx];
        const open = close.open;

        if (open?.type !== 'link_open') {
            throw new Error('failed to render link token');
        }

        const titleAttr = open.attrGet('title') || '';

        const skip = close.skip = (close.skip || []) as string[];
        skip.push(')');

        if (titleAttr) {
            const consumer = new Consumer(titleAttr, 0, this.state.hash);
            const title = token('text', {content: titleAttr});
            const parts = consumer.process(title);
            open.attrSet('title', consumer.content);
            close.beforeDrop = (consumer: Consumer) => {
                parts.forEach(({part, past}) => consumer.consume(part, past));
            };
        } else {
            skip.unshift('(');
        }

        return '';
    },
};
