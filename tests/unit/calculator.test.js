import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateWakeTime,
  toMinutes,
  fromMinutes,
  format12,
  sanitizeMinutes,
} from '../../js/core/calculator.js';

test('calculator: toMinutes converts time string to minutes', () => {
  assert.strictEqual(toMinutes('00:00'), 0);
  assert.strictEqual(toMinutes('01:00'), 60);
  assert.strictEqual(toMinutes('08:30'), 510);
  assert.strictEqual(toMinutes('23:59'), 1439);
});

test('calculator: fromMinutes converts minutes to HH:MM', () => {
  assert.strictEqual(fromMinutes(0), '00:00');
  assert.strictEqual(fromMinutes(60), '01:00');
  assert.strictEqual(fromMinutes(510), '08:30');
  assert.strictEqual(fromMinutes(1439), '23:59');
});

test('calculator: fromMinutes wraps negative values within a day', () => {
  assert.strictEqual(fromMinutes(-60), '23:00');
  assert.strictEqual(fromMinutes(-120), '22:00');
});

test('calculator: fromMinutes wraps values beyond 24 hours', () => {
  assert.strictEqual(fromMinutes(1440), '00:00');
  assert.strictEqual(fromMinutes(1500), '01:00');
});

test('calculator: format12 converts to 12-hour clock', () => {
  assert.strictEqual(format12('00:00'), '12:00 AM');
  assert.strictEqual(format12('01:30'), '1:30 AM');
  assert.strictEqual(format12('12:00'), '12:00 PM');
  assert.strictEqual(format12('13:45'), '1:45 PM');
  assert.strictEqual(format12('23:59'), '11:59 PM');
});

test('calculator: sanitizeMinutes keeps valid values', () => {
  assert.strictEqual(sanitizeMinutes(0, 10), 0);
  assert.strictEqual(sanitizeMinutes(45, 10), 45);
  assert.strictEqual(sanitizeMinutes(999, 10), 999);
});

test('calculator: sanitizeMinutes falls back for invalid values', () => {
  assert.strictEqual(sanitizeMinutes('abc', 10), 10);
  assert.strictEqual(sanitizeMinutes(-5, 10), 10);
  assert.strictEqual(sanitizeMinutes(1000, 10), 10);
  assert.strictEqual(sanitizeMinutes(Number.NaN, 10), 10);
});

test('calculator: calculateWakeTime computes schedule for morning meeting', () => {
  const result = calculateWakeTime({
    meeting: '08:00',
    runMinutes: 45,
    travelMinutes: 20,
    breakfastMinutes: 15,
  });

  assert.strictEqual(result.wakeTime, '05:55');
  assert.strictEqual(result.wakeTime12, '5:55 AM');
  assert.strictEqual(result.totalMinutes, 125);
  assert.strictEqual(result.previousDay, false);
});

test('calculator: calculateWakeTime handles previous-day wake ups', () => {
  const result = calculateWakeTime({
    meeting: '02:00',
    runMinutes: 90,
    travelMinutes: 30,
    breakfastMinutes: 45,
  });

  assert.strictEqual(result.previousDay, true);
  assert.ok(result.wakeTime12.includes('PM'));
});

test('calculator: calculateWakeTime supports zero optional activities', () => {
  const result = calculateWakeTime({
    meeting: '09:00',
    runMinutes: 0,
    travelMinutes: 0,
    breakfastMinutes: 0,
  });

  assert.strictEqual(result.wakeTime, '08:15');
  assert.strictEqual(result.totalMinutes, 45);
  assert.strictEqual(result.previousDay, false);
});

test('calculator: calculateWakeTime returns intermediate times', () => {
  const result = calculateWakeTime({
    meeting: '08:00',
    runMinutes: 60,
    travelMinutes: 15,
    breakfastMinutes: 20,
  });

  assert.strictEqual(result.latestWakeTime, '06:15');
  assert.strictEqual(result.runStartTime, '06:00');
});

test('calculator: calculateWakeTime includes duration breakdown', () => {
  const result = calculateWakeTime({
    meeting: '07:30',
    runMinutes: 30,
    travelMinutes: 10,
    breakfastMinutes: 5,
  });

  assert.deepStrictEqual(result.durations, {
    prep: 45,
    prepBeforeRun: 20,
    run: 30,
    travel: 10,
    breakfast: 5,
  });
});
