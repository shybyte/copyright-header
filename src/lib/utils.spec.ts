/* Copyright (c) 2018 Marco Stahl */

import { test } from 'ava';
import { mapOptional } from './utils';

test('mapOptional', t => {
  const f = (x: number) => x.toString();
  t.is(mapOptional(undefined, f), undefined);
  t.is(mapOptional(123, f), '123');
});
