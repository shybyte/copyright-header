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

export function getFileInfoFromGit(filename: string): FileInfo {
  const logDates = execToLines(`git log --format=%aD --follow -- ${filename}`);

  return {
    filename,
    createdYear: new Date(logDates[logDates.length - 1]).getFullYear(),
    updatedYear: new Date(logDates[0]).getFullYear()
  };
}
