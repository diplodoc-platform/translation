import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';

import {CodeProcessing} from 'src/consumer';
import {Liquid} from 'src/skeleton/liquid';
import {token} from 'src/utils';

function* sh(content: string) {
    const rx = /<(.*?)>|(?!\\)#\s*(.*)$/gm;

    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = rx.exec(content))) {
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

function parseInfo(info: string | null): [string, Record<string, string | boolean>] {
    if (!info) {
        return ['text', {}];
    }

    const parts = info.split(' ');
    const lang = parts[0];

    const options: Record<string, string | boolean> = {};
    for (let i = 1; i < parts.length; i++) {
        let key = parts[i];
        let value = null;

        const keyParts = key.split('=');
        if (keyParts.length > 1) {
            key = keyParts[0];
            value = keyParts.slice(1).join('=');
        } else if (parts[i + 1] === '=') {
            value = parts[i + 2];
            i += 2;
        } else if (parts[i + 1] && parts[i + 1].startsWith('=')) {
            value = parts[i + 1].slice(1).trim();
            i += 1;
        } else {
            value = true;
        }

        options[key] = value;
    }

    return [lang, options];
}

export const code: Renderer.RenderRuleRecord = {
    fence: function (this: CustomRenderer<Consumer>, tokens, idx) {
        const code = tokens[idx];
        const [lang, options] = parseInfo(code.info);

        const defaultMode = this.state.compact ? CodeProcessing.PRECISE : CodeProcessing.ALL;
        const mode = options.translate || this.state.code || defaultMode;
        const match = fences[lang];

        if (mode === CodeProcessing.NO) {
            return '';
        }

        if (match) {
            for (const token of match(code.content)) {
                this.state.process(token);
            }

            return '';
        }

        if (lang === 'text') {
            this.state.consume([token('skip', {skip: code.markup})]);
            this.state.consume(new Liquid(code.content).tokenize());
            this.state.consume([token('skip', {skip: code.markup})]);

            return '';
        }

        this.state.consume([token('skip', {skip: code.markup})]);
        this.state.consume([token('text', {content: code.content})]);
        this.state.consume([token('skip', {skip: code.markup})]);

        return '';
    },
};
