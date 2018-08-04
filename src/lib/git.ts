/* Copyright (c) 2018 Marco Stahl */

import * as child_process from 'child_process';
import { FileInfo } from './types';

function execToLines(command: string): string[] {
  return child_process
    .execSync(command, { encoding: 'utf8' })
    .split('\n')
    .filter(line => line);
}

export function getGitFiles(): string[] {
  return execToLines('git ls-files');
}


function invertedGrepOptions(excludeCommitPattern?: string): string {
  return excludeCommitPattern ? '--invert-grep --grep=' + excludeCommitPattern : '';
}

export function getFileInfoFromGit(filename: string, excludeCommits?: string): FileInfo {
  const grepFlag = invertedGrepOptions(excludeCommits);
  const logDates = execToLines(`git log --format=%aD --follow ${grepFlag} -- ${filename}`);

  return {
    filename,
    createdYear: new Date(logDates[logDates.length - 1]).getFullYear(),
    updatedYear: new Date(logDates[0]).getFullYear()
  };
}

export const testExports = {
  invertedGrepOptions
};