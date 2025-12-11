import { checkDaylightNeeded, DawnInfo } from "./dawn.js";

export const updateLocationBadge = (
  location: string,
  runStartMinutes: number | null,
  dawnData: DawnInfo | null
): void => {
  if (typeof document === "undefined") return;
  const badge = document.getElementById("daylightWarning");
  if (!badge) return;

  const daylightCheck = checkDaylightNeeded(runStartMinutes, dawnData);

  if (daylightCheck.needed) {
    badge.textContent = daylightCheck.message;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number | undefined;
  return (...args: Parameters<T>) => {
    const later = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    // Type assertion needed: setTimeout returns different types in Node.js (NodeJS.Timeout)
    // vs Browser (number). We normalize to number for consistency with clearTimeout.
    timeout = setTimeout(later, wait) as unknown as number;
  };
};
