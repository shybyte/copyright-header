/* Copyright (c) 2018 Marco Stahl */

import { Command } from 'commander';
import { ensureUpdatedCopyrightHeader, FileFilter } from './copyright-header';
import { DEFAULT_TEMPLATE_ID, TEMPLATE_IDS, TEMPLATES } from './templates';

function parseList(val: string): ReadonlyArray<string> {
  return val.split(',');
}

export const enum ExitCode {
  OK = 0,
  ERROR = 1
}

export interface CliOptions extends FileFilter {
  readonly copyrightHolder: string;
  readonly fix: boolean;
  readonly templateId: string;
  readonly excludeCommits?: string;
}

export function runCli(argv: string[], version = 'unknown'): ExitCode {
  const commander = new Command();
  commander
    .version(version)
    .option('-i, --include [paths]', 'include regexp file filter', parseList, [])
    .option('-e, --exclude [paths]', 'exclude regexp file filter', parseList, [])
    .option('--fix', 'adds or updates copyright header to files', false)
    .option('--copyrightHolder <name>', 'Copyright Holder')
    .option('--excludeCommits [pattern]', 'ignores commits which message match this pattern')
    .option('--templateId [id]', TEMPLATE_IDS.join(' | '), DEFAULT_TEMPLATE_ID);

  const options: CliOptions = commander.parse(argv) as any;

  if (!options.copyrightHolder) {
    console.error('Please specify --copyrightHolder');
    return ExitCode.ERROR;
  }

  if (options.templateId && !(options.templateId in TEMPLATES)) {
    console.error(`templateId must be one of [${TEMPLATE_IDS.join(', ')}]`);
    return ExitCode.ERROR;
  }

  const result = ensureUpdatedCopyrightHeader({
    include: options.include,
    fix: options.fix,
    exclude: options.exclude,
    copyrightHolder: options.copyrightHolder,
    excludeCommits: options.excludeCommits,
    template: TEMPLATES[options.templateId]
  });

  return result.unFixedFiles.length ? ExitCode.ERROR : ExitCode.OK;
}
