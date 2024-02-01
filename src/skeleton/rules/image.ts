import Renderer from 'markdown-it/lib/renderer';
import {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import {Consumer} from 'src/skeleton/consumer';
import {SkeletonRendererState} from 'src/skeleton/renderer';

export type ImageState = {
    imageMap: Map<Token, Token>;
};

const initState = () => ({
    imageMap: new Map(),
});

const image: Renderer.RenderRuleRecord = {
    image_close: function (this: CustomRenderer<SkeletonRendererState>, tokens: Token[], idx) {
        const close = tokens[idx];
        const srcAttr = close.attrGet('src') || '';
        const titleAttr = close.attrGet('title') || '';
        const heightAttr = close.attrGet('height') || '';
        const widthAttr = close.attrGet('width') || '';

        close.skip = close.skip || [];
        close.skip.push(srcAttr, titleAttr, heightAttr, widthAttr);

        if (titleAttr) {
            const consumer = new Consumer(titleAttr, 0, this.state);
            const title = consumer.token('text', {content: titleAttr});
            const [parts, pasts] = consumer.process(title);
            close.attrSet('title', consumer.content);

            this.state.hooks.after.add(close, (consumer: Consumer) => {
                parts.forEach((part, index) => {
                    consumer.replace(part, pasts[index]);
                });
            });
        }

        return '';
    },
};

export {image, initState};
export default {image, initState};
