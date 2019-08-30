#!/usr/bin/env node

/* Copyright (c) 2018 Marco Stahl */

// tslint:disable-next-line:no-var-requires
const { version } = require('../../package.json');
import { runCli } from './lib/cli';

const exitCode = runCli(process.argv, version);

if (exitCode) {
  process.exit(exitCode);
}
