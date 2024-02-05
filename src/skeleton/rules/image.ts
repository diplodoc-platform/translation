import Renderer from 'markdown-it/lib/renderer';
import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import {Consumer} from 'src/skeleton/consumer';
import {SkeletonRendererState} from 'src/skeleton/renderer';

export const image: Renderer.RenderRuleRecord = {
    image_close: function (this: CustomRenderer<SkeletonRendererState>, tokens: Token[], idx) {
        const close = tokens[idx];
        const titleAttr = close.attrGet('title') || '';
        const heightAttr = close.attrGet('height') || '';
        const widthAttr = close.attrGet('width') || '';

        close.skip = close.skip || [];
        close.skip.push(widthAttr, heightAttr, ')');

        if (titleAttr) {
            const consumer = new Consumer(titleAttr, 0, this.state);
            const title = consumer.token('text', {content: titleAttr});
            const parts = consumer.process(title);
            close.attrSet('title', consumer.content);

            this.state.hooks.before.add(close, (consumer: Consumer) => {
                parts.forEach(({part, past}) => {
                    consumer.replace(part, past);
                });
            });
        } else {
            close.skip.unshift('(');
        }

        return '';
    },
};
