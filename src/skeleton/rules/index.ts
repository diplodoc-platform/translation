import Renderer from 'markdown-it/lib/renderer';
import {link, initState as linkInitState} from './link';
import {image} from './image';
import {table} from './table';
import {text} from './text';
import {blockquote} from './blockquote';

const rules: Renderer.RenderRuleRecord = {
    ...text,
    ...link,
    ...image,
    ...table,
    ...blockquote,
};

const initState = () => ({
    ...linkInitState(),
});

export {rules, initState};
