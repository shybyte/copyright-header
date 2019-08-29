/* Copyright (c) 2018-2019 Marco Stahl */

// tslint:disable:no-expression-statement no-object-mutation

import test, { ExecutionContext } from 'ava';
import { testExports, ValidatedOptions } from './copyright-header';
import { TEMPLATES } from './templates';
import { FileInfo } from './types';

const { collectFiles, updateCopyrightHeader, useTodayAsYearDefault } = testExports;

const collectFilesTest = (
  t: ExecutionContext<unknown>,
  include: ReadonlyArray<string>,
  expected: ReadonlyArray<string>
) => {
  t.deepEqual(collectFiles({ include, exclude: [] }), expected);
};

collectFilesTest.title = (
  providedTitle: string,
  include: ReadonlyArray<string>,
  expected: ReadonlyArray<string>
) => `collectFiles - ${providedTitle}: ${include} => ${expected}`;

const ALL_TEST_DATA_FILES: ReadonlyArray<string> = [
  'test-data/file-javascript-with-header-start-year-to-present.js',
  'test-data/file-javascript-with-header-start-year-to-year.js',
  'test-data/file-javascript-with-header-start-year.js',
  'test-data/file-javascript.js',
  'test-data/file-typescript.ts'
];

test('matching files', collectFilesTest, ['test-data'], ALL_TEST_DATA_FILES);

test('no matching files', collectFilesTest, ['test-data-not-exist'], []);

test('collectFiles - no include filter', t => {
  t.true(collectFiles({ include: [], exclude: [] }).length > 10);
});

test('collectFiles - exclude filter over include filter', t => {
  t.deepEqual(
    collectFiles({ include: ['test-data'], exclude: ['.*\\.ts$'] }),
    ALL_TEST_DATA_FILES.filter(f => !f.endsWith('.ts'))
  );
});

test('useTodayAsYearDefault', t => {
  const thisYear = new Date().getFullYear();
  t.deepEqual(useTodayAsYearDefault({ filename: 'dummy' }), {
    filename: 'dummy',
    createdYear: thisYear,
    updatedYear: thisYear
  });
});

const testOpts: ValidatedOptions = {
  copyrightHolder: 'Test User, Inc.',
  fix: true,
  include: ['test/file.ts'],
  exclude: [],
  template: TEMPLATES.minimal
};

const testFileInfo: FileInfo = {
  filename: 'test/file.ts',
  createdYear: 2002,
  updatedYear: 2017
};

test('hashbang', t => {
  const origFile = ['#!/bin/sh -some -options', 'File content', 'is here', ''].join('\n');
  const expected = [
    '#!/bin/sh -some -options',
    '',
    '/* Copyright (c) 2002-2017 Test User, Inc. */',
    '',
    'File content',
    'is here',
    ''
  ].join('\n');

  let updated = updateCopyrightHeader(testOpts, testFileInfo, origFile);
  t.is(updated, expected);

  // Run a second time to ensure idempotence
  updated = updateCopyrightHeader(testOpts, testFileInfo, updated);
  t.is(updated, expected);
});
