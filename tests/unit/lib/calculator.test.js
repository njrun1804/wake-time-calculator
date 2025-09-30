import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toMinutes,
  fromMinutes,
  format12,
  sanitizeMinutes,
  calculateWakeTime,
} from '../../../js/lib/calculator.js';

const minutesInDay = 24 * 60;

test('toMinutes converts HH:MM to minutes since midnight', () => {
  assert.equal(toMinutes('00:00'), 0);
  assert.equal(toMinutes('01:30'), 90);
  assert.equal(toMinutes('23:59'), minutesInDay - 1);
});

test('fromMinutes wraps around the day and pads zeros', () => {
  assert.equal(fromMinutes(0), '00:00');
  assert.equal(fromMinutes(90), '01:30');
  assert.equal(fromMinutes(minutesInDay + 5), '00:05');
  assert.equal(fromMinutes(-15), '23:45');
});

test('format12 renders a 12-hour clock with AM/PM suffix', () => {
  assert.equal(format12('00:15'), '12:15 AM');
  assert.equal(format12('11:59'), '11:59 AM');
  assert.equal(format12('12:00'), '12:00 PM');
  assert.equal(format12('23:45'), '11:45 PM');
});

test('sanitizeMinutes guards against NaN and negative numbers', () => {
  assert.equal(sanitizeMinutes('25', 10), 25);
  assert.equal(sanitizeMinutes('-2', 10), 10);
  assert.equal(sanitizeMinutes('999', 0), 999);
  assert.equal(sanitizeMinutes('1000', 0), 0);
  assert.equal(sanitizeMinutes('abc', 5), 5);
  assert.equal(sanitizeMinutes(undefined, 5), 5);
});

test('calculateWakeTime computes schedule details for the current day', () => {
  const result = calculateWakeTime({
    meeting: '08:30',
    runMinutes: 45,
    travelMinutes: 15,
    breakfastMinutes: 20,
  });

  assert.equal(result.wakeTime, '06:25');
  assert.equal(result.wakeTime12, '6:25 AM');
  assert.equal(result.totalMinutes, 125);
  assert.equal(result.previousDay, false);
  assert.equal(result.runStartTime12, '6:45 AM');
  assert.equal(result.latestWakeTime12, '7:00 AM');
  assert.deepEqual(result.durations, {
    prep: 45,
    prepBeforeRun: 20,
    run: 45,
    travel: 15,
    breakfast: 20,
  });
});

test('calculateWakeTime rolls over to the previous day when needed', () => {
  const result = calculateWakeTime({
    meeting: '05:00',
    runMinutes: 180,
    travelMinutes: 60,
    breakfastMinutes: 45,
  });

  assert.equal(result.wakeTime, '23:30');
  assert.equal(result.wakeTime12, '11:30 PM');
  assert.equal(result.previousDay, true);
  assert.equal(result.runStartTime12, '12:15 AM');
  assert.equal(result.latestWakeTime12, '1:15 AM');
});

test('calculateWakeTime accepts zeroed optional fields', () => {
  const result = calculateWakeTime({
    meeting: '10:00',
    runMinutes: 0,
    travelMinutes: 0,
    breakfastMinutes: 0,
  });

  assert.equal(result.wakeTime, '09:15');
  assert.equal(result.totalMinutes, 45);
});
