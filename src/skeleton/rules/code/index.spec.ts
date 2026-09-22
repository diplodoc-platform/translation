import {describe, expect, it} from 'vitest';
import {dedent} from 'ts-dedent';

import {extract} from 'src/api';
import {CodeProcessing} from 'src/consumer';

const languages = {
    source: {language: 'ru', locale: 'RU'},
    target: {language: 'en', locale: 'US'},
} as const;

function units(markdown: string, code?: CodeProcessing) {
    return extract(markdown, {compact: true, code, ...languages}).units.map((unit) =>
        unit
            .replace(/<source[^>]*>(.*)<\/source>/s, '$1')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>'),
    );
}

const markdown = dedent`
    \`\`\`yaml
    # Клиентская часть
    bus_client: 1
    \`\`\`

    \`\`\`bash
    # Серверная часть
    # export TOKEN=<старый токен>
    yt list //home # подсказка {{host}}
    \`\`\`

    \`\`\`mermaid
    sequenceDiagram
        A->>B: Привет
    \`\`\`
`;

describe('code: processing modes', () => {
    it('keeps the precise mode as the default: shell comments and placeholders only', () => {
        expect(units(markdown)).toEqual([
            'Серверная часть',
            'export TOKEN=<старый токен>',
            'подсказка {{host}}',
        ]);
        expect(units(markdown, CodeProcessing.PRECISE)).toEqual(units(markdown));
    });

    it('adds comments of other languages and mermaid labels in the adaptive mode', () => {
        expect(units(markdown, CodeProcessing.ADAPTIVE)).toEqual([
            'Клиентская часть',
            'Серверная часть',
            'старый токен',
            'подсказка {{host}}',
            'Привет',
        ]);
    });

    it('lets a fence opt into the adaptive mode', () => {
        const fenced = markdown.replace('```yaml', '```yaml translate=adaptive');

        expect(units(fenced)).toEqual([
            'Клиентская часть',
            'Серверная часть',
            'export TOKEN=<старый токен>',
            'подсказка {{host}}',
        ]);
    });

    it('lets a fence opt out of the adaptive mode', () => {
        const fenced = markdown.replace('```yaml', '```yaml translate=precise');

        expect(units(fenced, CodeProcessing.ADAPTIVE)).toEqual([
            'Серверная часть',
            'старый токен',
            'подсказка {{host}}',
            'Привет',
        ]);
    });

    it('rejects unknown modes', () => {
        expect(() => units(markdown, 'weird' as CodeProcessing)).toThrow(/Invalid ExtractOptions/);
    });
});
