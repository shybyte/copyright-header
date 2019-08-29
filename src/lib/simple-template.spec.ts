/* Copyright (c) 2018-2019 Marco Stahl */

import test from 'ava';
import { renderSimpleTemplate } from './simple-template';

test('renderSimpleTemplate replaces vars', t => {
  t.is(renderSimpleTemplate('start $variable end', { variable: 'value' }), 'start value end');
  t.is(
    renderSimpleTemplate('start $variable1 $variable2 end', {
      variable1: 'value1',
      variable2: 'value2'
    }),
    'start value1 value2 end'
  );
});
