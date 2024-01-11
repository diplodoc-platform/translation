const glob = require('glob');
const {readFileSync} = require("node:fs");
const {resolve} = require("node:path");
const {extract, compose} = require('./lib/index.js');
const diff = require('diff');

// ydb/terraform/serverless-database.md
// vpc/operations/network-delete.md
// cos/tutorials/serial-port.md
// speechsense/api-ref/overview.md
// query/sources-and-sinks/formats.md
// query/concepts/new.md
// _api-ref/datalens/function-ref/availability.md

const files = glob.sync('**/*.md', {cwd: '../../docs-source/ru'});

files.forEach((file) => {
    const content = readFileSync(resolve('../../docs-source/ru', file), 'utf8');

    if (!content) {
        return;
    }

    try {
        const from = extract({
            markdown: content,
            source: {
                language: 'ru',
                locale: 'RU',
            },
            target: {
                language: 'en',
                locale: 'US',
            },
            lang: 'ru',
        });

        const to = compose({
            ...from,
            useSource: true,
        });

        // console.log(to);
        // console.log(diff.createPatch('a', content, to, '', '', {
        //     // ignoreWhitespace: true
        // }));

        const path = diff.structuredPatch('a', 'a', content, to, '', '',{
            context: 0,
            newlineIsToken: true,
        });

        const score = path.hunks.reduce((score, hunk) => {
            const isAddition = hunk.oldLines === 0 && hunk.newLines > 0;
            const isDeletion = hunk.oldLines > 0 && hunk.newLines === 0;
            const isBothAddition = hunk.oldLines === 0 && hunk.newLines > 1;
            const isReplacement = hunk.oldLines === 1 && hunk.newLines === 1;

            if (isAddition || isDeletion) {
                return score + 0.1;
            }

            if (isBothAddition) {
                return score + 0.3;
            }

            if (isReplacement) {
                return score + 1;
            }

            return score + 1;
        }, 0);

        console.log(file, score);

        return [file, score];
    } catch (error) {
        console.log(file, error);
    }
});