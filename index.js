const glob = require('glob');
const {readFileSync, writeFileSync} = require("node:fs");
const {resolve} = require("node:path");
const {extract, compose} = require('./lib/index.js');
const {createPatch, structuredPatch} = require("diff");

const arg = (value) => process.argv.includes(value);

const interactive = arg('-i') || arg('--interactive');
const useReport = arg('--report');
const allFiles = arg('--all');
const noUpdate = arg('--no-update');

(async () => {
    const {default: inquirer} = await import('inquirer');

    let files = [], bad = [], skip = [], noskip = [], errors = [], processed = 0;

    if (useReport) {
        const report = JSON.parse(readFileSync('./report.json'), 'utf8');

        files = report.bad || [];
        skip = report.skip || [];
        noskip = report.noskip || [];
    }

    if (!files.length || allFiles) {
        files = glob.sync('**/*.md', {cwd: '../../docs-source/ru'});
    }

    // files = [
    //     'ydb/tutorials/index.md'
    // ];

    for (const file of files) {
        console.log('PROCESSING', file);

        processed++;

        if (skip.includes(file)) {
            continue;
        }

        const content = readFileSync(resolve('../../docs-source/ru', file), 'utf8');

        if (!content) {
            continue;
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

            // console.log(from.xlf)
            // console.log(from.skeleton);

            const to = compose({
                ...from,
                useSource: true,
            });

            if (content !== to) {
                bad.push(file);
                continue;

                const {hunks} = structuredPatch('', '', content, to, '', '', {
                    ignoreWhitespace: true
                });

                if (hunks.length) {
                    if (noskip.includes(file)) {
                        bad.push(file);
                        // console.log(createPatch(file, content, to));
                        console.log(files.length, processed, (processed - bad.length) / processed, file);
                    } else {
                        console.log(createPatch(file, content, to));
                        if (interactive) {
                            const {action} = await inquirer.prompt([{
                                message: `Пропустить дифф?`,
                                type: 'list',
                                choices: ['no', 'yes', 'exit'],
                                name: 'action',
                            }]);

                            if (action === 'yes') {
                                skip.push(file);
                            } else if (action === 'exit') {
                                bad = Array.from(new Set([...bad, report.bad]));
                                skip = Array.from(new Set([...skip, report.skip]));
                                noskip = Array.from(new Set([...noskip, report.noskip]));
                                errors = Array.from(new Set([...errors, report.errors]));
                                return {errors, skip, noskip, bad};
                            } else {
                                noskip.push(file);
                                bad.push(file);
                            }
                        } else {
                            bad.push(file);
                        }
                    }
                }
            }
        } catch (error) {
            errors.push(file);
            bad.push(file);
            console.log(files.length, processed, (processed - bad.length) / processed, file, error);
        }
    }

    console.log('SCORE', (files.length - bad.length)/files.length, 'bad:', bad.length, 'errors:', errors.length);

    return {errors, skip, noskip, bad};
})().then(async (report) => {
    if (noUpdate) {
        return;
    }

    const {default: inquirer} = await import('inquirer');
    const {action} = await inquirer.prompt([{
        message: `Обновить отчет?`,
        type: 'list',
        choices: ['no', 'yes'],
        name: 'action',
    }]);

    if (action === 'yes') {
        writeFileSync('./report.json', JSON.stringify(report, null, 2), 'utf8');
    }
}).catch(console.error);

