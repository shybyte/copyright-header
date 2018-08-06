#!/usr/bin/env node

// tslint:disable-next-line:no-var-requires
const { version } = require('../../package.json');
import { runCli } from './lib/cli';

const exitCode = runCli(process.argv, version);

if (exitCode) {
  process.exit(exitCode);
}
