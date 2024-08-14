import type {CustomRenderer, CustomRendererHookParameters} from 'src/renderer';
import type {Consumer} from 'src/consumer';

export function afterInline(
    this: CustomRenderer<Consumer>,
    parameters: CustomRendererHookParameters,
) {
    // console.log('inline', parameters.map);
    this.state.process(parameters.tokens, parameters.map);

    return '';
}
