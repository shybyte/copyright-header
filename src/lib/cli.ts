/* Copyright (c) 2018 Marco Stahl */

import { Command } from 'commander';
import { ensureUpdatedCopyrightHeader, Options } from './copyright-header';

function parseList(val: string): ReadonlyArray<string> {
  return val.split(',');
}

export function runCli(argv: string[]): void {
  const commander = new Command();
  commander
    .version('0.0.1')
    .option('-i, --include [paths]', 'include regexp file filter', parseList, [])
    .option('-e, --exclude [paths]', 'exclude regexp file filter', parseList, [])
    .option('--copyrightHolder <name>', 'Copyright Holder');

  const options: Options = commander.parse(argv) as any;

  if (!options.copyrightHolder) {
    console.error('Please specify --copyrightHolder');
    return;
  }

  ensureUpdatedCopyrightHeader({
    include: options.include,
    exclude: options.exclude,
    copyrightHolder: options.copyrightHolder
  });
}
