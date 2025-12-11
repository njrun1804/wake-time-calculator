import { MINUTES_PER_DAY, MINUTES_PER_HOUR, PREP_MINUTES, PREP_BEFORE_RUN } from "./constants.js";

export type ScheduleDurations = {
  prep: number;
  prepBeforeRun: number;
  run: number;
  travel: number;
  breakfast: number;
};

export type CalculateParams = {
  meeting: string;
  runMinutes?: number;
  travelMinutes?: number;
  breakfastMinutes?: number;
};

export type ScheduleResult = {
  wakeTime: string;
  wakeTime12: string;
  totalMinutes: number;
  previousDay: boolean;
  runStartTime: string;
  runStartTime12: string;
  latestWakeTime: string;
  latestWakeTime12: string;
  durations: ScheduleDurations;
};

export const toMinutes = (time: string): number => {
  if (typeof time !== "string" || !time.includes(":")) {
    throw new Error(`Invalid time format: expected HH:MM, got "${time}"`);
  }

  const [h, m] = time.split(":").map((s) => Number.parseInt(s, 10));

  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    throw new Error(`Invalid time values: hours must be 0-23, minutes must be 0-59. Got "${time}"`);
  }

  return h * MINUTES_PER_HOUR + m;
};

export const fromMinutes = (total: number): string => {
  const minutes = ((total % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const h = Math.floor(minutes / MINUTES_PER_HOUR);
  const m = minutes % MINUTES_PER_HOUR;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const format12 = (time24: string): string => {
  const [h, m] = time24.split(":");
  const hour = Number.parseInt(h, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${period}`;
};

export const sanitizeMinutes = (value: string | number | undefined, fallback: number): number => {
  const number = Number.parseInt(String(value), 10);
  if (!Number.isNaN(number) && number >= 0 && number <= 999) {
    return number;
  }
  return fallback;
};

export const calculateWakeTime = ({
  meeting,
  runMinutes = 0,
  travelMinutes = 0,
  breakfastMinutes = 0,
}: CalculateParams): ScheduleResult => {
  const meetingMinutes = toMinutes(meeting);

  const totalMinutes = PREP_MINUTES + runMinutes + travelMinutes + breakfastMinutes;

  const wakeMinutes = meetingMinutes - totalMinutes;
  const previousDay = wakeMinutes < 0;
  const adjustedWakeMinutes = previousDay ? wakeMinutes + MINUTES_PER_DAY : wakeMinutes;

  const prepStartMinutes = meetingMinutes - PREP_MINUTES;
  const runStartMinutes = prepStartMinutes - runMinutes - travelMinutes;
  const latestWakeMinutes = runStartMinutes - PREP_BEFORE_RUN;

  return {
    wakeTime: fromMinutes(adjustedWakeMinutes),
    wakeTime12: format12(fromMinutes(adjustedWakeMinutes)),
    totalMinutes,
    previousDay,
    runStartTime: fromMinutes(runStartMinutes),
    runStartTime12: format12(fromMinutes(runStartMinutes)),
    latestWakeTime: fromMinutes(latestWakeMinutes),
    latestWakeTime12: format12(fromMinutes(latestWakeMinutes)),
    durations: {
      prep: PREP_MINUTES,
      prepBeforeRun: PREP_BEFORE_RUN,
      run: runMinutes,
      travel: travelMinutes,
      breakfast: breakfastMinutes,
    },
  };
};
