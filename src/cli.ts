#!/usr/bin/env node

import { version } from '../package.json';
import { runCli } from './lib/cli';

const exitCode = runCli(process.argv, version);

if (exitCode) {
  process.exit(exitCode);
}
