import type {CustomRenderer, CustomRendererHookParameters} from '@diplodoc/markdown-it-custom-renderer';
import type {SkeletonRendererState} from '..';
import {Consumer} from 'src/skeleton/consumer';


export function afterInline(this: CustomRenderer<SkeletonRendererState>, parameters: CustomRendererHookParameters) {
    if (!parameters.rendered) {
        return '';
    }

    const consumer = new Consumer(this.state.result, this.state.cursor, this.state);

    consumer.window(parameters.map, this.state.gap);
    consumer.process(parameters.tokens);

    this.state.result = consumer.content;
    this.state.cursor = consumer.cursor;
    this.state.gap += consumer.gap;

    return '';
}

export type AfterInlineStateParams = {
    source: string;
};
