/* Copyright (c) 2018 Marco Stahl */

import * as fs from 'fs';
import * as path from 'path';
import { getFileInfoFromGit, getGitFiles } from './git';
import { renderSimpleTemplate } from './simple-template';
import { FileInfo } from './types';

const CREATIVE_FILE_EXTENSIONS: ReadonlyArray<string> = [
  'ts',
  'js',
  'tsx',
  'jsx',
  'java',
  'cs',
  'm',
  'h',
  'c',
  'cc',
  'cpp',
  'c++',
  'cxx',
  'cp'
];

const COPYRIGHT_HEADER_REGEXP = /^\/\*[\s\S]*?Copyright[\s\S]*?\*\//;
const FIND_YEARS_REGEXP = /\b20\d{2}\b|present/g;

export interface FileFilter {
  readonly include: ReadonlyArray<string>;
  readonly exclude: ReadonlyArray<string>;
}

export interface ValidatedOptions extends FileFilter {
  readonly copyrightHolder: string;
  readonly fix: boolean;
  readonly excludeCommits?: string;
  readonly template: string;
}

interface ValidationResult {
  readonly unFixedFiles: ReadonlyArray<string>;
}

export function ensureUpdatedCopyrightHeader(opts: ValidatedOptions): ValidationResult {
  const files = collectFiles(opts);
  const fileInfos: FileInfo[] = files.map(f => getFileInfoFromGit(f, opts.excludeCommits));
  const unFixedFiles = [];

  for (const fileInfo of fileInfos) {
    const fileContent = fs.readFileSync(fileInfo.filename, 'utf8');
    console.log(`Checking ${fileInfo.filename} ...`);
    const newFileContent = updateCopyrightHeader(opts, fileInfo, fileContent);
    if (newFileContent !== fileContent) {
      if (opts.fix) {
        console.log(`Update copyright header in  ${fileInfo.filename}`);
        fs.writeFileSync(fileInfo.filename, newFileContent);
      } else {
        console.log(`Need to fix copyright header in  ${fileInfo.filename}`);
        unFixedFiles.push(fileInfo.filename);
      }
    }
  }

  return { unFixedFiles };
}

export function collectFiles(fileFilter: FileFilter): ReadonlyArray<string> {
  const gitFiles = getGitFiles();

  const includeRegexps = fileFilter.include.map(pattern => new RegExp(pattern));
  const includeFilter = (filename: string) =>
    includeRegexps.length === 0 || includeRegexps.some(regexp => regexp.test(filename));

  const excludeRegexps = fileFilter.exclude.map(pattern => new RegExp(pattern));
  const excludeFilter = (filename: string) =>
    includeRegexps.length === 0 || !excludeRegexps.some(regexp => regexp.test(filename));

  return gitFiles
    .filter(includeFilter)
    .filter(excludeFilter)
    .filter(filename =>
      CREATIVE_FILE_EXTENSIONS.includes(
        path
          .extname(filename)
          .toLowerCase()
          .slice(1)
      )
    );
}

interface YearRange {
  readonly from: string;
  readonly to?: string;
}

function getMaxYear(year1: number, yearOrPresent2: string | null): string {
  if (!yearOrPresent2) {
    return year1.toString();
  } else if (yearOrPresent2 === 'present') {
    return 'present';
  } else {
    const year2 = parseInt(yearOrPresent2, 10);
    return Math.max(year1, year2).toString();
  }
}

function getCopyrightYears(fileInfo: FileInfo, currentHeader: string | undefined): YearRange {
  const copyrightYears = currentHeader && currentHeader.match(FIND_YEARS_REGEXP);
  if (copyrightYears && copyrightYears.length > 0) {
    return {
      from: copyrightYears[0],
      to: getMaxYear(fileInfo.updatedYear, copyrightYears[1])
    };
  } else {
    return { from: fileInfo.createdYear.toString(), to: fileInfo.updatedYear.toString() };
  }
}

function renderNewHeader(opts: {
  readonly fileInfo: FileInfo;
  readonly template: string;
  readonly copyrightHolder: string;
  readonly currentHeader?: string;
}): string {
  const copyrightYears = getCopyrightYears(opts.fileInfo, opts.currentHeader);
  const needToShowUpdatedYear = copyrightYears.to && copyrightYears.to !== copyrightYears.from;
  return renderSimpleTemplate(opts.template, {
    from: copyrightYears.from,
    to: needToShowUpdatedYear ? '-' + copyrightYears.to : '',
    copyrightHolder: opts.copyrightHolder
  });
}

function updateCopyrightHeader(
  opts: ValidatedOptions,
  fileInfo: FileInfo,
  fileContent: string
): string {
  const renderOpts = {
    fileInfo,
    template: opts.template,
    copyrightHolder: opts.copyrightHolder
  };

  const headMatch = fileContent.match(COPYRIGHT_HEADER_REGEXP);
  if (headMatch) {
    return fileContent.replace(
      COPYRIGHT_HEADER_REGEXP,
      renderNewHeader({
        ...renderOpts,
        currentHeader: headMatch[0]
      })
    );
  } else {
    return renderNewHeader(renderOpts) + '\n\n' + fileContent;
  }
}
