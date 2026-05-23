import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('public/index.html が存在する', () => {
  assert.equal(fs.existsSync('public/index.html'), true);
});

test('api/vote.js が存在する', () => {
  assert.equal(fs.existsSync('api/vote.js'), true);
});
