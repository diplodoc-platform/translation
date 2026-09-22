import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';
import type {CodeHandler} from './comments';

import {CodeProcessing} from 'src/consumer';
import {Liquid} from 'src/skeleton/liquid';
import {token} from 'src/utils';

import {codeSyntax, comments} from './comments';
import {mermaid} from './mermaid';
import {precise} from './precise';

const fences: Record<string, CodeHandler> = {
    mermaid,
};

/**
 * Handlers of the adaptive mode: line comments of every language with a known
 * comment syntax and labels of mermaid diagrams, on top of the placeholders.
 */
function adaptive(lang: string): CodeHandler {
    return fences[lang] ?? comments(codeSyntax(lang));
}

const handlers: Partial<Record<CodeProcessing, (lang: string) => CodeHandler>> = {
    [CodeProcessing.PRECISE]: precise,
    [CodeProcessing.ADAPTIVE]: adaptive,
};

function parseInfo(info: string | null): [string, Record<string, string | boolean>] {
    if (!info) {
        return ['text', {}];
    }

    const parts = info.trim().split(/\s+/);
    const lang = parts[0].toLowerCase();

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
        } else if (parts[i + 1]?.startsWith('=')) {
            value = parts[i + 1].slice(1).trim();
            i += 1;
        } else {
            value = true;
        }

        options[key] = value;
    }

    return [lang, options];
}

function processFence(state: Consumer, code: Token) {
    const [lang, options] = parseInfo(code.info);

    const defaultMode = state.compact ? CodeProcessing.PRECISE : CodeProcessing.ALL;
    const mode = options.translate || state.code || defaultMode;

    if (mode === CodeProcessing.NO) {
        return;
    }

    const select = handlers[mode as CodeProcessing];

    if (select) {
        // Tokens are rendered from the liquid-escaped markdown, while the consumer
        // searches the original one, so the handlers get the original code back.
        for (const token of select(lang)(Liquid.unescape(code.content))) {
            state.process(token);
        }

        return;
    }

    state.consume([token('skip', {skip: code.markup})]);
    state.consume(new Liquid(code.content).tokenize());
    state.consume([token('skip', {skip: code.markup})]);
}

export const code: Renderer.RenderRuleRecord = {
    fence: function (this: CustomRenderer<Consumer>, tokens, idx) {
        processFence(this.state, tokens[idx]);

        return '';
    },
};
