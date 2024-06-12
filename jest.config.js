const path = require('path');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    snapshotFormat: {
        escapeString: true,
        printBasicPrototype: true,
    },
    transform: {
        '^.+\\.tsx?$': ['esbuild-jest', {tsconfig: './tsconfig.json'}],
    },
    moduleNameMapper: {
        '^src/(.*)': '<rootDir>/src/$1',
    },
    testPathIgnorePatterns: [
        `.*__fixtures__${path.sep}.*`,
        `.*__helpers__${path.sep}.*`,
    ],
};
