import type Renderer from 'markdown-it/lib/renderer';
import type {CustomRenderer} from 'src/renderer';
import type {Consumer} from 'src/consumer';

import {find} from 'src/utils';

export const list: Renderer.RenderRuleRecord = {
    list_item_open: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const open = tokens[idx];
        let close = find('list_item_close', tokens, idx + 1) as Token;

        while (close?.level !== open.level) {
            close = find('list_item_close', tokens, tokens.indexOf(close) + 1) as Token;
        }
        if (close?.level !== open.level) {
            throw new Error('failed to find closed list item token');
        }

        this.state.setWindow(open.map);
        close.open = open;

        return '';
    },
    list_item_close: function (this: CustomRenderer<Consumer>, tokens: Token[], idx) {
        const close = tokens[idx];
        const open = close.open;

        if (open?.type !== 'list_item_open') {
            throw new Error('failed to render list item token');
        }

        this.state.unsetWindow();

        return '';
    },
};
