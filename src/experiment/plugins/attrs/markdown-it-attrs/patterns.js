'use strict';
/* eslint-disable */

/**
 * If a pattern matches the token stream,
 * then run transform.
 */

const utils = require('./utils.js');
const Token = require('markdown-it/lib/token');

module.exports = (options) => {
    const __hr = new RegExp(
        '^ {0,3}[-*_]{3,} ?' +
            utils.escapeRegExp(options.leftDelimiter) +
            '[^' +
            utils.escapeRegExp(options.rightDelimiter) +
            ']',
    );

    return [
        {
            /**
             * ```python {.cls}
             * for i in range(10):
             *     print(i)
             * ```
             */
            name: 'fenced code blocks',
            tests: [
                {
                    shift: 0,
                    block: true,
                    info: utils.hasDelimiters('end', options),
                },
            ],
            transform: (tokens, i) => {
                const token = tokens[i];
                const start = token.info.lastIndexOf(options.leftDelimiter);
                const attrs = utils.getAttrs(token.info, start, options);
                utils.addAttrs(attrs, token);
                token.info = utils.removeDelimiter(token.info, options);
            },
        },
        {
            /**
             * bla `click()`{.c} ![](img.png){.d}
             *
             * differs from 'inline attributes' as it does
             * not have a closing tag (nesting: -1)
             */
            name: 'inline nesting 0',
            tests: [
                {
                    shift: 0,
                    type: 'inline',
                    children: [
                        {
                            shift: -1,
                            type: (str) => str === 'image' || str === 'code_inline',
                        },
                        {
                            shift: 0,
                            type: 'text',
                            content: utils.hasDelimiters('start', options),
                            __attrPluginSkip: undefined,
                        },
                    ],
                },
            ],
            transform: (tokens, i, j) => {
                const token = tokens[i].children[j];
                const endChar = token.content.indexOf(options.rightDelimiter);
                const attrToken = tokens[i].children[j - 1];
                const attrs = utils.getAttrs(token.content, 0, options);
                utils.addAttrs(attrs, attrToken);
                if (token.content.length === endChar + options.rightDelimiter.length) {
                    token.__attrPluginSkip = true;
                    /* do not remove token
          tokens[i].children.splice(j, 1);*/
                } else {
                    const startPos = endChar + options.rightDelimiter.length;
                    token.content = token.content.slice(startPos);
                    /* just prepend token */
                    const headerToken = new Token('attr_anchor', '', 0);
                    headerToken.meta = {rule: 'inline nesting 0'};
                    headerToken.content = token.content.slice(0, startPos);
                    tokens[i].children.splice(j, 0, headerToken);
                }
            },
        },
        {
            /**
             * | h1 |
             * | -- |
             * | c1 |
             *
             * {.c}
             */
            name: 'tables',
            tests: [
                {
                    // let this token be i, such that for-loop continues at
                    // next token after tokens.splice
                    shift: 0,
                    type: 'table_close',
                },
                {
                    shift: 1,
                    type: 'paragraph_open',
                },
                {
                    shift: 2,
                    type: 'inline',
                    content: utils.hasDelimiters('only', options),
                },
            ],
            transform: (tokens, i) => {
                const token = tokens[i + 2];
                const tableOpen = utils.getMatchingOpeningToken(tokens, i);
                const attrs = utils.getAttrs(token.content, 0, options);
                // add attributes
                utils.addAttrs(attrs, tableOpen);

                /* do not remove, just replace
        // remove <p>{.c}</p>
        tokens.splice(i + 1, 3);*/
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'tables'};
                headerToken.content = token.content;
                tokens.splice(i + 2, 1, headerToken);
            },
        },
        {
            /**
             * *emphasis*{.with attrs=1}
             */
            name: 'inline attributes',
            tests: [
                {
                    shift: 0,
                    type: 'inline',
                    children: [
                        {
                            shift: -1,
                            nesting: -1, // closing inline tag, </em>{.a}
                        },
                        {
                            shift: 0,
                            type: 'text',
                            content: utils.hasDelimiters('start', options),
                        },
                    ],
                },
            ],
            transform: (tokens, i, j) => {
                const token = tokens[i].children[j];
                const content = token.content;
                const attrs = utils.getAttrs(content, 0, options);

                const openingToken = utils.getMatchingOpeningToken(tokens[i].children, j - 1);
                utils.addAttrs(attrs, openingToken);
                const startPos =
                    content.indexOf(options.rightDelimiter) + options.rightDelimiter.length;
                token.content = content.slice(startPos);

                /* prepend as header token */
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'inline attributes'};
                headerToken.content = content.slice(0, startPos);
                tokens[i].children.splice(j, 0, headerToken);
            },
        },
        {
            /**
             * - item
             * {.a}
             */
            name: 'list softbreak',
            tests: [
                {
                    shift: -2,
                    type: 'list_item_open',
                },
                {
                    shift: 0,
                    type: 'inline',
                    children: [
                        {
                            position: -2,
                            type: 'softbreak',
                        },
                        {
                            position: -1,
                            type: 'text',
                            content: utils.hasDelimiters('only', options),
                        },
                    ],
                },
            ],
            transform: (tokens, i, j) => {
                const token = tokens[i].children[j];
                const content = token.content;
                const attrs = utils.getAttrs(content, 0, options);

                let ii = i - 2;
                while (
                    tokens[ii - 1] &&
                    tokens[ii - 1].type !== 'ordered_list_open' &&
                    tokens[ii - 1].type !== 'bullet_list_open'
                ) {
                    ii--;
                }
                utils.addAttrs(attrs, tokens[ii - 1]);
                /* do not remove, just replace
        tokens[i].children = tokens[i].children.slice(0, -2);*/
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'list softbreak'};
                headerToken.content = content;
                tokens[i].children.splice(j, 1, headerToken);
            },
        },
        {
            /**
             * - nested list
             *   - with double \n
             *   {.a} <-- apply to nested ul
             *
             * {.b} <-- apply to root <ul>
             */
            name: 'list double softbreak',
            tests: [
                {
                    // let this token be i = 0 so that we can erase
                    // the <p>{.a}</p> tokens below
                    shift: 0,
                    type: (str) => str === 'bullet_list_close' || str === 'ordered_list_close',
                },
                {
                    shift: 1,
                    type: 'paragraph_open',
                },
                {
                    shift: 2,
                    type: 'inline',
                    content: utils.hasDelimiters('only', options),
                    children: (arr) => arr.length === 1,
                },
                {
                    shift: 3,
                    type: 'paragraph_close',
                },
            ],
            transform: (tokens, i) => {
                const token = tokens[i + 2];
                const content = token.content;
                const attrs = utils.getAttrs(content, 0, options);

                const openingToken = utils.getMatchingOpeningToken(tokens, i);
                utils.addAttrs(attrs, openingToken);
                /* do not remove, just replace
        tokens.splice(i + 1, 3);*/
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'list double softbreak'};
                headerToken.content = content;
                tokens.splice(i + 2, 1, headerToken);
            },
        },
        {
            /**
             * - end of {.list-item}
             */
            name: 'list item end',
            tests: [
                {
                    shift: -2,
                    type: 'list_item_open',
                },
                {
                    shift: 0,
                    type: 'inline',
                    children: [
                        {
                            position: -1,
                            type: 'text',
                            content: utils.hasDelimiters('end', options),
                        },
                    ],
                },
            ],
            transform: (tokens, i, j) => {
                const token = tokens[i].children[j];
                const content = token.content;
                const attrs = utils.getAttrs(
                    content,
                    content.lastIndexOf(options.leftDelimiter),
                    options,
                );

                utils.addAttrs(attrs, tokens[i - 2]);
                const startPos = content.lastIndexOf(options.leftDelimiter);
                token.content = content.slice(0, startPos);

                /* just append token */
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'end of'};
                headerToken.content = content.slice(startPos);
                tokens[i].children.splice(j + 1, 0, headerToken);
            },
        },
        {
            /**
             * something with softbreak
             * {.cls}
             */
            name: '\n{.a} softbreak then curly in start',
            tests: [
                {
                    shift: 0,
                    type: 'inline',
                    children: [
                        {
                            position: -2,
                            type: 'softbreak',
                        },
                        {
                            position: -1,
                            type: 'text',
                            content: utils.hasDelimiters('only', options),
                        },
                    ],
                },
            ],
            transform: (tokens, i, j) => {
                const token = tokens[i].children[j];
                const attrs = utils.getAttrs(token.content, 0, options);

                // find last closing tag
                let ii = i + 1;
                while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) {
                    ii++;
                }
                const openingToken = utils.getMatchingOpeningToken(tokens, ii);
                utils.addAttrs(attrs, openingToken);
                /* do not remove, just replace
        tokens[i].children = tokens[i].children.slice(0, -2);*/
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'softbreak then curly in start'};
                headerToken.content = token.content;
                tokens[i].children.splice(j, 1, headerToken);
            },
        },
        {
            /**
             * horizontal rule --- {#id}
             */
            name: 'horizontal rule',
            tests: [
                {
                    shift: 0,
                    type: 'paragraph_open',
                },
                {
                    shift: 1,
                    type: 'inline',
                    children: (arr) => arr.length === 1,
                    content: (str) => str.match(__hr) !== null,
                },
                {
                    shift: 2,
                    type: 'paragraph_close',
                },
            ],
            transform: (tokens, i) => {
                const token = tokens[i];
                token.type = 'hr';
                token.tag = 'hr';
                token.nesting = 0;
                const content = tokens[i + 1].content;
                const start = content.lastIndexOf(options.leftDelimiter);
                const attrs = utils.getAttrs(content, start, options);

                utils.addAttrs(attrs, token);
                token.markup = content;
                /* do not remove token, just replace
        tokens.splice(i + 1, 2);*/
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'horizontal rule'};
                headerToken.content = content;
                tokens.splice(i + 1, 1, headerToken);
            },
        },
        {
            /**
             * end of {.block}
             */
            name: 'end of block',
            tests: [
                {
                    shift: 0,
                    type: 'inline',
                    children: [
                        {
                            position: -1,
                            content: utils.hasDelimiters('end', options),
                            type: (t) =>
                                t !== 'code_inline' && t !== 'math_inline' && t !== 'attr_anchor',
                        },
                    ],
                },
            ],
            transform: (tokens, i, j) => {
                const token = tokens[i].children[j];
                const content = token.content;
                const attrs = utils.getAttrs(
                    content,
                    content.lastIndexOf(options.leftDelimiter),
                    options,
                );

                let ii = i + 1;
                while (tokens[ii + 1] && tokens[ii + 1].nesting === -1) {
                    ii++;
                }
                const openingToken = utils.getMatchingOpeningToken(tokens, ii);
                utils.addAttrs(attrs, openingToken);
                const startPos = content.lastIndexOf(options.leftDelimiter);
                token.content = content.slice(0, startPos);

                /* just append token */
                const headerToken = new Token('attr_anchor', '', 0);
                headerToken.meta = {rule: 'end of block'};
                headerToken.content = content.slice(startPos);
                tokens[i].children.splice(j + 1, 0, headerToken);
            },
        },
    ];
};

// get last element of array or string
function last(arr) {
    return arr.slice(-1)[0];
}
