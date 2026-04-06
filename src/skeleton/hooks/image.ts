import type {CustomRendererHookParameters} from 'src/renderer';

import MdToken from 'markdown-it/lib/token';

import {token} from 'src/utils';
import {mt} from 'src/symbols';

const TITLE_ATTRS_DOUBLE_RE = /^(\{[^}]*?title=")([^"\\]*(?:\\.[^"\\]*)*)("[^}]*\})/;
const TITLE_ATTRS_SINGLE_RE = /^(\{[^}]*?title=')([^'\\]*(?:\\.[^'\\]*)*)('[^}]*\})/;

export function image(parameters: CustomRendererHookParameters) {
    const tokens: Token[] = parameters.tokens;

    for (let i = 0; i < tokens.length; i++) {
        const block = tokens[i];
        if (block.type !== 'inline') {
            continue;
        }

        const inlines = block.children ?? [];

        for (let j = 0; j < inlines.length; j++) {
            if (inlines[j].type === 'image') {
                const openToken = new MdToken('image_open', 'img', 0) as Token;
                const closeToken = new MdToken('image_close', 'img', 0) as Token;
                const fakeContent: Token[] = inlines[j]?.children?.length
                    ? []
                    : // Fake content is important for segmentation.
                      // It forces to properly split same strings
                      // "A ![](./empty/image). B."
                      [token('text', {content: mt})];
                const content = inlines[j].children as Token[];
                closeToken.attrs = inlines[j].attrs;

                // Check if next sibling is a {title="..."} attrs text token
                const nextInline = inlines[j + 1];
                if (nextInline && nextInline.type === 'text') {
                    const attrsMatch =
                        TITLE_ATTRS_DOUBLE_RE.exec(nextInline.content) ??
                        TITLE_ATTRS_SINGLE_RE.exec(nextInline.content);
                    if (attrsMatch) {
                        const [fullMatch, prefix, titleValue, suffix] = attrsMatch;
                        const remaining = nextInline.content.slice(fullMatch.length);

                        const suffixToken = token('liquid', {
                            content: '',
                            skip: suffix,
                            subtype: 'Attributes',
                            generated: 'liquid',
                        });

                        // Store title value and suffix token reference on closeToken
                        // so the image_close renderer rule can set up beforeDrop on suffixToken.
                        // This works in both compact and non-compact modes because suffixToken
                        // always ends up in the `after` group, unlike image_close which ends up
                        // in `content` in non-compact mode (causing beforeDrop to never fire).
                        closeToken.titleAttrsValue = titleValue;
                        closeToken.titleSuffixToken = suffixToken;

                        const newTokens: Token[] = [
                            token('liquid', {
                                content: '',
                                skip: prefix,
                                subtype: 'Attributes',
                                generated: 'liquid',
                            }),
                            suffixToken,
                        ];
                        if (remaining) {
                            newTokens.push(token('text', {content: remaining}));
                        }
                        inlines.splice(j + 1, 1, ...newTokens);
                    }
                }

                inlines.splice(j, 1, ...fakeContent, openToken, ...content, closeToken);
            }
        }
    }

    return '';
}
