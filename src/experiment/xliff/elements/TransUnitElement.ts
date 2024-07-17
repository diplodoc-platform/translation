import {BaseElement} from './BaseElement';

export class TransUnitElement extends BaseElement {
  tag = 'trans-unit';
  constructor(id: string) {
    super();

    this.setAttr('id', id);
  }

  toString() {
    return super.toString();
  }
}
