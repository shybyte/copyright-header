/* Copyright (c) 2018-2019 Marco Stahl */

import * as fs from 'fs';
import * as path from 'path';
import { getFileInfoFromGit, getGitFiles, GitFileInfo } from './git';
import { renderSimpleTemplate } from './simple-template';
import { FileInfo, ToYear, YearRange } from './types';

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

const COPYRIGHT_HEADER_REGEXP = /^(\s*)(\/\*[\s\S]*?Copyright[\s\S]*?\*\/)/;
const FIND_YEARS_REGEXP = /\b20\d{2}\b|present/g;
const HASHBANG_REGEXP = /^(#\!.*?\n)(.*)$/s;

export interface FileFilter {
  readonly include: ReadonlyArray<string>;
  readonly exclude: ReadonlyArray<string>;
}

export interface ValidatedOptions extends FileFilter {
  readonly copyrightHolder: string;
  readonly fix: boolean;
  readonly excludeCommits?: string;
  readonly template: string;
  readonly templateRegex?: RegExp;
  readonly forceModificationYear?: ToYear;
}

interface ValidationResult {
  readonly unFixedFiles: ReadonlyArray<string>;
}

export function ensureUpdatedCopyrightHeader(opts: ValidatedOptions): ValidationResult {
  const files = collectFiles(opts);
  const fileInfos: FileInfo[] = files.map(f =>
    useTodayAsYearDefault(getFileInfoFromGit(f, opts.excludeCommits))
  );
  const unFixedFiles = [];

  for (const fileInfo of fileInfos) {
    const fileContent = fs.readFileSync(fileInfo.filename, 'utf8');
    console.log(`Checking ${fileInfo.filename} ...`);
    const newFileContent = updateCopyrightHeader(opts, fileInfo, fileContent);
    if (!stringsEqual(newFileContent, fileContent)) {
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

// Compare strings ignoring whitespace
function stringsEqual(a: string, b: string): boolean {
  return a.replace(/\s+/g, ' ') === b.replace(/\s+/g, ' ');
}

function useTodayAsYearDefault(fileinfo: GitFileInfo): FileInfo {
  return {
    filename: fileinfo.filename,
    createdYear: fileinfo.createdYear || new Date().getFullYear(),
    updatedYear: fileinfo.updatedYear || new Date().getFullYear()
  };
}

function collectFiles(fileFilter: FileFilter): ReadonlyArray<string> {
  const gitFiles = getGitFiles();

  const includeRegexps = fileFilter.include.map(pattern => new RegExp(pattern));
  const includeFilter = (filename: string) =>
    includeRegexps.length === 0 || includeRegexps.some(regexp => regexp.test(filename));

  const excludeRegexps = fileFilter.exclude.map(pattern => new RegExp(pattern));
  const excludeFilter = (filename: string) =>
    excludeRegexps.length === 0 || !excludeRegexps.some(regexp => regexp.test(filename));

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

function getMaxYear(year1: number, yearOrPresent2: string | null): ToYear {
  if (!yearOrPresent2) {
    return year1;
  } else if (yearOrPresent2 === 'present') {
    return 'present';
  } else {
    const year2 = parseInt(yearOrPresent2, 10);
    return Math.max(year1, year2);
  }
}

function getCopyrightYears(
  fileInfo: FileInfo,
  currentHeader: string | undefined,
  forceModificationYear?: ToYear
): YearRange {
  const copyrightYears = currentHeader && currentHeader.match(FIND_YEARS_REGEXP);
  if (copyrightYears && copyrightYears.length > 0) {
    return {
      from: parseInt(copyrightYears[0], 10),
      to: forceModificationYear || getMaxYear(fileInfo.updatedYear, copyrightYears[1])
    };
  } else {
    return { from: fileInfo.createdYear, to: forceModificationYear || fileInfo.updatedYear };
  }
}

function renderNewHeader(opts: {
  readonly fileInfo: FileInfo;
  readonly template: string;
  readonly copyrightHolder: string;
  readonly currentHeader?: string;
  readonly forceModificationYear?: ToYear;
}): string {
  const copyrightYears = getCopyrightYears(
    opts.fileInfo,
    opts.currentHeader,
    opts.forceModificationYear
  );
  const needToShowUpdatedYear = copyrightYears.to && copyrightYears.to !== copyrightYears.from;
  return renderSimpleTemplate(opts.template, {
    from: copyrightYears.from.toString(),
    to: needToShowUpdatedYear ? '-' + copyrightYears.to : '',
    copyrightHolder: opts.copyrightHolder
  });
}

function updateCopyrightHeader(
  opts: ValidatedOptions,
  fileInfo: FileInfo,
  origFileContent: string
): string {
  const renderOpts = {
    fileInfo,
    template: opts.template,
    copyrightHolder: opts.copyrightHolder,
    forceModificationYear: opts.forceModificationYear
  };
  let hashbang = '';
  let fileContent = origFileContent;

  const hashbangMatch = origFileContent.match(HASHBANG_REGEXP);
  if (hashbangMatch) {
    hashbang = hashbangMatch[1];
    fileContent = hashbangMatch[2];
  }

  const regex = opts.templateRegex ? opts.templateRegex : COPYRIGHT_HEADER_REGEXP;

  const headMatch = fileContent.match(regex);
  if (headMatch) {
    const leadingWhitespace = headMatch[1];
    fileContent = fileContent.replace(
      regex,
      leadingWhitespace +
        renderNewHeader({
          ...renderOpts,
          currentHeader: headMatch[2]
        })
    );
  } else {
    fileContent = renderNewHeader(renderOpts) + '\n\n' + fileContent;
    if (hashbang) {
      hashbang += '\n';
    }
  }

  return hashbang + fileContent;
}

export const testExports = {
  collectFiles,
  updateCopyrightHeader,
  useTodayAsYearDefault
};
