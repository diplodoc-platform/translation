import MarkdownIt from 'markdown-it';
import ParserBlock from 'markdown-it/lib/parser_block';

const customCodeRule: ParserBlock.RuleBlock = function (state, startLine, endLine, silent) {
    if (state.sCount[startLine] - state.blkIndent < 4) {
        return false;
    }

    let nextLine = startLine;
    while (nextLine < endLine) {
        if (state.sCount[nextLine] - state.blkIndent < 4) {
            break;
        }
        nextLine++;
    }

    let content = '';
    for (let i = startLine; i < nextLine; i++) {
        const linePos = state.bMarks[i] + state.tShift[i];
        const lineMax = state.eMarks[i];
        content += state.src.slice(linePos, lineMax) + '\n';
    }
    content = content.trimEnd();

    const hasHtmlTags = /<[a-z][^>]*>|<\/[a-z][^>]*>/i.test(content);

    if (!silent) {
        if (hasHtmlTags) {
            const token = state.push('html_block', '', 0);
            token.content = content;
            token.map = [startLine, nextLine - 1];
        } else {
            const token = state.push('code_block', '', 0);
            token.content = content;
            token.map = [startLine, nextLine - 1];
        }
    }

    state.line = nextLine;
    return true;
};

export default function (md: MarkdownIt) {
    md.block.ruler.before('code', 'custom_code', customCodeRule, {alt: []});
}
