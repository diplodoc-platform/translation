const esexec = require('@es-exec/api').default;
const {TsconfigPathsPlugin} = require('@esbuild-plugins/tsconfig-paths');
const {nodeExternalsPlugin} = require('esbuild-node-externals');

const options = {
    buildOptions: {
        tsconfig: './tsconfig.json',
        entryPoints: ['./src/playground.ts'],
        outdir: 'dist',
        platform: 'node',
        target: 'node14',
        bundle: true,
        format: 'cjs',
        plugins: [
            // eslint-disable-next-line new-cap
            TsconfigPathsPlugin({tsconfig: './tsconfig.json'}),
            nodeExternalsPlugin(),
        ],
    },
};

esexec(options);
