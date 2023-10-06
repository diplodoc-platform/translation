import Token from 'markdown-it/lib/token';

const anchors = {
    heading_open: function (tokens: Token[], i: number) {
        const next = tokens[i + 1];
        if (next.type !== 'inline') {
            return '';
        }

        if (!next.children) {
            next.children = [];
        }

        const anchorLinkStartIdx = next.children.findIndex(({type}) => type === 'link_open');
        const anchorLinkEndtIdx = next.children.findIndex(({type}) => type === 'link_close');
        if (anchorLinkEndtIdx !== -1 && anchorLinkStartIdx !== -1) {
            next.children.splice(anchorLinkStartIdx, anchorLinkEndtIdx - anchorLinkStartIdx + 1);
        }

        return '';
    },
};

export {anchors};
export default {anchors};
