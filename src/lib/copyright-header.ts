import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { renderSimpleTemplate } from './simple-template';

const CREATIVE_FILE_EXTENSIONS: ReadonlyArray<string> = ['ts', 'js'];
const COPYRIGHT_HEADER_REGEXP = /^\/\*[\s\S]*?Copyright[\s\S]*?\*\//;
const COPYRIGHT_TEMPLATE = `/* Copyright (c) $from$to $copyrightHolder */`;

const FIND_YEARS_REGEXP = /\b20\d{2}\b/g;

export interface FileFilter {
  readonly include: ReadonlyArray<string>;
  readonly exclude: ReadonlyArray<string>;
}

export interface Options extends FileFilter {
  readonly copyrightHolder: string;
}

export function ensureUpdatedCopyrightHeader(opts: Options): void {
  const files = collectFiles(opts);

  for (const fileName of files) {
    const fileContent = fs.readFileSync(fileName, 'utf8');
    console.log(`Checking ${fileName} ...`);
    const newFileContent = updateCopyrightHeader(opts, fileContent);
    if (newFileContent !== fileContent) {
      console.log(`Update copyright header in  ${fileName}`);
      fs.writeFileSync(fileName, newFileContent);
    }
  }
}

export function collectFiles(fileFilter: FileFilter): ReadonlyArray<string> {
  const gitFiles = child_process.execSync('git ls-files', { encoding: 'utf8' }).split('\n');

  const includeRegexps = fileFilter.include.map(pattern => new RegExp(pattern));
  const includeFilter = (filename: string) =>
    includeRegexps.length === 0 || includeRegexps.some(regexp => regexp.test(filename));

  const excludeRegexps = fileFilter.exclude.map(pattern => new RegExp(pattern));
  const excludeFilter = (filename: string) =>
    includeRegexps.length === 0 || !excludeRegexps.some(regexp => regexp.test(filename));

  return gitFiles
    .filter(includeFilter)
    .filter(excludeFilter)
    .filter(filename => CREATIVE_FILE_EXTENSIONS.includes(path.extname(filename).slice(1)));
}

interface YearRange {
  readonly from: string;
  readonly to?: string;
}

function getCopyrightYears(currentHeader?: string): YearRange {
  const copyrightYears = currentHeader && currentHeader.match(FIND_YEARS_REGEXP);
  if (copyrightYears && copyrightYears.length > 0) {
    return {
      from: copyrightYears[0],
      to: copyrightYears[1]
    };
  } else {
    return { from: new Date().getFullYear().toString() };
  }
}

function renderNewHeader(copyrightHolder: string, currentHeader?: string): string {
  const copyrightYears = getCopyrightYears(currentHeader);
  return renderSimpleTemplate(COPYRIGHT_TEMPLATE, {
    from: copyrightYears.from,
    to: copyrightYears.to ? '-' + copyrightYears.to : '',
    copyrightHolder: copyrightHolder
  });
}

function updateCopyrightHeader(opts: Options, fileContent: string): string {
  const headMatch = fileContent.match(COPYRIGHT_HEADER_REGEXP);
  if (headMatch) {
    return fileContent.replace(
      COPYRIGHT_HEADER_REGEXP,
      renderNewHeader(opts.copyrightHolder, headMatch[0])
    );
  } else {
    return renderNewHeader(opts.copyrightHolder) + '\n\n' + fileContent;
  }
}
