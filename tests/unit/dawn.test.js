import test from 'node:test';
import assert from 'node:assert/strict';

import {
  checkDaylightNeeded,
  setTestDawn,
} from '../../js/modules/dawn.js';

test('dawn: checkDaylightNeeded returns false without dawn data', () => {
  const result = checkDaylightNeeded(360, null);
  assert.deepStrictEqual(result, { needed: false, message: null });
});

test('dawn: checkDaylightNeeded warns when run is before dawn', () => {
  const dawn = new Date();
  dawn.setHours(7, 0, 0, 0);

  const result = checkDaylightNeeded(390, dawn);
  assert.strictEqual(result.needed, true);
  assert.strictEqual(result.message, 'Check daylight (30 min before dawn)');
  assert.strictEqual(result.minutesBefore, 30);
});

test('dawn: checkDaylightNeeded warns at dawn', () => {
  const dawn = new Date();
  dawn.setHours(6, 30, 0, 0);

  const result = checkDaylightNeeded(390, dawn);
  assert.strictEqual(result.needed, true);
  assert.strictEqual(result.message, 'Check daylight (at dawn)');
  assert.strictEqual(result.minutesBefore, 0);
});

test('dawn: checkDaylightNeeded allows runs after dawn', () => {
  const dawn = new Date();
  dawn.setHours(6, 0, 0, 0);

  const result = checkDaylightNeeded(420, dawn);
  assert.deepStrictEqual(result, { needed: false, message: null });
});

test('dawn: checkDaylightNeeded handles wrap-around near midnight', () => {
  const dawn = new Date();
  dawn.setHours(6, 0, 0, 0);

  const result = checkDaylightNeeded(300, dawn);
  assert.strictEqual(result.needed, true);
  assert.strictEqual(result.minutesBefore, 60);
  assert.strictEqual(result.message, 'Check daylight (60 min before dawn)');
});

test('dawn: checkDaylightNeeded handles very early runs', () => {
  const dawn = new Date();
  dawn.setHours(7, 0, 0, 0);

  const result = checkDaylightNeeded(240, dawn);
  assert.strictEqual(result.needed, true);
  assert.strictEqual(result.minutesBefore, 180);
  assert.strictEqual(result.message, 'Check daylight (180 min before dawn)');
});

test('dawn: setTestDawn produces exact time', () => {
  const dawn = setTestDawn(6, 30);
  assert.strictEqual(dawn.getHours(), 6);
  assert.strictEqual(dawn.getMinutes(), 30);
  assert.strictEqual(dawn.getSeconds(), 0);
  assert.strictEqual(dawn.getMilliseconds(), 0);
});

test('dawn: setTestDawn handles boundary values', () => {
  const midnight = setTestDawn(0, 0);
  assert.strictEqual(midnight.getHours(), 0);
  assert.strictEqual(midnight.getMinutes(), 0);

  const noon = setTestDawn(12, 0);
  assert.strictEqual(noon.getHours(), 12);
  assert.strictEqual(noon.getMinutes(), 0);

  const late = setTestDawn(23, 59);
  assert.strictEqual(late.getHours(), 23);
  assert.strictEqual(late.getMinutes(), 59);
});

test('dawn: daylight helper integrates repeated calls', () => {
  const testDawn = setTestDawn(6, 0);
  const early = checkDaylightNeeded(300, testDawn);
  const late = checkDaylightNeeded(420, testDawn);

  assert.strictEqual(early.needed, true);
  assert.strictEqual(early.minutesBefore, 60);
  assert.strictEqual(late.needed, false);
});
