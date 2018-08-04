# Copyright-Header 


[![npm](https://img.shields.io/npm/v/copyright-header.svg)](https://www.npmjs.com/package/copyright-header)
[![Build Status](https://travis-ci.org/shybyte/copyright-header.svg?branch=master)](https://travis-ci.org/shybyte/copyright-header)
[![Maintainability](https://api.codeclimate.com/v1/badges/86720e1fb8a232106f13/maintainability)](https://codeclimate.com/github/shybyte/copyright-header/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/86720e1fb8a232106f13/test_coverage)](https://codeclimate.com/github/shybyte/copyright-header/test_coverage)
[![codecov](https://codecov.io/gh/shybyte/copyright-header/branch/master/graph/badge.svg)](https://codecov.io/gh/shybyte/copyright-header)
[![dependencies Status](https://david-dm.org/shybyte/copyright-header/status.svg)](https://david-dm.org/shybyte/copyright-header)


Add and update copyright headers automatically


## Installation

[![NPM](https://nodei.co/npm/copyright-header.png)](https://www.npmjs.com/package/copyright-header)

Global:
   
    npm i -g copyright-header
    
As local devDependency:
   
    npm i -D copyright-header

   
## Usage Examples (assuming global installation)

Validation:

    copyright-header --copyrightHolder "Darth Fader" --include "src" --exclude "src/cli.ts"

Fixing:

    copyright-header --fix --copyrightHolder "Darth Fader" --include "src" --exclude "src/cli.ts"

## License

MIT

## Copyright

Copyright (c) 2018 Marco Stahl