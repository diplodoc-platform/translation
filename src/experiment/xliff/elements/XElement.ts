import {BaseElement} from './BaseElement';

export class XElement extends BaseElement {
    tag = 'x';
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

    appendElement() {
        throw new Error('Unavailable method');
    }
}
