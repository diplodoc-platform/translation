import Token from 'markdown-it/lib/token';

const regexp = /^{%\s*include\s*(notitle)?\s*\[(.+?)]\((.+?)\)\s*%}$/;

export type ParseIncludeOutput = {
    result: boolean;
    token: Token;
};

export function parseInclude(token: Token): ParseIncludeOutput {
    const result = {result: false, token};

    const {type, content} = token;
    if (type !== 'inline') {
        return result;
    }

    if (!regexp.test(content)) {
        return result;
    }

    result.token = new Token('include', '', 0);
    result.token.content = content;
    result.result = true;

    return result;
}
