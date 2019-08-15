/* Copyright (c) 2018-2019 Marco Stahl */

import * as child_process from 'child_process';
import { first, getYearFromTimestamp, last, mapOptional } from './utils';

function execToLines(execAndArgs: string[]): string[] {
  const exec = execAndArgs.shift();
  if (!exec) {
    throw new Error(`No command to exec present`);
  }

  return child_process
    .execFileSync(exec, execAndArgs, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line);
}

export function getGitFiles(): string[] {
  return execToLines(['git', 'ls-files']);
}

function invertedGrepOptions(excludeCommitPattern?: string): string[] {
  return excludeCommitPattern ? ['--invert-grep', '--grep=' + excludeCommitPattern] : [];
}

export interface GitFileInfo {
  readonly filename: string;
  readonly createdYear?: number;
  readonly updatedYear?: number;
}

export function getFileInfoFromGit(filename: string, excludeCommits?: string): GitFileInfo {
  const grepFlag = invertedGrepOptions(excludeCommits);
  const logDates = execToLines([
    'git',
    'log',
    '--format=%aD',
    '--follow',
    ...grepFlag,
    '--',
    filename
  ]);

  return {
    filename,
    createdYear: mapOptional(last(logDates), getYearFromTimestamp),
    updatedYear: mapOptional(first(logDates), getYearFromTimestamp)
  };
}

export const testExports = {
  execToLines,
  invertedGrepOptions
};
