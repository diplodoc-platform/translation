import {generateTransUnit} from './trans-unit';

describe('trans-unit generator', () => {
    it('generates trans-unit with provided: source, id', () => {
        const generated = generateTransUnit({source: 'Sentence about something', id: 1});

        expect(generated).toMatchSnapshot();
    });

    it('generates trans-unit with provided source, id, target', () => {
        const generated = generateTransUnit({
            source: 'Sentence about something',
            target: 'Предложение о чем-то',
            id: 1,
        });

        expect(generated).toMatchSnapshot();
    });
});
