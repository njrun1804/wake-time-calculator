import test from 'node:test';
import assert from 'node:assert/strict';

import {
  fmtTime12InZone,
  fmtYMDInZone,
  tomorrowYMD,
  parseISODate,
} from '../../js/utils/time.js';

test('time: fmtTime12InZone formats across zones', () => {
  const date = new Date('2024-01-01T14:30:00Z');
  assert.strictEqual(fmtTime12InZone(date, 'UTC'), '2:30 PM');
  assert.strictEqual(fmtTime12InZone(date, 'America/New_York'), '9:30 AM');
  assert.strictEqual(fmtTime12InZone(date, 'America/Los_Angeles'), '6:30 AM');
});

test('time: fmtTime12InZone handles noon and midnight', () => {
  const midnight = new Date('2024-01-01T00:00:00Z');
  const noon = new Date('2024-01-01T12:00:00Z');

  assert.strictEqual(fmtTime12InZone(midnight, 'UTC'), '12:00 AM');
  assert.strictEqual(fmtTime12InZone(noon, 'UTC'), '12:00 PM');
});

test('time: fmtYMDInZone normalises to YYYY-MM-DD', () => {
  const date = new Date('2024-07-15T14:30:00Z');
  assert.strictEqual(fmtYMDInZone(date, 'UTC'), '2024-07-15');
  assert.strictEqual(fmtYMDInZone(date, 'America/New_York'), '2024-07-15');
});

test('time: fmtYMDInZone handles day boundaries', () => {
  const date = new Date('2024-01-01T06:00:00Z');
  assert.strictEqual(fmtYMDInZone(date, 'UTC'), '2024-01-01');
  assert.strictEqual(fmtYMDInZone(date, 'Pacific/Honolulu'), '2023-12-31');
  assert.strictEqual(fmtYMDInZone(date, 'Asia/Tokyo'), '2024-01-01');
});

test('time: tomorrowYMD returns the next day', () => {
  const originalNow = Date.now;
  Date.now = () => new Date('2024-01-01T12:00:00Z').getTime();
  try {
    assert.strictEqual(tomorrowYMD('UTC'), '2024-01-02');
  } finally {
    Date.now = originalNow;
  }
});

test('time: parseISODate creates Date instances', () => {
  const date = parseISODate('2024-01-01T14:30:00Z');
  assert.strictEqual(date.getFullYear(), 2024);
  assert.strictEqual(date.getMonth(), 0);
  assert.strictEqual(date.getDate(), 1);
  assert.strictEqual(date.getUTCHours(), 14);
  assert.strictEqual(date.getUTCMinutes(), 30);
});
