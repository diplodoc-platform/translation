#!/usr/bin/env node

/**
 * Cross-platform cleanup for build artifacts.
 *
 * Avoid `rm -rf` in npm scripts because CI runs on Windows.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * @param {string} relativePath
 * @returns {void}
 */
function removeIfExists(relativePath) {
    const fullPath = path.resolve(import.meta.dirname, '..', relativePath);
    fs.rmSync(fullPath, {force: true, recursive: true});
}

removeIfExists('lib');
