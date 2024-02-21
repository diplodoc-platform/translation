import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import {Consumer} from 'src/consumer';
import {token} from 'src/utils';

export const image: Renderer.RenderRuleRecord = {
    image_open: function(tokens: Token[], idx) {
        const open = tokens[idx];

        const skip = open.skip = (open.skip || []) as string[];
        skip.push('![');

        return '';
    },
    image_close: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const close = tokens[idx];
        const titleAttr = close.attrGet('title') || '';
        const heightAttr = close.attrGet('height') || '';
        const widthAttr = close.attrGet('width') || '';

        const skip = close.skip = (close.skip || []) as string[];
        skip.push(widthAttr, heightAttr, ')');

        if (titleAttr) {
            const consumer = new Consumer(titleAttr, 0, this.state.hash);
            const title = token('text', {content: titleAttr});
            const parts = consumer.process(title);
            close.attrSet('title', consumer.content);
            close.beforeDrop = (consumer: Consumer) => {
                parts.forEach(({part, past}) => consumer.consume(part, past));
            };
        } else {
            skip.unshift('(');
        }

        return '';
    },
};
