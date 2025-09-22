import { test, expect } from '@playwright/test';
import {
  calculateWakeTime,
  toMinutes,
  fromMinutes,
  format12,
  sanitizeMinutes
} from '../../js/core/calculator.js';

test.describe('Calculator Module - Unit Tests', () => {

  test.describe('toMinutes', () => {
    test('converts time string to minutes', () => {
      expect(toMinutes('00:00')).toBe(0);
      expect(toMinutes('01:00')).toBe(60);
      expect(toMinutes('08:30')).toBe(510);
      expect(toMinutes('23:59')).toBe(1439);
    });
  });

  test.describe('fromMinutes', () => {
    test('converts minutes to time string', () => {
      expect(fromMinutes(0)).toBe('00:00');
      expect(fromMinutes(60)).toBe('01:00');
      expect(fromMinutes(510)).toBe('08:30');
      expect(fromMinutes(1439)).toBe('23:59');
    });

    test('handles negative minutes correctly', () => {
      expect(fromMinutes(-60)).toBe('23:00');
      expect(fromMinutes(-120)).toBe('22:00');
    });

    test('handles minutes over 24 hours', () => {
      expect(fromMinutes(1440)).toBe('00:00');
      expect(fromMinutes(1500)).toBe('01:00');
    });
  });

  test.describe('format12', () => {
    test('formats 24-hour time to 12-hour', () => {
      expect(format12('00:00')).toBe('12:00 AM');
      expect(format12('01:30')).toBe('1:30 AM');
      expect(format12('12:00')).toBe('12:00 PM');
      expect(format12('13:45')).toBe('1:45 PM');
      expect(format12('23:59')).toBe('11:59 PM');
    });
  });

  test.describe('sanitizeMinutes', () => {
    test('returns valid numbers unchanged', () => {
      expect(sanitizeMinutes(0, 10)).toBe(0);
      expect(sanitizeMinutes(45, 10)).toBe(45);
      expect(sanitizeMinutes(999, 10)).toBe(999);
    });

    test('returns fallback for invalid values', () => {
      expect(sanitizeMinutes('abc', 10)).toBe(10);
      expect(sanitizeMinutes(-5, 10)).toBe(10);
      expect(sanitizeMinutes(1000, 10)).toBe(10);
      expect(sanitizeMinutes(NaN, 10)).toBe(10);
    });
  });

  test.describe('calculateWakeTime', () => {
    test('calculates wake time for morning meeting', () => {
      const result = calculateWakeTime({
        meeting: '08:00',
        runMinutes: 45,
        travelMinutes: 20,
        breakfastMinutes: 15
      });

      expect(result.wakeTime).toBe('05:55');
      expect(result.wakeTime12).toBe('5:55 AM');
      expect(result.totalMinutes).toBe(125); // 45 + 45 + 20 + 15
      expect(result.previousDay).toBe(false);
    });

    test('handles previous day calculation', () => {
      const result = calculateWakeTime({
        meeting: '02:00',
        runMinutes: 90,
        travelMinutes: 30,
        breakfastMinutes: 45
      });

      expect(result.previousDay).toBe(true);
      expect(result.wakeTime12).toContain('PM');
    });

    test('calculates with no optional activities', () => {
      const result = calculateWakeTime({
        meeting: '09:00',
        runMinutes: 0,
        travelMinutes: 0,
        breakfastMinutes: 0
      });

      expect(result.wakeTime).toBe('08:15'); // 9:00 - 45 min prep
      expect(result.totalMinutes).toBe(45);
      expect(result.previousDay).toBe(false);
    });

    test('provides correct intermediate times', () => {
      const result = calculateWakeTime({
        meeting: '08:00',
        runMinutes: 60,
        travelMinutes: 15,
        breakfastMinutes: 20
      });

      // Latest wake = meeting - prep - run = 8:00 - 45 - 60 = 6:15
      expect(result.latestWakeTime).toBe('06:15');

      // Run start = meeting - prep - run - travel = 8:00 - 45 - 60 - 15 = 6:00
      expect(result.runStartTime).toBe('06:00');
    });

    test('returns correct duration breakdown', () => {
      const result = calculateWakeTime({
        meeting: '10:00',
        runMinutes: 30,
        travelMinutes: 25,
        breakfastMinutes: 15
      });

      expect(result.durations.prep).toBe(45);
      expect(result.durations.run).toBe(30);
      expect(result.durations.travel).toBe(25);
      expect(result.durations.breakfast).toBe(15);
      expect(result.durations.prepBeforeRun).toBe(20);
    });
  });
});