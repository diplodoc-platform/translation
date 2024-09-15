import {BaseElement} from './BaseElement';

export class SourceElement extends BaseElement {
    tag = 'source';

    constructor({compact} = {compact: false}) {
        super();
        this.compact = compact;
        if (!this.compact) {
            this.setAttr('xml:space', 'preserve');
        }
    }
}
