import type {CustomRenderer, CustomRendererHookParams} from '@diplodoc/markdown-it-custom-renderer';
import {Consumer} from 'src/skeleton/consumer';

type Consume = (consumer: Consumer) => void;

type HookMap = {
    get(token: Token): Consume[];
    add(token: Token, hook: Consume): void;
};

export type AfterInlineState = {
    result: string;
    cursor: number;
    gap: number;
    hooks: {
        before: HookMap;
        after: HookMap;
    };
    segments: string[];
    skeleton: {
        id: number;
    };
};

function afterInline(this: CustomRenderer<AfterInlineState>, parameters: CustomRendererHookParams) {
    if (!parameters.rendered) {
        return '';
    }

    const consumer = new Consumer(this.state.result, this.state.cursor, this.state);

    consumer.window(parameters.map, this.state.gap);
    consumer.process(parameters.tokens);

    this.state.result = consumer.content;
    this.state.cursor = consumer.cursor;
    this.state.gap += consumer.gap;

    return '';
}

export type AfterInlineStateParams = {
    source: string;
};

function countStartIndexes(acc: number[], line: string) {
    acc.push(acc[acc.length - 1] + line.length + 1);

    return acc;
}

function countEndIndexes(acc: number[], line: string) {
    acc.push((acc[acc.length - 1] || 0) + line.length + 1);

    return acc;
}

function initState(parameters: AfterInlineStateParams) {
    return () => ({
        source: parameters.source,
        result: parameters.source,
        lines: {
            start: parameters.source.split('\n').reduce(countStartIndexes, [0]),
            end: parameters.source.split('\n').reduce(countEndIndexes, []),
        },
        cursor: 0,
        gap: 0,
        segments: [],
        hooks: {
            before: {
                _store: new Map(),
                add(token: Token, hook: Consume) {
                    const box = this._store.get(token) || [];
                    box.push(hook);
                    this._store.set(token, box);
                },
                get(token: Token) {
                    return this._store.get(token) || [];
                },
            },
            after: {
                _store: new Map(),
                add(token: Token, hook: Consume) {
                    const box = this._store.get(token) || [];
                    box.push(hook);
                    this._store.set(token, box);
                },
                get(token: Token) {
                    return this._store.get(token) || [];
                },
            },
        },
        skeleton: {
            id: 1,
        },
    });
}

export {afterInline, initState};
export default {afterInline, initState};
