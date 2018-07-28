// tslint:disable:no-expression-statement no-object-mutation

import { Macro, test } from 'ava';
import { collectFiles } from './copyright-header';

const collectFilesTest: Macro = (
  t,
  include: ReadonlyArray<string>,
  expected: ReadonlyArray<string>
) => {
  t.deepEqual(collectFiles(include), expected);
};

collectFilesTest.title = (
  providedTitle: string,
  include: ReadonlyArray<string>,
  expected: ReadonlyArray<string>
) => `collectFiles - ${providedTitle}: ${include} => ${expected}`;

const ALL_TEST_DATA_FILES: ReadonlyArray<string> = [
  'test-data/file-javascript-with-header-start-year-to-year.js',
  'test-data/file-javascript-with-header-start-year.js',
  'test-data/file-javascript.js',
  'test-data/file-typescript.ts'
];
test('matching files', collectFilesTest, ['test-data'], ALL_TEST_DATA_FILES);

test('no matching files', collectFilesTest, ['test-data-not-exist'], []);

test('collectFiles - no include filter', t => {
  t.true(collectFiles([]).length > 10);
});
