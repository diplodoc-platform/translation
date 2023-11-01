import {Options} from 'markdown-it';
import Token from 'markdown-it/lib/token';
import {MarkdownRendererEnv} from '@diplodoc/markdown-it-markdown-renderer';
import {normalizeSource} from 'src/processors';

const anchors = {
    heading_open: function (
        tokens: Token[],
        i: number,
        options: Options,
        env: MarkdownRendererEnv,
    ) {
        const {source} = env;
        if (!source?.length) {
            throw new Error(
                'failed to render anchors, provide split by new line source as environment',
            );
        }

        const inline = tokens[i + 1];
        if (inline?.type !== 'inline') {
            return '';
        }

        const {children} = inline;
        if (!children?.length) {
            return '';
        }

        const {numberOfAnchors} = foldAnchorLinksIntoAnchors(tokens, i, children);
        if (!numberOfAnchors) {
            return '';
        }

        if (isImplicitAnchor(tokens, i, source)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            tokens[i + 1].children!.splice(0, 1);

            return '';
        }

        const anchorTokens = children.slice(0, numberOfAnchors);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tokens[i + 1].children!.splice(0, numberOfAnchors);

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        splicePushBack(tokens[i + 1].children!, ...anchorTokens.reverse());

        return '';
    },
};

function foldAnchorLinksIntoAnchors(tokens: Token[], i: number, children: Token[]) {
    let numberOfAnchors = 0;
    for (let j = 0; j < children.length; j++) {
        if (children[j].type === 'anchor_hidden_desc') {
            numberOfAnchors++;

            const linkOpen = children[j - 1];
            const href = linkOpen.attrGet('href');
            if (!href?.length) {
                throw new Error('failed to render anchor');
            }

            const anchorToken = new Token('anchor', '', 0);
            anchorToken.content = href;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            tokens[i + 1].children!.splice(j - 1, 3, anchorToken);
        }
    }

    return {numberOfAnchors};
}

function isImplicitAnchor(tokens: Token[], i: number, source: string[]) {
    const [row] = tokens[i].map ?? [];
    // eslint-disable-next-line eqeqeq, no-eq-null, @typescript-eslint/no-non-null-assertion
    if (row == null) {
        throw new Error('failed to render anchor, no line mapping on header');
    }

    const line = normalizeSource(source)[row];
    if (!line?.length) {
        throw new Error('failed to render anchor, incorrect source or line mapping');
    }

    return !line.match(/\{#([^{]+)\}/gmu);
}

function splicePushBack<T>(xs: T[], ...values: T[]) {
    xs.splice(xs.length, 0, ...values);
}

export {anchors};
export default {anchors};
