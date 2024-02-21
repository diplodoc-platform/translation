import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';
import {token} from 'src/utils';

export const code: Renderer.RenderRuleRecord = {
    fence: function(this: CustomRenderer<Consumer>, tokens, idx) {
        const code = tokens[idx];

        if (!code.info || ['bash', 'sh', 'shell'].includes(code.info)) {
            const rx = /<(.*?)>/g;
            const parts = [];
            let match;
            // eslint-disable-next-line no-cond-assign
            while (match = rx.exec(code.content)) {
                parts.push(match[1]);
            }

            const texts = parts.map((part) => [
                token('fake', {skip: '<'}),
                token('text', {content: part}),
                token('fake', {skip: '>'}),
            ]);

            texts.forEach((text) => this.state.process(text, code.map));
        }

        return '';
    },
};
