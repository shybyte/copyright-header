#!/usr/bin/env node

import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

const COPYRIGHT_OWNER = 'Copyright Owner';
const CREATIVE_FILE_EXTENSIONS: ReadonlyArray<string> = ['ts', 'js'];
const COPYRIGHT_HEADER_REGEXP = /^\/\*[\s\S]*?Copyright[\s\S]*?\*\//;
const COPYRIGHT_TEMPLATE = `/* Copyright (c) ${COPYRIGHT_OWNER} */`;

const FIND_YEARS_REGEXP = /\b20\d{2}\b/g;

const gitFiles = child_process
  .execSync('git ls-files', { encoding: 'utf8' })
  .split('\n');

const creativeFiles = gitFiles.filter(
  filename =>
    filename.startsWith('test-data') &&
    CREATIVE_FILE_EXTENSIONS.includes(path.extname(filename).slice(1))
);

function updateCopyrightHeader(fileContent: string): string {
  const headMatch = fileContent.match(COPYRIGHT_HEADER_REGEXP);
  if (headMatch) {
    const header = headMatch[0];
    const copyrightYears = header.match(FIND_YEARS_REGEXP);
    console.log(header, copyrightYears);
    return fileContent.replace(COPYRIGHT_HEADER_REGEXP, COPYRIGHT_TEMPLATE);
  } else {
    return COPYRIGHT_TEMPLATE + '\n\n' + fileContent;
  }
}

for (const fileName of creativeFiles) {
  const fileContent = fs.readFileSync(fileName, 'utf8');
  console.log(`Checking ${fileName} ...`);
  const newFileContent = updateCopyrightHeader(fileContent);
  if (newFileContent !== fileContent) {
    console.log(`Update copyright header in  ${fileName}`);
    fs.writeFileSync(fileName, newFileContent);
  }
}
