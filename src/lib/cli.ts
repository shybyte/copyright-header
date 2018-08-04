/* Copyright (c) 2018 Marco Stahl */

import { Command } from 'commander';
import { ensureUpdatedCopyrightHeader, Options } from './copyright-header';

function parseList(val: string): ReadonlyArray<string> {
  return val.split(',');
}

export const enum ExitCode {
  OK = 0,
  ERROR = 1
}

export function runCli(argv: string[], version = 'unknown'): ExitCode {
  const commander = new Command();
  commander
    .version(version)
    .option('-i, --include [paths]', 'include regexp file filter', parseList, [])
    .option('-e, --exclude [paths]', 'exclude regexp file filter', parseList, [])
    .option('--fix', 'adds or updates copyright header to files', false)
    .option('--copyrightHolder <name>', 'Copyright Holder')
    .option('--excludeCommits [pattern]', 'ignores commits which message match this pattern');

  const options: Options = commander.parse(argv) as any;

  if (!options.copyrightHolder) {
    console.error('Please specify --copyrightHolder');
    return ExitCode.OK;
  }

  const result = ensureUpdatedCopyrightHeader({
    include: options.include,
    fix: options.fix,
    exclude: options.exclude,
    copyrightHolder: options.copyrightHolder,
    excludeCommits: options.excludeCommits,
  });

  return result.unFixedFiles.length ? ExitCode.ERROR : ExitCode.OK;
}
