import {attributesToString} from '../utils';

export class BaseElement {
    declare tag: string;
    children: BaseElement[] = [];
    compact?: boolean;

    attrs: Record<string, string> = {};

    setAttr(key: string, value: string) {
        this.attrs[key] = value;
    }

    appendElement(element: BaseElement) {
        this.children.push(element);
    }

    toString(attrs?: Record<string, unknown>) {
        const closed = this.children.length === 0;
        const header = `<${this.tag}${attributesToString({...attrs, ...this.attrs})}${
            closed ? '/' : ''
        }>`;
        const body: string = closed ? '' : this.children.map((el) => el.toString()).join('');
        const bottom = closed ? '' : `</${this.tag}>`;
        return `${header}${body}${bottom}`;
    }
}
