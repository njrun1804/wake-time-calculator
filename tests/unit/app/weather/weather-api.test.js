/**
 * Unit tests for weather/api.js
 * Tests API fetching, caching, and data transformation
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mock Storage and fetch before importing api module
const mockStorage = {
  cache: new Map(),
  loadCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > 3600000) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  },
  saveCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  },
  clear() {
    this.cache.clear();
  },
};

// Mock fetch globally
const originalFetch = globalThis.fetch;
let mockFetchImpl = null;

globalThis.fetch = async (url, options) => {
  if (mockFetchImpl) {
    return mockFetchImpl(url, options);
  }
  throw new Error('No mock fetch implementation set');
};

// Mock Storage module
const storageModule = await import('../../../../js/lib/storage.js');
storageModule.Storage.loadCache = mockStorage.loadCache.bind(mockStorage);
storageModule.Storage.saveCache = mockStorage.saveCache.bind(mockStorage);

// Import after mocks are set up
const { fetchWeatherAround, fetchWetnessInputs } = await import(
  '../../../../js/app/weather/api.js'
);

// Helper to create mock weather response
function createMockWeatherResponse(hourlyData) {
  return {
    ok: true,
    json: async () => ({
      hourly: hourlyData,
    }),
  };
}

// Helper to create mock wetness response
function createMockWetnessResponse(dailyData) {
  return {
    ok: true,
    json: async () => ({
      daily: dailyData,
    }),
  };
}

// Test fetchWeatherAround
test('fetchWeatherAround fetches and returns weather data', async () => {
  mockStorage.clear();

  const mockHourlyData = {
    time: ['2025-01-15T08:00', '2025-01-15T09:00', '2025-01-15T10:00'],
    temperature_2m: [35, 40, 45],
    wind_speed_10m: [5, 6, 7],
    precipitation_probability: [10, 20, 30],
    wet_bulb_temperature_2m: [32, 36, 40],
    weathercode: [0, 1, 2],
    snowfall: [0, 0, 0],
  };

  mockFetchImpl = async (url) => {
    assert.ok(url.includes('api.open-meteo.com/v1/forecast'));
    assert.ok(url.includes('latitude=45'));
    assert.ok(url.includes('longitude=-122'));
    return createMockWeatherResponse(mockHourlyData);
  };

  const whenLocal = new Date('2025-01-15T09:00:00');
  const result = await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');

  assert.equal(result.tempF, 40);
  assert.equal(result.windMph, 6);
  assert.equal(result.pop, 20);
  assert.equal(result.wetBulbF, 36);
  assert.equal(result.weatherCode, 1);
  assert.equal(result.snowfall, 0);
  assert.equal(result.isSnow, false);
  assert.ok(typeof result.windChillF === 'number');
});

test('fetchWeatherAround calculates wind chill correctly', async () => {
  mockStorage.clear();

  const mockHourlyData = {
    time: ['2025-01-15T08:00'],
    temperature_2m: [30],
    wind_speed_10m: [15],
    precipitation_probability: [0],
    wet_bulb_temperature_2m: [28],
    weathercode: [0],
    snowfall: [0],
  };

  mockFetchImpl = async () => createMockWeatherResponse(mockHourlyData);

  const whenLocal = new Date('2025-01-15T08:00:00');
  const result = await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');

  // Wind chill should be lower than actual temp when temp <= 50 and wind >= 3
  assert.ok(result.windChillF < result.tempF, 'Wind chill should be lower than temp');
  assert.ok(result.windChillF < 30);
});

test('fetchWeatherAround detects snow conditions from weather code', async () => {
  mockStorage.clear();

  const mockHourlyData = {
    time: ['2025-01-15T08:00'],
    temperature_2m: [28],
    wind_speed_10m: [5],
    precipitation_probability: [80],
    wet_bulb_temperature_2m: [26],
    weathercode: [71], // 71 = snow fall: slight
    snowfall: [0.5],
  };

  mockFetchImpl = async () => createMockWeatherResponse(mockHourlyData);

  const whenLocal = new Date('2025-01-15T08:00:00');
  const result = await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');

  assert.equal(result.isSnow, true, 'Should detect snow from weather code');
  assert.equal(result.snowfall, 0.5);
});

test('fetchWeatherAround detects snow from positive snowfall', async () => {
  mockStorage.clear();

  const mockHourlyData = {
    time: ['2025-01-15T08:00'],
    temperature_2m: [32],
    wind_speed_10m: [5],
    precipitation_probability: [70],
    wet_bulb_temperature_2m: [30],
    weathercode: [61], // Not a snow code
    snowfall: [1.2], // But snowfall is positive
  };

  mockFetchImpl = async () => createMockWeatherResponse(mockHourlyData);

  const whenLocal = new Date('2025-01-15T08:00:00');
  const result = await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');

  assert.equal(result.isSnow, true, 'Should detect snow from positive snowfall');
});

test('fetchWeatherAround finds closest hour when exact match not found', async () => {
  mockStorage.clear();

  const mockHourlyData = {
    time: ['2025-01-15T07:00', '2025-01-15T08:00', '2025-01-15T10:00'], // No 09:00
    temperature_2m: [30, 35, 45],
    wind_speed_10m: [5, 6, 7],
    precipitation_probability: [10, 20, 30],
    wet_bulb_temperature_2m: [28, 32, 40],
    weathercode: [0, 1, 2],
    snowfall: [0, 0, 0],
  };

  mockFetchImpl = async () => createMockWeatherResponse(mockHourlyData);

  const whenLocal = new Date('2025-01-15T09:00:00'); // Requesting 09:00
  const result = await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');

  // Should find closest hour (08:00 or 10:00, both are 1 hour away, should pick first)
  assert.ok([35, 45].includes(result.tempF), 'Should use closest hour data');
});

test('fetchWeatherAround handles missing data fields gracefully', async () => {
  mockStorage.clear();

  const mockHourlyData = {
    time: ['2025-01-15T08:00'],
    temperature_2m: [40],
    // Missing other fields
  };

  mockFetchImpl = async () => createMockWeatherResponse(mockHourlyData);

  const whenLocal = new Date('2025-01-15T08:00:00');
  const result = await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');

  assert.equal(result.tempF, 40);
  assert.equal(result.windMph, null);
  assert.equal(result.pop, null);
  assert.equal(result.wetBulbF, null);
  assert.equal(result.snowfall, null);
  assert.equal(result.isSnow, false);
});

test('fetchWeatherAround uses cache on second call', async () => {
  mockStorage.clear();

  let fetchCount = 0;
  mockFetchImpl = async () => {
    fetchCount++;
    return createMockWeatherResponse({
      time: ['2025-01-15T08:00'],
      temperature_2m: [40],
      wind_speed_10m: [5],
      precipitation_probability: [10],
      wet_bulb_temperature_2m: [36],
      weathercode: [0],
      snowfall: [0],
    });
  };

  const whenLocal = new Date('2025-01-15T08:00:00');

  // First call should fetch
  await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');
  assert.equal(fetchCount, 1);

  // Second call should use cache
  await fetchWeatherAround(45, -122, whenLocal, 'America/Denver');
  assert.equal(fetchCount, 1, 'Should not fetch again - cache hit');
});

test('fetchWeatherAround throws error when fetch fails', async () => {
  mockStorage.clear();

  mockFetchImpl = async () => ({
    ok: false,
    status: 500,
  });

  const whenLocal = new Date('2025-01-15T08:00:00');

  await assert.rejects(
    async () => fetchWeatherAround(45, -122, whenLocal, 'America/Denver'),
    /weather fetch failed/
  );
});

test('fetchWeatherAround throws error when no hourly data', async () => {
  mockStorage.clear();

  mockFetchImpl = async () => ({
    ok: true,
    json: async () => ({}), // No hourly field
  });

  const whenLocal = new Date('2025-01-15T08:00:00');

  await assert.rejects(
    async () => fetchWeatherAround(45, -122, whenLocal, 'America/Denver'),
    /no hourly data/
  );
});

// Test fetchWetnessInputs
test('fetchWetnessInputs fetches and processes daily precipitation data', async () => {
  mockStorage.clear();

  const mockDailyData = {
    time: ['2025-01-08', '2025-01-09', '2025-01-10'],
    precipitation_sum: [0.5, 0.3, 0.0],
    precipitation_hours: [3, 2, 0],
    rain_sum: [0.5, 0.3, 0.0],
    snowfall_sum: [0, 0, 0],
    et0_fao_evapotranspiration: [0.1, 0.12, 0.15],
    temperature_2m_max: [45, 50, 52],
    temperature_2m_min: [35, 38, 40],
  };

  mockFetchImpl = async (url) => {
    assert.ok(url.includes('daily'));
    assert.ok(url.includes('precipitation_sum'));
    assert.ok(url.includes('et0_fao_evapotranspiration'));
    return createMockWetnessResponse(mockDailyData);
  };

  const dawnDate = new Date('2025-01-11T06:00:00');
  const result = await fetchWetnessInputs(45, -122, dawnDate, 'America/Denver');

  assert.ok(typeof result.score === 'number');
  assert.equal(result.analysisDays, 3);
  assert.ok(result.totals.rainfall >= 0);
  assert.ok(Array.isArray(result.events));
  assert.ok(typeof result.summary === 'string');
});

test('fetchWetnessInputs excludes dawn day from analysis', async () => {
  mockStorage.clear();

  const mockDailyData = {
    time: ['2025-01-10', '2025-01-11'], // Includes dawn day
    precipitation_sum: [0.5, 1.0],
    precipitation_hours: [3, 5],
    rain_sum: [0.5, 1.0],
    snowfall_sum: [0, 0],
    et0_fao_evapotranspiration: [0.1, 0.1],
    temperature_2m_max: [45, 50],
    temperature_2m_min: [35, 40],
  };

  mockFetchImpl = async () => createMockWetnessResponse(mockDailyData);

  const dawnDate = new Date('2025-01-11T06:00:00');
  const result = await fetchWetnessInputs(45, -122, dawnDate, 'America/Denver');

  // Should only include days BEFORE dawn day
  assert.equal(result.analysisDays, 1, 'Should exclude dawn day');
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].date, '2025-01-10');
});

test('fetchWetnessInputs handles empty daily data', async () => {
  mockStorage.clear();

  mockFetchImpl = async () => ({
    ok: true,
    json: async () => ({}), // No daily field
  });

  const dawnDate = new Date('2025-01-11T06:00:00');
  const result = await fetchWetnessInputs(45, -122, dawnDate, 'America/Denver');

  assert.equal(result.score, 0);
  assert.equal(result.analysisDays, 0);
  assert.equal(result.summary, 'No meaningful precipitation in the past week');
});

test('fetchWetnessInputs uses cache on second call', async () => {
  mockStorage.clear();

  let fetchCount = 0;
  mockFetchImpl = async () => {
    fetchCount++;
    return createMockWetnessResponse({
      time: ['2025-01-10'],
      precipitation_sum: [0.5],
      precipitation_hours: [3],
      rain_sum: [0.5],
      snowfall_sum: [0],
      et0_fao_evapotranspiration: [0.1],
      temperature_2m_max: [45],
      temperature_2m_min: [35],
    });
  };

  const dawnDate = new Date('2025-01-11T06:00:00');

  // First call should fetch
  await fetchWetnessInputs(45, -122, dawnDate, 'America/Denver');
  assert.equal(fetchCount, 1);

  // Second call should use cache
  await fetchWetnessInputs(45, -122, dawnDate, 'America/Denver');
  assert.equal(fetchCount, 1, 'Should not fetch again - cache hit');
});

test('fetchWetnessInputs handles missing data fields gracefully', async () => {
  mockStorage.clear();

  const mockDailyData = {
    time: ['2025-01-10'],
    precipitation_sum: [0.5],
    rain_sum: [0.5],
    snowfall_sum: [0],
    precipitation_hours: [3],
    et0_fao_evapotranspiration: [], // Empty array - missing data
    temperature_2m_max: [], // Empty array - missing data
    temperature_2m_min: [], // Empty array - missing data
  };

  mockFetchImpl = async () => createMockWetnessResponse(mockDailyData);

  const dawnDate = new Date('2025-01-11T06:00:00');
  const result = await fetchWetnessInputs(45, -122, dawnDate, 'America/Denver');

  assert.ok(result.analysisDays >= 1);
  assert.ok(result.events.length > 0, 'Should have at least one event');

  const event = result.events.find((e) => e.date === '2025-01-10');
  assert.ok(event, 'Should find event for 2025-01-10');
  assert.equal(event.rain, 0.5);
  assert.equal(event.snowfall, 0);
  // et0 may be null or coerced to 0 when missing
  assert.ok(event.et0 === null || event.et0 === 0);
  assert.equal(event.maxTempF, null);
  assert.equal(event.minTempF, null);
});

test('fetchWetnessInputs throws error when fetch fails', async () => {
  mockStorage.clear();

  mockFetchImpl = async () => ({
    ok: false,
    status: 500,
  });

  const dawnDate = new Date('2025-01-11T06:00:00');

  await assert.rejects(
    async () => fetchWetnessInputs(45, -122, dawnDate, 'America/Denver'),
    /wetness fetch failed/
  );
});

test('fetchWetnessInputs processes snowfall data correctly', async () => {
  mockStorage.clear();

  const mockDailyData = {
    time: ['2025-01-10'],
    precipitation_sum: [1.0],
    precipitation_hours: [6],
    rain_sum: [0],
    snowfall_sum: [10.0], // 10 inches of snow
    et0_fao_evapotranspiration: [0.05],
    temperature_2m_max: [28],
    temperature_2m_min: [20],
  };

  mockFetchImpl = async () => createMockWetnessResponse(mockDailyData);

  const dawnDate = new Date('2025-01-11T06:00:00');
  const result = await fetchWetnessInputs(45, -122, dawnDate, 'America/Denver');

  assert.equal(result.events[0].snowfall, 10.0);
  assert.ok(result.snowpackRemaining > 0, 'Should have snowpack');
});

// Cleanup
test.after(() => {
  globalThis.fetch = originalFetch;
  mockStorage.clear();
});