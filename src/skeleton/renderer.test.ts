import {CustomRendererLifeCycle} from '@diplodoc/markdown-it-custom-renderer';
import {MarkdownRenderer} from '@diplodoc/markdown-it-markdown-renderer/lib';
import {RenderParameters, render} from './renderer';

import basic from 'src/__fixtures__/basic';
import variables from 'src/__fixtures__/variables';
import filters from 'src/__fixtures__/filters';
import functions from 'src/__fixtures__/functions';
import conditionals from 'src/__fixtures__/conditionals';
import loops from 'src/__fixtures__/loops';
import meta from 'src/__fixtures__/meta';
import notes from 'src/__fixtures__/notes';
import cuts from 'src/__fixtures__/cuts';
import gfmTables from 'src/__fixtures__/gfm-tables';
import sup from 'src/__fixtures__/sup';
import checkbox from 'src/__fixtures__/checkbox';
import anchors from 'src/__fixtures__/anchors';
import monospace from 'src/__fixtures__/monospace';
import imsize from 'src/__fixtures__/imsize';
import file from 'src/__fixtures__/file';
import links from 'src/__fixtures__/links';
import includes from 'src/__fixtures__/includes';
import strikethrough from 'src/__fixtures__/strikethrough';
import tabs from 'src/__fixtures__/tabs';
import video from 'src/__fixtures__/video';
import multilineTables from 'src/__fixtures__/multiline-tables';

describe('smoke', () => {
    test('it works', () => {
        const parameters = {
            markdown: '1',
        };

        render(parameters);
    });
});

describe('validates parameters', () => {
    it('works with valid parameters', () => {
        const parameters = {
            markdown: '1',
        };

        render(parameters);
    });

    it('throws on invalid parameters', () => {
        const parameters = {} as RenderParameters;

        expect(() => render(parameters)).toThrow();
    });
});

describe('skeleton rendering', () => {
    it('renders hashes instead of content of the text tokens', () => {
        const parameters = {
            markdown: basic.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid variables', () => {
        const parameters = {
            markdown: variables.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid filters', () => {
        const parameters = {
            markdown: filters.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid functions', () => {
        const parameters = {
            markdown: functions.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with liquid conditionals', () => {
        const parameters = {
            markdown: conditionals.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with loops', () => {
        const parameters = {
            markdown: loops.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with meta', () => {
        const parameters = {
            markdown: meta.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with notes', () => {
        const parameters = {
            markdown: notes.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with cuts', () => {
        const parameters = {
            markdown: cuts.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with gfm tables', () => {
        const parameters = {
            markdown: gfmTables.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with sup text', () => {
        const parameters = {
            markdown: sup.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with checkboxes in text', () => {
        const parameters = {
            markdown: checkbox.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with anchors in text', () => {
        const parameters = {
            markdown: anchors.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with monospace text', () => {
        const parameters = {
            markdown: monospace.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with imsize images', () => {
        const parameters = {
            markdown: imsize.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with file in text', () => {
        const parameters = {
            markdown: file.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('does not render hash instead of the special syntax {#T} inside link text', () => {
        const parameters = {
            markdown: links.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('does not render hashes instead of the {% include ... %} syntax', () => {
        const parameters = {
            markdown: includes.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with strikethrough', () => {
        const parameters = {
            markdown: strikethrough.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with tabs', () => {
        const parameters = {
            markdown: tabs.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with video', () => {
        const parameters = {
            markdown: video.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });

    it('renders hash instead of the content from markdown with multiline tables', () => {
        const parameters = {
            markdown: multilineTables.markdown,
        };

        const rendered = render(parameters);
        expect(rendered).toMatchSnapshot();
    });
});

describe('passing hooks', () => {
    it('should call the hook', () => {
        const hookFn = jest.fn().mockImplementation(() => '');
        const parameters = {
            markdown: basic.markdown,
            hooks: {
                [CustomRendererLifeCycle.BeforeRender]: [hookFn],
            },
        };
        render(parameters);
        expect(hookFn).toHaveBeenCalled();
    });

    it('default hooks should still be called', () => {
        const defaultHookSpy = jest.spyOn(MarkdownRenderer.defaultHooks['0'], 0);
        const hookFn = jest.fn().mockImplementation(() => '');
        const parameters = {
            markdown: basic.markdown,
            hooks: {
                [CustomRendererLifeCycle.BeforeRender]: [hookFn],
            },
        };
        render(parameters);
        expect(defaultHookSpy).toHaveBeenCalled();
    });
});
