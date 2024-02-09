import type MdIt from 'markdown-it';
import type State from 'markdown-it/lib/rules_core/state_core';
import {token} from "src/utils";

const INCLUDE_REGEXP = /^{%\s*include\s*(notitle)?\s*\[(.+?)]\((.+?)\)\s*%}$/;

export default function(md: MdIt) {
    const plugin = (state: State) => {
        const {tokens} = state;
        let i = 0;

        while (i < tokens.length) {
            const openToken = tokens[i];
            const contentToken = tokens[i + 1];
            const closeToken = tokens[i + 2];

            if (
                openToken.type === 'paragraph_open' &&
                contentToken.type === 'inline' &&
                contentToken.content.match(INCLUDE_REGEXP) &&
                closeToken.type === 'paragraph_close'
            ) {
                contentToken.children = [
                    token('liquid', {
                        content: '',
                        skip: contentToken.content,
                        subtype: 'Include',
                    })
                ];

                i += 3;
            } else {
                i++;
            }
        }
    };

    try {
        md.core.ruler.before('curly_attributes', 'includes', plugin);
    } catch (e) {
        md.core.ruler.push('includes', plugin);
    }
}
