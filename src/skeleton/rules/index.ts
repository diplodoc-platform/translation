import type {Renderer} from 'markdown-it';

import {file} from './file';
import {link} from './link';
import {image} from './image';
import {table} from './table';
import {text} from './text';
import {blockquote} from './blockquote';
import {code} from './code';
import {html} from './html';
import {list} from './list';
import {noTranslate} from './no-translate';
import {pageConstructor} from './page-constructor';

export const rules: Renderer['rules'] = {
    ...text,
    ...file,
    ...link,
    ...image,
    ...table,
    ...blockquote,
    ...code,
    ...html,
    ...list,
    ...noTranslate,
    ...pageConstructor,
};
