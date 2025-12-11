/**
 * Wake Time Calculator - Time Utilities
 * Time formatting and manipulation functions
 */

export const fmtTime12InZone = (date: Date, tz: string): string =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: tz,
  });

export const fmtYMDInZone = (date: Date, tz: string): string =>
  date.toLocaleDateString("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const tomorrowYMD = (tz: string): string =>
  fmtYMDInZone(new Date(Date.now() + 24 * 60 * 60 * 1000), tz);

export const parseISODate = (isoString: string): Date => new Date(isoString);

export const getMinutesSinceMidnightInZone = (date: Date, tz: string): number => {
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  });
  const parts = timeStr.split(":");
  if (parts.length < 2) {
    // Unexpected format from toLocaleTimeString - should not happen with en-US locale
    console.warn(`Unexpected time format: ${timeStr}`);
    return 0;
  }
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    console.warn(`Failed to parse time: ${timeStr}`);
    return 0;
  }
  return hours * 60 + minutes;
};
