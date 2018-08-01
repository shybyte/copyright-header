/* Copyright (c) 2018 Marco Stahl */

// tslint:disable:no-expression-statement no-object-mutation

import { test } from 'ava';
import { getFileInfoFromGit } from './git';

test.only('getFileInfoFromGit', t => {
  const fileinfo = getFileInfoFromGit('README.md');

  t.is(fileinfo.filename, 'README.md');
  t.is(fileinfo.createdYear, 2018);
  t.true(!isNaN(fileinfo.updatedYear));
  t.true(fileinfo.updatedYear >= 2018);
});
