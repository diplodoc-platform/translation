import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

const includes: Renderer.RenderRuleRecord = {
    include: function (tokens: Token[], i: number) {
        const {content} = tokens[i];

        if (!content) {
            throw new Error('failed to render include');
        }

        return content;
    },
};

export {includes};
export default {includes};
