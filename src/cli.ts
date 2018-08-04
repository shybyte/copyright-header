#!/usr/bin/env node

import { version } from '../package.json';
import { runCli } from './lib/cli';

runCli(process.argv, version);
