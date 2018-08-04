/* Copyright (c) 2018 Marco Stahl */

// tslint:disable:no-expression-statement no-object-mutation

import { test } from 'ava';
import { getFileInfoFromGit, testExports } from './git';

test('getFileInfoFromGit', t => {
  const fileinfo = getFileInfoFromGit('README.md');

  t.is(fileinfo.filename, 'README.md');
  t.is(fileinfo.createdYear, 2018);
  t.true(!isNaN(fileinfo.updatedYear));
  t.true(fileinfo.updatedYear >= 2018);
});

test('invertedGrepOptions', t => {
  t.is(testExports.invertedGrepOptions('pattern'), '--invert-grep --grep=pattern');
  t.is(testExports.invertedGrepOptions(), '');
});
