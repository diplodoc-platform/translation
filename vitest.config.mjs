import {defineConfig} from 'vitest/config';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            src: path.resolve(rootDir, 'src'),
        },
    },
    test: {
        environment: 'node',
        globals: false,
        include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
        exclude: ['node_modules', 'lib', 'dist', 'build', 'coverage'],
        snapshotFormat: {
            escapeString: true,
            printBasicPrototype: true,
        },
    },
});
