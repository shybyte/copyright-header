/* Copyright (c) 2018 Marco Stahl */

import { Command } from 'commander';
import { ensureUpdatedCopyrightHeader, FileFilter } from './copyright-header';
import { DEFAULT_TEMPLATE_ID, TEMPLATE_IDS, TEMPLATES } from './templates';
import { ToYear } from './types';
import { mapOptional, Result } from './utils';

export const enum ExitCode {
  OK = 0,
  ERROR = 1
}

export interface CliOptions extends FileFilter {
  readonly copyrightHolder: string;
  readonly fix: boolean;
  readonly templateId: string;
  readonly excludeCommits?: string;
  readonly forceModificationYear?: string;
}

export function runCli(argv: string[], version = 'unknown'): ExitCode {
  const commander = new Command();
  commander
    .option('--copyrightHolder <name>', 'Copyright Holder')
    .option('--fix', 'adds or updates copyright header to files', false)
    .option('--templateId <id>', TEMPLATE_IDS.join(' | '), DEFAULT_TEMPLATE_ID)
    .option('-i, --include <paths>', 'include regexp file filter', parseList, [])
    .option('-e, --exclude <paths>', 'exclude regexp file filter', parseList, [])
    .option('--forceModificationYear <year>', 'number | "present"')
    .option('--excludeCommits <pattern>', 'ignores commits which message match this pattern')
    .version(version);

  const options: CliOptions = commander.parse(argv) as any;

  if (!options.copyrightHolder) {
    return reportError('Please specify --copyrightHolder');
  }

  if (options.templateId && !(options.templateId in TEMPLATES)) {
    return reportError(`templateId must be one of [${TEMPLATE_IDS.join(', ')}]`);
  }

  const forceModificationYear = mapOptional(options.forceModificationYear, parseModificationYear);
  if (forceModificationYear instanceof Error) {
    return reportError('--forceModificationYear: ' + forceModificationYear.message);
  }

  const result = ensureUpdatedCopyrightHeader({
    include: options.include,
    fix: options.fix,
    exclude: options.exclude,
    copyrightHolder: options.copyrightHolder,
    excludeCommits: options.excludeCommits,
    template: TEMPLATES[options.templateId],
    forceModificationYear: forceModificationYear
  });

  return result.unFixedFiles.length ? ExitCode.ERROR : ExitCode.OK;
}

function reportError(message: string): ExitCode {
  console.error(message);
  return ExitCode.ERROR;
}

function parseList(val: string): ReadonlyArray<string> {
  return val.split(',');
}

function parseModificationYear(year: string): Result<ToYear> {
  if (year === 'present') {
    return 'present';
  } else {
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
      return new Error(`"${year}" is not a valid year. It must be a number or "present"`);
    }
    return yearNumber;
  }
}
