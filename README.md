# Copyright-Header


[![npm](https://img.shields.io/npm/v/copyright-header.svg)](https://www.npmjs.com/package/copyright-header)
[![Build Status](https://travis-ci.org/shybyte/copyright-header.svg?branch=master)](https://travis-ci.org/shybyte/copyright-header)
[![Maintainability](https://api.codeclimate.com/v1/badges/86720e1fb8a232106f13/maintainability)](https://codeclimate.com/github/shybyte/copyright-header/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/86720e1fb8a232106f13/test_coverage)](https://codeclimate.com/github/shybyte/copyright-header/test_coverage)
[![codecov](https://codecov.io/gh/shybyte/copyright-header/branch/master/graph/badge.svg)](https://codecov.io/gh/shybyte/copyright-header)
[![dependencies Status](https://david-dm.org/shybyte/copyright-header/status.svg)](https://david-dm.org/shybyte/copyright-header)


Validate, add and update copyright headers automatically, based on the git history.


## Installation

[![NPM](https://nodei.co/npm/copyright-header.png)](https://www.npmjs.com/package/copyright-header)

Global:

    npm i -g copyright-header

As local devDependency:

    npm i -D copyright-header

# Usage Hints

* Use it inside of a git repo.
* It will only affect files tracked by git.

## Usage Examples (assuming global installation)

Validation:

    copyright-header --copyrightHolder "Darth Fader" --include "src" --exclude "src/cli.ts"

Fixing:

    copyright-header --fix --copyrightHolder "Darth Fader" --include "src" --exclude "src/cli.ts"


# Options

    Usage: copyright-header [options]

    Options:

      --copyrightHolder <name>        Copyright Holder
      --fix                           adds or updates copyright header to files
      --templateId <id>               minimal | apache | gplv3 (default: minimal)
      -i, --include <paths>           include regexp file filter (default: )
      -e, --exclude <paths>           exclude regexp file filter (default: )
      --forceModificationYear <year>  number | "present"
      --excludeCommits <pattern>      ignores commits which message match this pattern
      -V, --version                   output the version number
      -h, --help                      output usage information



## License

MIT

## Copyright

Copyright (c) 2019 Marco Stahl
