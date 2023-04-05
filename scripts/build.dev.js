/* eslint-disable security/detect-child-process */
const {spawn} = require('child_process');
const path = require('path');
const esbuild = require('esbuild');
const {nodeExternalsPlugin} = require('esbuild-node-externals');

async function handleRebuild(err, result) {
    if (err) {
        console.error('watch build failed:', err);
        return;
    }

    console.log('watch build succeeded:', result);

    const source = path.join(process.cwd(), 'dist', 'index.js');

    console.log('running:', source, result);

    spawn('node', [source], {
        stdio: [process.stdin, process.stdout, process.stderr],
    });
}

esbuild
    .build({
        entryPoints: ['src/playground.ts'],
        outfile: 'dist/index.js',
        bundle: true,
        format: 'cjs',
        watch: {
            onRebuild: handleRebuild,
        },
        // minify: true,
        platform: 'node',
        sourcemap: true,
        target: 'node14',
        plugins: [nodeExternalsPlugin()],
    })
    .catch(() => process.exit(1));
