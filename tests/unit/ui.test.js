import test from 'node:test';
import assert from 'node:assert/strict';

import { debounce, isDirtLocation } from '../../js/modules/ui.js';
import { wait } from './helpers/environment.js';

test('ui: isDirtLocation flags known dirt routes', () => {
  assert.strictEqual(isDirtLocation('figure8'), true);
  assert.strictEqual(isDirtLocation('huber'), true);
  assert.strictEqual(isDirtLocation('tatum'), true);
  assert.strictEqual(isDirtLocation('holmdel'), true);

  assert.strictEqual(isDirtLocation('round-town'), false);
  assert.strictEqual(isDirtLocation('sandy-hook'), false);
  assert.strictEqual(isDirtLocation('asbury-boardwalk'), false);
  assert.strictEqual(isDirtLocation('nonexistent'), false);
});

test('ui: debounce delays execution until idle', async () => {
  let callCount = 0;
  const debounced = debounce(() => {
    callCount += 1;
  }, 50);

  debounced();
  debounced();
  debounced();

  assert.strictEqual(callCount, 0);
  await wait(80);
  assert.strictEqual(callCount, 1);
});

test('ui: debounce resets timer on rapid calls', async () => {
  let callCount = 0;
  const debounced = debounce(() => {
    callCount += 1;
  }, 80);

  debounced();

  setTimeout(() => {
    debounced();
  }, 40);

  await wait(150);
  assert.strictEqual(callCount, 1);
});
