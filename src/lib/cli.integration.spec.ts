/* Copyright (c) 2018-2021 Marco Stahl */

import test, { ExecutionContext } from 'ava';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createSandbox, SinonSandbox, SinonStub } from 'sinon';
import { ExitCode, runCli } from './cli';

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

test.serial('validate but not fix', t => {
  const exitCode = runCli([
    'node',
    'script.js',
    '--include',
    TEST_DATA_FOLDER,
    '--copyrightHolder',
    'CopyrightHolder'
  ]);

  t.is(exitCode, ExitCode.ERROR);
});

test.serial('--fix', t => {
  const exitCode = runCli([
    'node',
    'script.js',
    '--include',
    TEST_DATA_FOLDER,
    '--copyrightHolder',
    'CopyrightHolder',
    '--fix'
  ]);

  t.is(exitCode, ExitCode.OK);

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

test.serial('--forceModificationYear present', t => {
  const exitCode = runCli([
    'node',
    'script.js',
    '--include',
    TEST_DATA_FOLDER,
    '--copyrightHolder',
    'CopyrightHolder',
    '--forceModificationYear',
    'present',
    '--fix'
  ]);

  t.is(exitCode, ExitCode.OK);

  assertFileContent(
    t,
    'file-javascript.js',
    '/* Copyright (c) 2018-present CopyrightHolder */\n\n' + "console.log('Test');"
  );

  assertFileContent(
    t,
    'file-javascript-with-header-start-year.js',
    '/* Copyright (c) 2015-present CopyrightHolder */\n\n' + "console.log('Test');"
  );

  assertFileContent(
    t,
    'file-javascript-with-header-start-year-to-year.js',
    '/* Copyright (c) 2015-present CopyrightHolder */\n\n' + "console.log('Test');"
  );

  assertFileContent(
    t,
    'file-javascript-with-header-start-year-to-present.js',
    '/* Copyright (c) 2014-present CopyrightHolder */\n\n' + "console.log('Test');"
  );
});
test.serial('--forceModificationYear number', t => {
  const exitCode = runCli([
    'node',
    'script.js',
    '--include',
    TEST_DATA_FOLDER,
    '--copyrightHolder',
    'CopyrightHolder',
    '--forceModificationYear',
    '2018',
    '--fix'
  ]);

  t.is(exitCode, ExitCode.OK);

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
    '/* Copyright (c) 2014-2018 CopyrightHolder */\n\n' + "console.log('Test');"
  );
});

const verifyValidationError = (
  t: ExecutionContext<unknown>,
  argv: ReadonlyArray<string>,
  expectedErrorMessage: string
) => {
  consoleLogStub = sinonSandbox.stub(console, 'log');
  consoleErrorStub = sinonSandbox.stub(console, 'error');

  const exitCode = runCli(['node', 'script.js', ...argv]);

  t.is(exitCode, ExitCode.ERROR);
  t.is(consoleErrorStub.callCount, 1);
  t.deepEqual(consoleErrorStub.getCall(0).args, [expectedErrorMessage]);
  t.is(consoleLogStub.callCount, 0);
};

test.serial(
  '--copyrightHolder is required',
  verifyValidationError,
  ['--include', TEST_DATA_FOLDER],
  'Please specify --copyrightHolder'
);

test.serial(
  '--templateId validation',
  verifyValidationError,
  [
    '--copyrightHolder',
    'CopyrightHolder',
    '--include',
    TEST_DATA_FOLDER,
    '--templateId',
    'unknownTemplateId'
  ],
  'templateId must be one of [minimal, apache, gplv3]'
);

test.serial(
  '--forceModificationYear',
  verifyValidationError,
  ['--copyrightHolder', 'CopyrightHolder', '--forceModificationYear', 'noNumber'],
  '--forceModificationYear: "noNumber" is not a valid year. It must be a number or "present"'
);

function assertFileContent(t: ExecutionContext<any>, file: string, content: string): void {
  const resultJs = fs.readFileSync(path.join(TEST_DATA_FOLDER, file), 'utf8');
  t.is(resultJs, content);
}
