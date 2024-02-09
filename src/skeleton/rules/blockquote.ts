import type Renderer from 'markdown-it/lib/renderer';
import {token} from 'src/utils';

export const blockquote: Renderer.RenderRuleRecord = {
    blockquote_open: (tokens, idx) => {
        for (let i = idx + 1; i < tokens.length; i++) {
            if (tokens[i].type === 'blockquote_open' || tokens[i].type === 'blockquote_close') {
                return '';
            }

            if (tokens[i].type === 'inline') {
                const map = tokens[i].map;
                const inlines = (tokens[i].children || [])
                    ?.reduce(
                        (acc, token) => {
                            acc[acc.length - 1].push(token);

                            if (token.type === 'softbreak') {
                                acc.push([]);
                            }

                            return acc;
                        },
                        [[]] as Token[][],
                    )
                    .map((children, index) =>
                        token('inline', {
                            children,
                            map: map ? [map[0] + index, map[1]] : null,
                        }),
                    );

                tokens.splice(i, 1, ...inlines);
            }
        }

        return '';
    },
};
