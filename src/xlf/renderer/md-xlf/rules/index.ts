import diplodocRules, {DiplodocRulesState} from './diplodoc';

import {LinkRuleState, link, initState as linkInitState} from './link';
import {pair} from './pair';
import {codeInline} from './code-inline';
import {text} from './text';
import {image} from './image';
import {video} from './video';
import {anchor} from './anchor';
import {file} from './file';
import {htmlInline} from './html-inline';

export type XLFRulesState = LinkRuleState & DiplodocRulesState;

function generate() {
    return {rules: rules(), initState: initState()};
}

// blocks(container and leaf) create group
function rules() {
    return {
        code_block: () => '',
        fence: () => '',
        hardbreak: () => '',
        softbreak: () => '\n',
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
        ...diplodocRules.rules,
        ...pair,
        ...codeInline,
        ...link,
        ...text,
        ...image,
        ...video,
        ...anchor,
        ...file,
        ...htmlInline,
    };
}

function initState() {
    return () => ({
        ...linkInitState(),
        ...diplodocRules.initState(),
    });
}

export {generate};
export default {generate};
