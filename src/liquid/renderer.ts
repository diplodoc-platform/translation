import {Token, TokenType} from 'src/liquid';

import {generateX} from 'src/xlf/generator';

export type RendererRuleSet = Record<TokenType | string, RendererRule>;

export type RendererRule = (token: Token) => string;

class Renderer {
    private rendered: string;
    private tokens: Token[];
    private rules: RendererRuleSet;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.rendered = '';

        this.rules = {
            Text: this.plainText.bind(this),
            Space: this.plainText.bind(this),
            If: this.wrapInX.bind(this),
            Else: this.wrapInX.bind(this),
            EndIf: this.wrapInX.bind(this),
            ForInLoop: this.wrapInX.bind(this),
            EndForInLoop: this.wrapInX.bind(this),
            Function: this.wrapInX.bind(this),
            Filter: this.wrapInX.bind(this),
        };
    }

    render() {
        for (const token of this.tokens) {
            const rule = this.rules[token.type];
            if (!rule) {
                throw new Error(`unexpected token: ${token.type}`);
            }

            this.rendered += rule(token);
        }

        return this.rendered;
    }

    private plainText(token: Token) {
        return token.value;
    }

    private wrapInX(token: Token) {
        const {type, value} = token;

        return generateX({
            ctype: `liquid_${type}`,
            equivText: value,
        });
    }
}

export {Renderer};
export default {Renderer};
