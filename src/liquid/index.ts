/* eslint-disable security/detect-non-literal-regexp */
const expr = '\\{%\\s(include|code|if|else|endif|for|endfor)[^%]+%\\}';
const flags = 'mu';
const regexp = new RegExp(expr, flags);

export type LiquidToken = {
    type: LiquidTokenType;
    lexemme: string;
};

export enum LiquidTokenType {
    Text,
    Liquid,
}

function tokenize(string: string) {
    let str = string;

    const tokens = [];

    let rv;
    do {
        rv = regexp.exec(str);
        if (!rv?.[0]) {
            break;
        }

        tokens.push(token(LiquidTokenType.Text, str.slice(0, rv.index)));
        tokens.push(token(LiquidTokenType.Liquid, rv[0]));

        str = str.slice(rv[0].length + rv.index);
    } while (rv);

    if (str.length) {
        tokens.push(token(LiquidTokenType.Text, str));
    }

    return tokens;
}

function token(type: LiquidTokenType, lexemme: string) {
    if (!isLiquidTokenType(type)) {
        throw new Error('unknow liquid token type');
    }

    return {
        type,
        lexemme,
    };
}

function isLiquidTokenType(type: unknown): type is LiquidTokenType {
    return Object.keys(LiquidTokenType).includes(String(type as keyof typeof LiquidTokenType));
}

function splitOnLiquid(string: string) {
    let str = string;

    const chunks = [];

    let rv;
    do {
        rv = regexp.exec(str);
        if (!rv?.[0]) {
            break;
        }

        chunks.push(str.slice(0, rv.index));

        str = str.slice(rv[0].length + rv.index);
    } while (rv);

    if (str.length) {
        chunks.push(str);
    }

    return chunks;
}

export {splitOnLiquid, tokenize};
export default {splitOnLiquid, tokenize};
