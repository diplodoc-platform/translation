import type MarkdownIt from 'markdown-it';
import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer';
import {meta} from './meta';
import {afterInline} from './after-inline';
import {beforeInline} from './before-inline';
import {image} from './image';
import {Consumer} from 'src/skeleton/consumer';

type Consume = (consumer: Consumer) => void;

type HookMap = {
    get(token: Token): Consume[];
    add(token: Token, hook: Consume): void;
};

export type MarkdownItWithMeta = MarkdownIt & {
    meta: {};
};

export type HooksState = {
    md: MarkdownItWithMeta;
    source: string;
    result: string;
    cursor: number;
    gap: number;
    lines: {
        start: number[];
        end: number[];
    };
    hooks: {
        before: HookMap;
        after: HookMap;
    };
    segments: string[];
    skeleton: {
        id: number;
    };
};

export const hooks = {
    [CustomRendererLifeCycle.BeforeRender]: [image, meta],
    [CustomRendererLifeCycle.AfterInlineRender]: [afterInline],
    [CustomRendererLifeCycle.BeforeInlineRender]: [beforeInline],
};

function countStartIndexes(acc: number[], line: string) {
    acc.push(acc[acc.length - 1] + line.length + 1);

    return acc;
}

function countEndIndexes(acc: number[], line: string) {
    acc.push((acc[acc.length - 1] || 0) + line.length + 1);

    return acc;
}

export function initState(source: string, md: MarkdownItWithMeta) {
    return {
        md,
        source: source,
        result: source,
        lines: {
            start: source.split('\n').reduce(countStartIndexes, [0]),
            end: source.split('\n').reduce(countEndIndexes, []),
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
    };
}