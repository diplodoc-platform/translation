import type {CustomRenderer} from '@diplodoc/markdown-it-custom-renderer';
import type Renderer from 'markdown-it/lib/renderer';
import type {SkeletonRendererState} from '../';
import {token} from 'src/utils';
import {Consumer} from 'src/skeleton/consumer';

export const code: Renderer.RenderRuleRecord = {
    fence: function(this: CustomRenderer<SkeletonRendererState>, tokens, idx) {
        const code = tokens[idx];

        if (!code.info || ['bash', 'sh', 'shell'].includes(code.info)) {
            const rx = /<(.*?)>/g;
            const parts = [];
            let match;
            // eslint-disable-next-line no-cond-assign
            while (match = rx.exec(code.content)) {
                parts.push(match[1]);
            }

            const consumer = new Consumer(this.state.result, this.state.cursor, this.state);
            const texts = parts.map((part) => [
                token('fake', {skip: '<'}),
                token('text', {content: part}),
                token('fake', {skip: '>'}),
            ]);

            consumer.window(code.map, this.state.gap);
            texts.forEach((text) => consumer.consume(text));

            this.state.result = consumer.content;
            this.state.cursor = consumer.cursor;
            this.state.gap += consumer.gap;
        }

        return '';
    },
};
