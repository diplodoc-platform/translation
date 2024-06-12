import {resolveRefs} from './refs';

describe('json refs', () => {
  describe('options', () => {
    it('should throw on empty object', async () => {
      // @ts-ignore
      await expect(() => resolveRefs()).rejects.toThrow('obj must be an Array or an Object');
    });

    it('should throw on wrong options', async () => {
      // @ts-ignore
      await expect(() => resolveRefs({}, 'test')).rejects.toThrow('options must be an Object');
    });

    it('should throw on wrong options.location', async () => {
      await expect(() => resolveRefs({}, {location: ''})).rejects.toThrow(
        'options.location must be non empty String',
      );
      // @ts-ignore
      await expect(() => resolveRefs({}, {location: 1})).rejects.toThrow(
        'options.location must be non empty String',
      );
    });

    it('should decode location', async () => {
      const location = encodeURI('/abs/+enc/rest%.json');
      expect(location).not.toEqual(decodeURI(location));
      await resolveRefs({}, {location});
    });

    it('should use location fragment', async () => {
      const location = '/abs/rest.json/#/a';
      await resolveRefs({a: {}}, {location});
    });

    it('should use subDocPath', async () => {
      const location = '/abs/rest.json';
      await resolveRefs({a: {}}, {location, subDocPath: '#/a'});
    });

    it('should throw on missing location fragment', async () => {
      const location = '/abs/rest.json/#/a';
      await expect(() => resolveRefs({}, {location})).rejects.toThrow(
        'options.subDocPath points to missing location: #/a',
      );
    });

    it('should throw on missing subDocPath', async () => {
      const location = '/abs/rest.json';
      await expect(() => resolveRefs({}, {location, subDocPath: '#/a'})).rejects.toThrow(
        'options.subDocPath points to missing location: #/a',
      );
    });
  });
});
