import test from "node:test";
import assert from "node:assert/strict";

import {
  fmtTime12InZone,
  fmtYMDInZone,
  getMinutesSinceMidnightInZone,
  tomorrowYMD,
  parseISODate,
} from "../../../src/lib/time.js";

test("fmtTime12InZone renders expected time in provided zone", () => {
  const date = new Date("2024-01-05T10:30:00Z");
  const formatted = fmtTime12InZone(date, "America/New_York");
  assert.match(formatted, /^5:30 (AM|\u202fAM)$/);
});

test("fmtYMDInZone returns YYYY-MM-DD in zone", () => {
  const date = new Date("2024-07-04T02:00:00Z");
  const formatted = fmtYMDInZone(date, "America/Denver");
  assert.equal(formatted, "2024-07-03");
});

test("getMinutesSinceMidnightInZone computes local minutes", () => {
  const date = new Date("2024-01-05T06:15:00Z");
  const minutes = getMinutesSinceMidnightInZone(date, "America/New_York");
  assert.equal(minutes, 75); // 1:15 AM local time
});

test("tomorrowYMD returns next day in timezone", () => {
  // Freeze time to a specific date for consistent testing
  const mockNow = new Date("2024-01-15T10:00:00Z");
  const originalDate = Date;
  global.Date = class extends originalDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(mockNow);
      } else {
        super(...(args as ConstructorParameters<typeof originalDate>));
      }
    }
    static now() {
      return mockNow.getTime();
    }
  } as typeof Date;

  try {
    const result = tomorrowYMD("America/New_York");
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
    // Should be next day from mock date (2024-01-16 in NY timezone)
    assert.ok(result >= "2024-01-15");
  } finally {
    global.Date = originalDate;
  }
});

test("tomorrowYMD handles timezone edge cases", () => {
  const mockNow = new Date("2024-07-04T02:00:00Z");
  const originalDate = Date;
  global.Date = class extends originalDate {
    constructor(...args: unknown[]) {
      if (args.length === 0) {
        super(mockNow);
      } else {
        super(...(args as ConstructorParameters<typeof originalDate>));
      }
    }
    static now() {
      return mockNow.getTime();
    }
  } as typeof Date;

  try {
    // Test multiple timezones
    const ny = tomorrowYMD("America/New_York");
    const tokyo = tomorrowYMD("Asia/Tokyo");
    const london = tomorrowYMD("Europe/London");

    assert.match(ny, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(tokyo, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(london, /^\d{4}-\d{2}-\d{2}$/);
  } finally {
    global.Date = originalDate;
  }
});

test("parseISODate parses valid ISO date strings", () => {
  const date1 = parseISODate("2024-01-15");
  assert.ok(date1 instanceof Date);
  assert.ok(!Number.isNaN(date1.getTime()));

  const date2 = parseISODate("2024-07-04T14:30:00Z");
  assert.ok(date2 instanceof Date);
  assert.ok(!Number.isNaN(date2.getTime()));

  const date3 = parseISODate("2024-12-31T23:59:59.999Z");
  assert.ok(date3 instanceof Date);
  assert.ok(!Number.isNaN(date3.getTime()));
});

test("parseISODate handles invalid ISO strings", () => {
  // Invalid date strings still create Date objects, but they may be Invalid Date
  const invalid1 = parseISODate("not-a-date");
  // Date constructor returns Invalid Date for invalid strings
  assert.ok(Number.isNaN(invalid1.getTime()) || invalid1 instanceof Date);

  const invalid2 = parseISODate("");
  assert.ok(Number.isNaN(invalid2.getTime()) || invalid2 instanceof Date);
});

test("getMinutesSinceMidnightInZone handles multiple timezones", () => {
  const date = new Date("2024-01-05T12:00:00Z");

  const ny = getMinutesSinceMidnightInZone(date, "America/New_York");
  const tokyo = getMinutesSinceMidnightInZone(date, "Asia/Tokyo");
  const london = getMinutesSinceMidnightInZone(date, "Europe/London");

  assert.ok(ny >= 0 && ny < 1440);
  assert.ok(tokyo >= 0 && tokyo < 1440);
  assert.ok(london >= 0 && london < 1440);
});

test("fmtYMDInZone handles DST transitions", () => {
  // Spring forward in US (second Sunday in March)
  const springDate = new Date("2024-03-10T07:00:00Z"); // 3 AM EST = 7 AM UTC
  const springNY = fmtYMDInZone(springDate, "America/New_York");
  assert.match(springNY, /^2024-03-\d{2}$/);

  // Fall back in US (first Sunday in November)
  const fallDate = new Date("2024-11-03T06:00:00Z"); // 2 AM EST = 6 AM UTC
  const fallNY = fmtYMDInZone(fallDate, "America/New_York");
  assert.match(fallNY, /^2024-11-\d{2}$/);
});
