import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';
import {token} from 'src/utils';

function * skip() {}

function * sh(content: string) {
    const rx = /<(.*?)>|(?!\\)#\s*(.*)$/gm;

    let match;
    // eslint-disable-next-line no-cond-assign
    while (match = rx.exec(content)) {
        if (match[1]) {
            yield token('fake', {skip: '<'});
            yield token('text', {content: match[1]});
            yield token('fake', {skip: '>'});
        }

        if (match[2]) {
            yield token('fake', {skip: '#'});
            yield token('text', {content: match[2]});
        }
    }
}

const fences: Record<string, (content: string) => Generator<Token>> = {
    bash: sh,
    shell: sh,
    sh: sh,
};

const trim = (text: string) => text.trim();

export const code: Renderer.RenderRuleRecord = {
    fence: function(this: CustomRenderer<Consumer>, tokens, idx) {
        const code = tokens[idx];

        if (this.state.compact) {
            const match = fences[code.info || 'bash'] || skip;

            for (const token of match(code.content)) {
                this.state.process(token);
            }
        } else {
            const lines = code.content.split('\n').map(trim).filter(Boolean);
            for(const line of lines) {
                this.state.process(token('text', {content: line}));
            }
        }

        return '';
    },
};
