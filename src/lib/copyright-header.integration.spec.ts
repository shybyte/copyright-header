import { ExecutionContext, test } from 'ava';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ensureUpdatedCopyrightHeader } from './copyright-header';

const TEST_DATA_FOLDER = 'test-data';

function revertTestDataFolder(): void {
  child_process.execSync('npm run revertTestData');
}

test.beforeEach(() => {
  revertTestDataFolder();
});

test.afterEach(() => {
  revertTestDataFolder();
});

test.serial('ensureUpdatedCopyrightHeader', t => {
  ensureUpdatedCopyrightHeader({
    include: [TEST_DATA_FOLDER],
    copyrightHolder: 'CopyrightHolder'
  });

  assertFileContent(
    t,
    'file-javascript.js',
    '/* Copyright (c) 2018 CopyrightHolder */\n\n' + "console.log('Test');"
  );

  assertFileContent(
    t,
    'file-javascript-with-header-start-year.js',
    '/* Copyright (c) 2015 CopyrightHolder */\n' + '\n' + "console.log('Test');"
  );
});

function assertFileContent(t: ExecutionContext<any>, file: string, content: string): void {
  const resultJs = fs.readFileSync(path.join(TEST_DATA_FOLDER, file), 'utf8');
  t.is(resultJs, content);
}
