import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toMinutes,
  fromMinutes,
  format12,
  sanitizeMinutes,
  calculateWakeTime,
} from '../../js/core/calculator.js';

test('toMinutes converts HH:MM to minutes since midnight', () => {
  assert.equal(toMinutes('00:00'), 0);
  assert.equal(toMinutes('08:30'), 510);
  assert.equal(toMinutes('23:59'), 23 * 60 + 59);
});

test('fromMinutes normalizes minutes and formats with leading zeros', () => {
  assert.equal(fromMinutes(0), '00:00');
  assert.equal(fromMinutes(510), '08:30');
  assert.equal(fromMinutes(-30), '23:30');
});

test('format12 creates human readable 12 hour time strings', () => {
  assert.equal(format12('00:00'), '12:00 AM');
  assert.equal(format12('08:15'), '8:15 AM');
  assert.equal(format12('12:45'), '12:45 PM');
  assert.equal(format12('23:10'), '11:10 PM');
});

test('sanitizeMinutes constrains values to expected numeric range', () => {
  assert.equal(sanitizeMinutes('45', 30), 45);
  assert.equal(sanitizeMinutes('004', 30), 4);
  assert.equal(sanitizeMinutes('abc', 30), 30);
  assert.equal(sanitizeMinutes('1200', 15), 15);
  assert.equal(sanitizeMinutes(-5, 15), 15);
});

test('calculateWakeTime returns consistent breakdowns for provided inputs', () => {
  const result = calculateWakeTime({
    meeting: '08:30',
    runMinutes: 50,
    travelMinutes: 20,
    breakfastMinutes: 10,
  });

  assert.equal(result.wakeTime, '06:25');
  assert.equal(result.wakeTime12, '6:25 AM');
  assert.equal(result.latestWakeTime, '06:55');
  assert.equal(result.runStartTime, '06:35');
  assert.equal(result.previousDay, false);
  assert.deepEqual(result.durations, {
    prep: 45,
    prepBeforeRun: 20,
    run: 50,
    travel: 20,
    breakfast: 10,
  });
});

