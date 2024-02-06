import Renderer from 'markdown-it/lib/renderer';
import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import {Consumer} from 'src/skeleton/consumer';
import {SkeletonRendererState} from '../';
import {token} from 'src/utils';

export type LinkState = {
    link: {
        pending: Token[];
        map: Map<Token, Token>;
    };
};

export const initState = () => ({
    link: {
        pending: [],
        map: new Map(),
    },
});

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

export const link: Renderer.RenderRuleRecord = {
    link_open: function (this: CustomRenderer<SkeletonRendererState>, tokens: Token[], idx) {
        const open = tokens[idx];
        const text = tokens[idx + 1];
        const close = tokens[idx + 2];

        if (isAutolink(open)) {
            const autolink = token('link_auto', {
                content: '<' + tokens[idx + 1].content + '>',
            });

            tokens.splice(idx, 3, autolink);

            return '';
        }

        if (isRefLink(open, text, close)) {
            open.reflink = true;
            text.reflink = true;
        }

        this.state.link.pending.push(open);

        return '';
    },
    link_close: function (this: CustomRenderer<SkeletonRendererState>, tokens: Token[], idx) {
        const close = tokens[idx];
        const open = this.state.link.pending.pop();

        if (open?.type !== 'link_open') {
            throw new Error('failed to render link token');
        }

        this.state.link.map.set(close, open);

        const titleAttr = open.attrGet('title') || '';

        close.skip = close.skip || [];
        close.skip.push(')');

        if (titleAttr) {
            const consumer = new Consumer(titleAttr, 0, this.state);
            const title = consumer.token('text', {content: titleAttr});
            const parts = consumer.process(title);
            open.attrSet('title', consumer.content);

            this.state.hooks.before.add(close, (consumer: Consumer) => {
                parts.forEach(({part, past}) => consumer.replace(part, past));
            });
        } else {
            close.skip.unshift('(');
        }

        return '';
    },
};
