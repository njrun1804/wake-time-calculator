import { storageKeys, weatherStorage, defaults } from "./constants.js";

type ToastType = "error" | "warning" | "info";

const showToast = (message: string, type: ToastType = "error") => {
  if (typeof document === "undefined") return;

  let container = document.getElementById("storage-toast");
  if (!container) {
    container = document.createElement("div");
    container.id = "storage-toast";
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "error" ? "#d32f2f" : "#ff9800"};
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 300px;
      transition: opacity 0.3s ease-out;
      opacity: 1;
    `;
    document.body.appendChild(container);
  }

  container.textContent = message;
  container.style.display = "block";
  container.style.opacity = "1";

  setTimeout(() => {
    if (container) {
      container.style.opacity = "0";
      setTimeout(() => {
        // Remove from DOM after fade-out animation completes
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 300);
    }
  }, 5000);
};

export const Storage = {
  save(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      showToast("Unable to save preferences. Browser storage may be full or disabled.", "error");
      return false;
    }
  },

  load(key: string, defaultValue: unknown = null): string | null {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : (defaultValue as string | null);
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return defaultValue as string | null;
    }
  },

  saveFormValues(values: Record<string, unknown>): void {
    Object.entries(storageKeys).forEach(([field, key]) => {
      if (values[field] !== undefined) {
        this.save(key, values[field]);
      }
    });
  },

  loadFormValues(): Record<string, string> {
    const values: Record<string, string> = {};
    Object.entries(storageKeys).forEach(([field, key]) => {
      const value = this.load(key, defaults[field as keyof typeof defaults]);
      values[field] =
        value !== null ? String(value) : String(defaults[field as keyof typeof defaults]);
    });
    return values;
  },

  saveWeatherLocation({
    lat,
    lon,
    city,
    tz,
  }: {
    lat?: number;
    lon?: number;
    city?: string;
    tz?: string;
  }): void {
    if (lat !== undefined) this.save(weatherStorage.lat, lat);
    if (lon !== undefined) this.save(weatherStorage.lon, lon);
    if (city !== undefined) this.save(weatherStorage.city, city);
    if (tz !== undefined) this.save(weatherStorage.tz, tz);
  },

  loadWeatherLocation(): { lat: number; lon: number; city: string; tz: string } | null {
    const lat = parseFloat(this.load(weatherStorage.lat) ?? "");
    const lon = parseFloat(this.load(weatherStorage.lon) ?? "");

    // Validate coordinates are finite and within valid bounds
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return null;
    }

    return {
      lat,
      lon,
      city: this.load(weatherStorage.city, "") ?? "",
      tz:
        this.load(weatherStorage.tz, Intl.DateTimeFormat().resolvedOptions().timeZone) ??
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  },

  clear(): void {
    try {
      Object.values(storageKeys).forEach((key) => localStorage.removeItem(key));
      Object.values(weatherStorage).forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  },

  saveCache(key: string, data: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(key + ":t", String(Date.now()));
      return true;
    } catch (error) {
      console.error("Failed to save cache:", error);
      return false;
    }
  },

  loadCache<T>(key: string, maxAge: number): T | null {
    try {
      const rawTimestamp = localStorage.getItem(key + ":t");
      if (rawTimestamp === null) {
        return null;
      }

      const timestamp = Number(rawTimestamp);
      if (!Number.isFinite(timestamp)) {
        // Invalid timestamp - clean up stale entries
        localStorage.removeItem(key);
        localStorage.removeItem(key + ":t");
        return null;
      }

      if (Date.now() - timestamp > maxAge) {
        // Expired cache - clean up stale entries
        localStorage.removeItem(key);
        localStorage.removeItem(key + ":t");
        return null;
      }
      const data = localStorage.getItem(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
      console.error("Failed to load cache:", error);
      return null;
    }
  },
};
