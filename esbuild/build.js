const esbuild = require('esbuild');
const {TsconfigPathsPlugin} = require('@esbuild-plugins/tsconfig-paths');

esbuild.build({
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
