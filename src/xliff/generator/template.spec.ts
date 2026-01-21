import {describe, expect, it} from 'vitest';

import {template} from './template';

describe('smoke', () => {
    it('works', () => {
        const parameters = {
            file: {
                path: '/file.md',
                data: '',
            },
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
        };

        template([], parameters);
    });
});

describe('template', () => {
    it('generates xliff template', () => {
        const parameters = {
            file: {
                path: 'file.md',
                data: '',
            },
            source: {
                language: 'ru',
                locale: 'RU' as const,
            },
            target: {
                language: 'en',
                locale: 'US' as const,
            },
        };

        expect(template([], parameters)).toMatchSnapshot();
    });
});
