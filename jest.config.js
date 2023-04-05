const path = require('path');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    // preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['esbuild-jest', {tsconfig: './tsconfig.json'}],
    },
    moduleNameMapper: {
        '^src/(.*)': '<rootDir>/src/$1',
        '^__tests__/(.*)': '<rootDir>/__tests__/$1',
    },
    testPathIgnorePatterns: [`.*__fixtures__${path.sep}.*`, `.*__helpers__${path.sep}.*`],
};
