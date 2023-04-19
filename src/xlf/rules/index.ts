import linkRules, {linkOpen, linkClose, LinkRuleState} from './link';

import {text} from './text';

export type RulesParameters = {
    indentation: number;
};

export type XLFRulesState = {
    xlf: {
        id: number;
        indentation: number;
    };
} & LinkRuleState;

function generate(parameters: RulesParameters) {
    const {indentation} = parameters;

    return {rules: rules(), initState: initState(indentation)};
}

// blocks(container and leaf) create group
function rules() {
    return {
        code_inline: () => '',
        code_block: () => '',
        fence: () => '',
        image: () => '',
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
        strong_open: () => '',
        strong_close: () => '',
        list_item_open: () => '',
        list_item_close: () => '',
        text,
        link_open: linkOpen,
        link_close: linkClose,
    };
}

function initState(indentation: number) {
    return () => ({
        xlf: {
            id: 1,
            indentation,
        },
        ...linkRules.initState(),
    });
}

export {generate};
export default {generate};
