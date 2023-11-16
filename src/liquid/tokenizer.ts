import {Token, TokenType} from './token';

export type Configuration = {
    specification?: Specification;
};

export type Specification = Array<SpecificationEntry>;
export type SpecificationEntry = [RegExp, TokenType];

const specification_: Specification = [
    // Conditions
    // If statement
    [/^\{%[^\S\r\n]*if[^%}]+?[^\S\r\n]*%}/, 'If'],
    // Else statement
    [/^\{%[^\S\r\n]*else[^\S\r\n]*%\}/, 'Else'],
    // EndIf statement
    [/^\{%[^\S\r\n]*endif[^\S\r\n]*%\}/, 'EndIf'],
    // Function
    [/^\{\{[^\S\r\n]*[\w.-]+?\(.*?\)[^\S\r\n]*\}\}/, 'Function'],
    // Filter
    [/^\{\{[^\S\r\n]*[\w.]+[^\S\r\n]*\|[^\S\r\n]*\w+[^\S\r\n]*\}\}/, 'Filter'],
    // Variable
    [/^\{\{[^\S\r\n]*[\w.]+[^\S\r\n]*\}\}/, 'Variable'],
    // ForInLoop
    [/^\{%[^\S\r\n]*for[^\S\r\n]+[\w.]+[^\S\r\n]+in[^\S\r\n]+[\w.]+[^\S\r\n]*%\}/, 'ForInLoop'],
    // EndForInLoop
    [/^\{%[^\S\r\n]*endfor[^\S\r\n]*%\}/, 'EndForInLoop'],
    // Space
    [/^[^\S\r\n]+/, 'Space'],
    // Newline
    [/^[\r\n]+/, 'Newline'],
    // Text
    // without grabbing liquid/variable syntax
    [/^[^\s]+(?={{|{%)/, 'Text'],
    // plain text
    [/^[^\s]+/, 'Text'],
];

export type TokenizerGenerator = Generator<Token | null, void, Token | undefined>;

class Tokenizer implements TokenizerGenerator {
    private input: string;
    private cursor: number;
    private specification: Specification;

    constructor(input: string, configuration: Configuration = {}) {
        this.input = input;
        this.cursor = 0;

        const {specification = specification_} = configuration;
        this.specification = specification;
    }

    tokenize(this: TokenizerGenerator & this): Token[] {
        this.cursor = 0;

        return Array.from<Token>(this);
    }

    *[Symbol.iterator](this: TokenizerGenerator & this) {
        let value, done;

        do {
            ({value, done} = this.next() ?? {});
            // eslint-disable-next-line no-eq-null, eqeqeq
            if (value == null) {
                return;
            }

            yield value;
        } while (!done);
    }

    next(): IteratorResult<Token | null> {
        const token = this.match();
        if (!token) {
            return {value: null, done: true};
        }

        this.cursor += token.value.length;

        return {value: token, done: this.done()};
    }

    return() {
        return this.next();
    }

    throw(): IteratorResult<Token> {
        return {value: null, done: true};
    }

    private match(this: Tokenizer) {
        const left = this.input.slice(this.cursor);

        let value;

        for (const [regexp, type] of this.specification) {
            [value] = regexp.exec(left) ?? [];
            // eslint-disable-next-line eqeqeq, no-eq-null
            if (value == null) {
                continue;
            }

            return {
                type,
                value,
            };
        }

        return null;
    }

    private done() {
        return this.cursor === this.input.length;
    }
}

export {Tokenizer};
export default {Tokenizer};
