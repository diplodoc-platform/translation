import {
    ContainerDirectiveParams,
    LeafBlockDirectiveParams,
    directiveParser,
    registerContainerDirective,
    registerInlineDirective,
    registerLeafBlockDirective,
    tokenizeBlockContent,
    tokenizeInlineContent,
} from '@diplodoc/directive';
import MarkdownIt from 'markdown-it';
import StateBlock from 'markdown-it/lib/rules_block/state_block';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';

interface NoTranslateOptions {
    mode?: 'render' | 'translate';
}

export function noTranslate(
    options: NoTranslateOptions = {mode: 'translate'},
): MarkdownIt.PluginSimple {
    return (md) => {
        md.use(directiveParser());

        registerContainerDirective(
            md,
            'no-translate',
            (state: StateBlock, params: ContainerDirectiveParams) => {
                if (options.mode === 'translate') {
                    state.push('no_translate_skip', '', 0);
                } else if (params.content) {
                    tokenizeBlockContent(state, params.content, 'no-translate');
                }
                return true;
            },
        );

        registerLeafBlockDirective(
            md,
            'no-translate',
            (state: StateBlock, params: LeafBlockDirectiveParams) => {
                if (options.mode === 'translate') {
                    state.push('no_translate_skip', '', 0);
                } else if (params.inlineContent) {
                    const content = params.inlineContent.raw;

                    const html = md.render(content);

                    const token = state.push('html_block', '', 0);
                    token.content = html;
                    token.map = [params.startLine, params.startLine + 1];
                }
                return true;
            },
        );

        registerInlineDirective(md, 'no-translate', (state: StateInline, params) => {
            if (options.mode === 'translate') {
                const openToken = state.push('no_translate_inline', '', 1);
                openToken.attrSet('data-content', params.content?.raw || '');
            } else if (params.content) {
                tokenizeInlineContent(state, params.content);
            }
            return true;
        });

        md.renderer.rules.no_translate_skip = () => '';
    };
}
