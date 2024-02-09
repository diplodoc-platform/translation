import {TokenSubType, TokenType} from './token';
import {token} from 'src/utils';

export type Configuration = {
    specification?: Specification;
};

export type Specification = Array<SpecificationEntry>;
export type SpecificationEntry = [RegExp, TokenType, TokenSubType] | [RegExp, TokenType];

const specification_: Specification = [
    // Conditions
    // If statement
    [/^\{%\s*if[^%}]+?\s*%}/, 'liquid', 'Literal'],
    // Else statement
    [/^\{%\s*else\s*%\}/, 'liquid', 'Literal'],
    // EndIf statement
    [/^\{%\s*endif\s*%\}/, 'liquid', 'Literal'],
    // Changelog
    [/^\{%\s*changelog\s*%\}/, 'liquid', 'Literal'],
    // EndChangelog
    [/^\{%\s*endchangelog\s*%\}/, 'liquid', 'Literal'],
    // Fake Tabs
    [/^\{%\s*list tabs\s*%\}/, 'liquid', 'Literal'],
    // Fake Tabs end
    [/^\{%\s*endlist\s*%\}/, 'liquid', 'Literal'],
    // ForInLoop
    [/^\{%\s*for\s+[\w.-]+\s+in\s+[\w.-]+\s*%\}/, 'liquid', 'Literal'],
    // EndForInLoop
    [/^\{%\s*endfor\s*%\}/, 'liquid', 'Literal'],
    // Function
    [/^\{\{\s*[\w.-]+?\(.*?\)\s*\}\}/, 'variable', 'Function'],
    // Filter
    [/^\{\{\s*[\w.-]+\s*\|\s*\w+\s*\}\}/, 'variable', 'Filter'],
    // Variable
    [/^\{\{\s*[\w.-]+\s*\}\}/, 'variable', 'Variable'],
    // Attributes
    [/^\{\s*(?:[.#](?!T})[a-z0-9_-]+|[a-z0-9_-]+\s*=\s*[a-z0-9_-]+)\s*\}/i, 'liquid', 'Attributes'],
    // // Space
    // [/^[^\S\r\n]+/, 'text'],
    // Newline
    [/^[\r\n]+/, 'hardbreak'],
    // Text
    // without grabbing liquid/variable syntax
    [/^[\S\s]+?(?={{1,2}|{%)/, 'text'],
    // plain text
    [/^[\S\s]+/, 'text'],
];

export type TokenizerGenerator = Generator<Token | null, void, Token | undefined>;

export class Tokenizer implements TokenizerGenerator {
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
        const [token, value] = this.match();
        if (!token) {
            return {value: null, done: true};
        }

        token.markup = value;
        token.generated = 'liquid';

        this.cursor += value.length;

        return {value: token, done: this.done()};
    }

    return() {
        return this.next();
    }

    throw(): IteratorResult<Token> {
        return {value: null, done: true};
    }

    private match(this: Tokenizer): [Token, string] | [null] {
        const left = this.input.slice(this.cursor);

        for (const [regexp, type, subtype] of this.specification) {
            const [value] = regexp.exec(left) ?? [null];
            if (value === null) {
                continue;
            }

            switch (type) {
                case 'text': return [token(type, {content: value}), value];
                case 'hardbreak': return [token(type), value];
                case 'liquid': return [token('liquid', {content: '', skip: value, subtype}), value];
                case 'variable': return [token('liquid', {content: value, subtype}), value];
                default: throw new TypeError('Unexpected liquid token');
            }
        }

        return [null];
    }

    private done() {
        return this.cursor === this.input.length;
    }
}
