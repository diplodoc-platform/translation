import type {CodeHandler} from './comments';

import {token} from 'src/utils';

/**
 * Comments and `<placeholders>` of shell fences: the whole text after `#` is a unit.
 */
function* shell(content: string): Generator<Token> {
    const rx = /<(.*?)>|(?:#\s*(.*)$)/gm;

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

/**
 * `<placeholders>` of any other fence.
 */
function* angles(content: string): Generator<Token> {
    const rx = /<(.*?)>/g;

    let match;
    while ((match = rx.exec(content))) {
        yield token('fake', {skip: '<'});
        yield token('text', {content: match[1]});
        yield token('fake', {skip: '>'});
    }
}

const shells = new Set(['bash', 'shell', 'sh']);

/**
 * Handlers of the precise mode, kept as they always were:
 * comments are translated in shell fences only.
 */
export function precise(lang: string): CodeHandler {
    return shells.has(lang) ? shell : angles;
}
