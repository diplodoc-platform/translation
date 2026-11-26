import type {MarkdownIt, StateBlock} from 'markdown-it';
import type {ContainerDirectiveParams} from '@diplodoc/directive';

import {directiveParser, registerContainerDirective} from '@diplodoc/directive';

export function pageConstructor(): (md: MarkdownIt) => void {
    return (md) => {
        md.use(directiveParser());

        registerContainerDirective(
            md,
            'page-constructor',
            (state: StateBlock, params: ContainerDirectiveParams) => {
                const token = state.push('page_constructor', '', 0);

                if (params.content) {
                    token.content = params.content.raw;
                    token.map = [params.content.startLine, params.content.endLine];
                }

                return true;
            },
        );
    };
}
