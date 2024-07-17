import {BaseElement} from './BaseElement';

export class BXElement extends BaseElement {
    tag = 'bx';
    equivText: string;

    constructor(id: string, equivText: string) {
        super();

        this.setAttr('id', id);
        this.equivText = equivText;
    }

    toString() {
        return super.toString({
            'equiv-text': this.equivText,
        });
    }
}
