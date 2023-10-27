// import imageRules, {image, imageClose, ImageRuleState} from './image';
import diplodocRules, {DiplodocRulesState} from './diplodoc';

import {LinkRuleState, link, initState as linkInitState} from './link';
import {pair} from './pair';
import {codeInline} from './code-inline';
import {text} from './text';
import {image} from './image';
import {video} from './video';

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
        softbreak: () => '',
        html_block: () => '',
        html_inline: () => '',
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
