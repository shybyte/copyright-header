/* Copyright (c) 2018 CopyrightHolder */

import { ExecutionContext, test } from 'ava';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';
import { runCli } from './cli';

const TEST_DATA_FOLDER = 'test-data';

function revertTestDataFolder(): void {
  child_process.execSync('npm run revertTestData');
}

let sinonSandbox: SinonSandbox;
let consoleLogStub: SinonStub;
let consoleErrorStub: SinonStub;

test.beforeEach(() => {
  revertTestDataFolder();
  sinonSandbox = createSandbox();
});

test.afterEach(() => {
  revertTestDataFolder();
  sinonSandbox.restore();
});

test.serial('ensureUpdatedCopyrightHeader', t => {
  runCli([
    'node',
    'script.js',
    '--include',
    TEST_DATA_FOLDER,
    '--copyrightHolder',
    'CopyrightHolder'
  ]);

  assertFileContent(
    t,
    'file-javascript.js',
    '/* Copyright (c) 2018 CopyrightHolder */\n\n' + "console.log('Test');"
  );

  assertFileContent(
    t,
    'file-javascript-with-header-start-year.js',
    '/* Copyright (c) 2015-2018 CopyrightHolder */\n\n' + "console.log('Test');"
  );

  assertFileContent(
    t,
    'file-javascript-with-header-start-year-to-year.js',
    '/* Copyright (c) 2015-2018 CopyrightHolder */\n\n' + "console.log('Test');"
  );

  assertFileContent(
    t,
    'file-javascript-with-header-start-year-to-present.js',
    '/* Copyright (c) 2014-present CopyrightHolder */\n\n' + "console.log('Test');"
  );
});

test.serial('--copyrightHolder is required', t => {
  consoleLogStub = sinonSandbox.stub(console, 'log');
  consoleErrorStub = sinonSandbox.stub(console, 'error');

  runCli(['node', 'script.js', '--include', TEST_DATA_FOLDER]);

  t.is(consoleErrorStub.callCount, 1);
  t.deepEqual(consoleErrorStub.getCall(0).args, ['Please specify --copyrightHolder']);
  t.is(consoleLogStub.callCount, 0);
});

function assertFileContent(t: ExecutionContext<any>, file: string, content: string): void {
  const resultJs = fs.readFileSync(path.join(TEST_DATA_FOLDER, file), 'utf8');
  t.is(resultJs, content);
}
