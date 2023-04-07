// todo: publish custom-renderer make it dependency
// @ts-ignore
import {CustomRendererLifeCycle} from '/Users/moki-codes/code/diplodoc/markdown-it-markdown-renderer';
import {XMLBuilder} from 'fast-xml-parser';

export type XMLParameters = {};

const hooks = {
    [CustomRendererLifeCycle.BeforeRender]: function () {
        return xml();
    },
    [CustomRendererLifeCycle.AfterRender]: function () {
        return '';
    },
};

/*
<file original="/Users/moki-codes/code/docs/ru/application-load-balancer/logs-ref.md"
    source-language="ru-RU" target-language="en-US" datatype="markdown">
    <header>
      <skl>
        <external-file href="/Users/moki-codes/code/docs-extracted/logs-ref.skl.md"/>
      </skl>
    </header>
    <body>
*/

function xml() {
    const doc = {
        '?xml': {
            '@_version': '1.0',
            '@_encoding': 'UTF-8',
        },
        xliff: {
            '@_xmlns': 'urn:oasis:names:tc:xliff:document:1.2',
            '@_version': '1.2',
            file: {
                // todo: md path parameter
                '@_original': 'md-path',
                // todo: source language locale parameter
                '@_source-language': 'source-language-locale',
                // todo: target language locale parameter
                '@_target-language': 'target-language-locale',
                '@_datatype': 'markdown',
                header: {
                    skeleton: {
                        'external-file': {
                            // todo: skeleton path
                            '@_href': 'skeleton-path',
                        },
                    },
                },
                body: {},
            },
        },
    };

    const options = {
        format: true,
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        suppressBooleanAttributes: false,
    };

    const builder = new XMLBuilder(options);

    return builder.build(doc);
}

export {hooks};
export default {hooks};
