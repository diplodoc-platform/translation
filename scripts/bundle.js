const esbuild = require('esbuild');
const {TsconfigPathsPlugin} = require('@esbuild-plugins/tsconfig-paths');
const {resolve} = require('node:path');
const {copyFile, mkdir} = require('node:fs/promises');

(async () => {
    await mkdir(resolve('./lib'), {recursive: true});
    await mkdir(resolve('./lib/schemas'), {recursive: true});

    await esbuild.build({
        tsconfig: './tsconfig.json',
        entryPoints: ['src/index.ts'],
        packages: 'external',
        outdir: 'lib',
        platform: 'node',
        target: 'node14',
        bundle: true,
        // eslint-disable-next-line new-cap
        plugins: [TsconfigPathsPlugin({tsconfig: './tsconfig.json'})],
    });

    await copyFile(resolve('./src/json/schemas/openapi-schema-30.yaml'), resolve('./lib/schemas/openapi-schema-30.yaml'));
    await copyFile(resolve('./src/json/schemas/openapi-schema-31.yaml'), resolve('./lib/schemas/openapi-schema-31.yaml'));
    await copyFile(resolve('./src/json/schemas/json-schema.yaml'), resolve('./lib/schemas/json-schema.yaml'));
})();

