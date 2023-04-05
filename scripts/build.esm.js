const esbuild = require('esbuild');

const {nodeExternalsPlugin} = require('esbuild-node-externals');

esbuild
    .build({
        entryPoints: ['src/index.ts'],
        outfile: 'lib/esm/index.js',
        bundle: true,
        format: 'esm',
        minify: true,
        platform: 'node',
        sourcemap: true,
        target: 'node14',
        plugins: [nodeExternalsPlugin()],
    })
    .catch(() => process.exit(1));
