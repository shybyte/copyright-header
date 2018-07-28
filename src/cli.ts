#!/usr/bin/env node

import { ensureUpdatedCopyrightHeader } from './lib/copyright-header';

ensureUpdatedCopyrightHeader({
  include: ['test-data'],
  copyrightHolder: 'CopyrightHolder'
});
