import { test } from 'ava';
import { collectFiles } from './copyright-header';

test('collectFiles filters by include array', t => {
  t.deepEqual(collectFiles(['test-data']), [
    'test-data/file-javascript-with-header-start-year-to-year.js',
    'test-data/file-javascript-with-header-start-year.js',
    'test-data/file-javascript.js',
    'test-data/file-typescript.ts'
  ]);
  t.deepEqual(collectFiles(['test-data-not-exist']), []);
});
