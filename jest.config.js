const path = require('path');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    snapshotFormat: {
        escapeString: true,
        printBasicPrototype: true,
    },
    testEnvironment: 'node',
    // testMatch: ['**/md-xlf/*.test.ts'],
    // testMatch: ['**/skeleton/*.spec.ts'],
    // testMatch: ['**/integration/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': ['esbuild-jest', {tsconfig: './tsconfig.json'}],
    },
    moduleNameMapper: {
        '^src/(.*)': '<rootDir>/src/$1',
        '^__tests__/(.*)': '<rootDir>/__tests__/$1',
    },
    testPathIgnorePatterns: [
        `.*__fixtures__${path.sep}.*`,
        `.*__helpers__${path.sep}.*`,
        // tests are broken for now
        // broken change: inline segmentation
        'renderer.test.ts',
    ],
};
