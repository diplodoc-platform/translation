/* eslint-disable @typescript-eslint/no-loop-func */
import {Liquid} from '.';
import {condition, filter, functions, loop, text, variable} from './__fixtures__/liquid';

const fixtures = [...text, ...condition, ...functions, ...filter, ...variable, ...loop];

describe('liquid tokenizer smoke', () => {
  it('works', () => {
    const tokenizer = new Liquid('');
    tokenizer.tokenize();
  });
});

describe('liquid tokenizer syntax', () => {
  for (const {section, number, content} of fixtures) {
    test(`${section}-${number}`, () => {
      const tokenizer = new Liquid(content);
      const tokens = [];
      for (const token of tokenizer) {
        tokens.push(token);
      }
      expect(tokens).toMatchSnapshot();
    });
  }
});
