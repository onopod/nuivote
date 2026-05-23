import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('public/index.html が存在する', () => {
  assert.equal(fs.existsSync('public/index.html'), true);
});

test('api/vote.js が存在する', () => {
  assert.equal(fs.existsSync('api/vote.js'), true);
});

test('デフォルト投票カテゴリが2件定義されている', () => {
  const src = fs.readFileSync('api/_store.js', 'utf8');
  assert.match(src, /id:\s*1[\s\S]*あなたの好きな動物は？/);
  assert.match(src, /id:\s*2[\s\S]*今向いている方角は？/);
});
