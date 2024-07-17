import {BaseElement} from './BaseElement';

export class GElement extends BaseElement {
  tag = 'g';
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
