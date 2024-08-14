import {rules as diplodocRules} from './diplodoc';
import {link} from './link';
import {breaks} from './breaks';
import {pair} from './pair';
import {codeInline} from './code-inline';
import {text} from './text';
import {liquid} from './liquid';
import {image} from './image';
import {video} from './video';
import {file} from './file';
import {htmlInline} from './html-inline';

// blocks(container and leaf) create group
export const rules = {
    code_block: () => '',
    fence: () => '',
    html_block: () => '',
    heading_open: () => '',
    heading_close: () => '',
    paragraph_open: () => '',
    paragraph_close: () => '',
    bullet_list_open: () => '',
    bullet_list_close: () => '',
    ordered_list_open: () => '',
    ordered_list_close: () => '',
    blockquote_open: () => '',
    blockquote_close: () => '',
    list_item_open: () => '',
    list_item_close: () => '',
    ...diplodocRules,
    ...breaks,
    ...pair,
    ...codeInline,
    ...link,
    ...text,
    ...liquid,
    ...image,
    ...video,
    ...file,
    ...htmlInline,
};
