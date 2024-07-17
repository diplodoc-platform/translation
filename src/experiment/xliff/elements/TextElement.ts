import {escapeXmlText} from '../utils';

import {BaseElement} from './BaseElement';

export class TextElement extends BaseElement {
    text: string;

    constructor(text: string) {
        super();

        this.text = text;
    }

    setAttr() {
        throw new Error('Unavailable method');
    }

    appendElement() {
        throw new Error('Unavailable method');
    }

    toString() {
        return escapeXmlText(this.text);
    }
}
