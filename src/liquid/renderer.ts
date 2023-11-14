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
            Text: this.PlainText.bind(this),
            Space: this.PlainText.bind(this),
            If: this.renderAsX.bind(this),
            Else: this.renderAsX.bind(this),
            EndIf: this.renderAsX.bind(this),
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

    private PlainText(token: Token) {
        return token.value;
    }

    private renderAsX(token: Token) {
        const {type, value} = token;

        return generateX({
            ctype: `liquid_${type}`,
            equivText: value,
        });
    }
}

export {Renderer};
export default {Renderer};
