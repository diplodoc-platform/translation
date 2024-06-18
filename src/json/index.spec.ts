import type {JSONObject, LinkedJSONObject} from './types';
import {readFile} from 'node:fs/promises';
import {join, relative} from 'node:path';
import {dump, load} from 'js-yaml';
import {linkRefs, unlinkRefs} from './refs';
import {normalizePath} from './utils';

describe('json', () => {
  describe('integration', () => {
    it('should resolve simple refs', async () => {
      const location = '__mocks__/spec/index.yaml';
      const absLocation = join(__dirname, location);
      const specs: Record<string, JSONObject> = {};
      const loader = async (location: string): Promise<JSONObject> => {
        if (!specs[location]) {
          specs[location] = load(await readFile(location, 'utf8')) as JSONObject;
        }

        return specs[location];
      };

      const spec = await loader(absLocation);

      await linkRefs(spec, absLocation, loader);

      // @ts-ignore
      spec.prop1.value = '$$$1$$$'; // @ts-ignore
      spec.prop3.value = '$$$2$$$'; // @ts-ignore
      spec.prop4.value = '$$$3$$$'; // @ts-ignore
      spec.prop5.value = '$$$4$$$';

      for (const location of Object.keys(specs)) {
        await unlinkRefs(specs[location] as LinkedJSONObject);

        const relLocation = relative(__dirname, location);

        expect(dump(specs[location])).toMatchSnapshot(normalizePath(relLocation));
      }
    });
  });
});
