import {BaseElement} from './BaseElement';

export class SourceElement extends BaseElement {
    tag = 'source';

    constructor() {
        super();

        this.setAttr('xml:space', 'preserve');
    }
}
