/**
 * Unit tests for Storage module
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage
global.localStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index) => Object.keys(store)[index] || null,
  };
})();

// Mock Intl.DateTimeFormat for timezone tests
global.Intl = {
  DateTimeFormat: () => ({
    resolvedOptions: () => ({ timeZone: 'America/New_York' }),
  }),
};

// Import after mocking
const { Storage } = await import('../../js/lib/storage.js');

describe('Storage.save', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves string values to localStorage', () => {
    Storage.save('testKey', 'testValue');
    assert.equal(localStorage.getItem('testKey'), 'testValue');
  });

  it('converts numbers to strings before saving', () => {
    Storage.save('numberKey', 42);
    assert.equal(localStorage.getItem('numberKey'), '42');
  });

  it('handles save errors gracefully', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('Quota exceeded');
    };

    Storage.save('failKey', 'value');
    assert.equal(localStorage.getItem('failKey'), null);

    localStorage.setItem = originalSetItem;
  });
});

describe('Storage.load', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads existing values from localStorage', () => {
    localStorage.setItem('existingKey', 'storedValue');
    const value = Storage.load('existingKey');
    assert.equal(value, 'storedValue');
  });

  it('returns null for non-existent keys', () => {
    const value = Storage.load('nonExistentKey');
    assert.equal(value, null);
  });

  it('returns default value for non-existent keys', () => {
    const value = Storage.load('nonExistentKey', 'default');
    assert.equal(value, 'default');
  });

  it('handles load errors gracefully', () => {
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = () => {
      throw new Error('Access denied');
    };

    const value = Storage.load('key', 'fallback');
    assert.equal(value, 'fallback');

    localStorage.getItem = originalGetItem;
  });
});

describe('Storage.saveFormValues', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves all provided form values', () => {
    const values = {
      firstMeeting: '08:30',
      run: '60',
      travel: '10',
      breakfast: '15',
      location: 'trail',
    };

    Storage.saveFormValues(values);

    assert.equal(localStorage.getItem('wake:meeting'), '08:30');
    assert.equal(localStorage.getItem('wake:run'), '60');
    assert.equal(localStorage.getItem('wake:travel'), '10');
    assert.equal(localStorage.getItem('wake:breakfast'), '15');
    assert.equal(localStorage.getItem('wake:location'), 'trail');
  });

  it('skips undefined values', () => {
    const values = {
      firstMeeting: '09:00',
      run: undefined,
      travel: '10',
    };

    Storage.saveFormValues(values);

    assert.equal(localStorage.getItem('wake:meeting'), '09:00');
    assert.equal(localStorage.getItem('wake:run'), null);
    assert.equal(localStorage.getItem('wake:travel'), '10');
  });
});

describe('Storage.loadFormValues', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads all form values from storage', () => {
    localStorage.setItem('wake:meeting', '09:00');
    localStorage.setItem('wake:run', '90');
    localStorage.setItem('wake:travel', '15');
    localStorage.setItem('wake:breakfast', '20');
    localStorage.setItem('wake:location', 'trail');

    const values = Storage.loadFormValues();

    assert.equal(values.firstMeeting, '09:00');
    assert.equal(values.run, '90');
    assert.equal(values.travel, '15');
    assert.equal(values.breakfast, '20');
    assert.equal(values.location, 'trail');
  });

  it('returns default values for missing keys', () => {
    const values = Storage.loadFormValues();

    assert.equal(values.firstMeeting, '08:30');
    assert.equal(values.run, '0');
    assert.equal(values.travel, '0');
    assert.equal(values.breakfast, '0');
    assert.equal(values.location, 'round-town');
  });

  it('converts all values to strings', () => {
    localStorage.setItem('wake:run', 60);

    const values = Storage.loadFormValues();

    assert.strictEqual(typeof values.run, 'string');
    assert.equal(values.run, '60');
  });
});

describe('Storage.saveWeatherLocation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves all location fields', () => {
    const location = {
      lat: 40.7128,
      lon: -74.006,
      city: 'New York',
      tz: 'America/New_York',
    };

    Storage.saveWeatherLocation(location);

    assert.equal(localStorage.getItem('wake:weatherLat'), '40.7128');
    assert.equal(localStorage.getItem('wake:weatherLon'), '-74.006');
    assert.equal(localStorage.getItem('wake:weatherCity'), 'New York');
    assert.equal(localStorage.getItem('wake:weatherTz'), 'America/New_York');
  });

  it('saves only provided fields', () => {
    const location = {
      lat: 40.7128,
      lon: -74.006,
    };

    Storage.saveWeatherLocation(location);

    assert.equal(localStorage.getItem('wake:weatherLat'), '40.7128');
    assert.equal(localStorage.getItem('wake:weatherLon'), '-74.006');
    assert.equal(localStorage.getItem('wake:weatherCity'), null);
    assert.equal(localStorage.getItem('wake:weatherTz'), null);
  });
});

describe('Storage.loadWeatherLocation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads complete weather location data', () => {
    localStorage.setItem('wake:weatherLat', '40.7128');
    localStorage.setItem('wake:weatherLon', '-74.006');
    localStorage.setItem('wake:weatherCity', 'New York');
    localStorage.setItem('wake:weatherTz', 'America/New_York');

    const location = Storage.loadWeatherLocation();

    assert.equal(location.lat, 40.7128);
    assert.equal(location.lon, -74.006);
    assert.equal(location.city, 'New York');
    assert.equal(location.tz, 'America/New_York');
  });

  it('returns null if coordinates are missing', () => {
    localStorage.setItem('wake:weatherCity', 'New York');

    const location = Storage.loadWeatherLocation();

    assert.equal(location, null);
  });

  it('uses defaults for missing city and timezone', () => {
    localStorage.setItem('wake:weatherLat', '40.7128');
    localStorage.setItem('wake:weatherLon', '-74.006');

    const location = Storage.loadWeatherLocation();

    assert.equal(location.city, '');
    assert.equal(location.tz, 'America/New_York');
  });
});

describe('Storage.clear', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes all wake-time specific keys', () => {
    localStorage.setItem('wake:meeting', '08:30');
    localStorage.setItem('wake:weatherLat', '40.7128');
    localStorage.setItem('other-app-key', 'should-remain');

    Storage.clear();

    assert.equal(localStorage.getItem('wake:meeting'), null);
    assert.equal(localStorage.getItem('wake:weatherLat'), null);
    assert.equal(localStorage.getItem('other-app-key'), 'should-remain');
  });

  it('handles clear errors gracefully', () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = () => {
      throw new Error('Access denied');
    };

    Storage.clear();

    localStorage.removeItem = originalRemoveItem;
  });
});

describe('Storage.saveCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves data as JSON with timestamp', () => {
    const data = { temp: 72, condition: 'sunny' };

    Storage.saveCache('weather:cache', data);

    const cached = localStorage.getItem('weather:cache');
    const timestamp = localStorage.getItem('weather:cache:t');

    assert.ok(cached);
    assert.ok(timestamp);
    assert.deepEqual(JSON.parse(cached), data);
  });

  it('handles cache save errors gracefully', () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = () => {
      throw new Error('Quota exceeded');
    };

    Storage.saveCache('fail:cache', { data: 'value' });

    localStorage.setItem = originalSetItem;
  });
});

describe('Storage.loadCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads unexpired cached data', () => {
    const data = { temp: 72, condition: 'sunny' };
    const maxAge = 3600000;

    Storage.saveCache('weather:cache', data);
    const loaded = Storage.loadCache('weather:cache', maxAge);

    assert.deepEqual(loaded, data);
  });

  it('returns null for expired cache', () => {
    const data = { temp: 72 };
    const maxAge = 1000;

    localStorage.setItem('old:cache', JSON.stringify(data));
    localStorage.setItem('old:cache:t', String(Date.now() - 2000));

    const loaded = Storage.loadCache('old:cache', maxAge);

    assert.equal(loaded, null);
  });

  it('returns null for non-existent cache', () => {
    const loaded = Storage.loadCache('missing:cache', 3600000);
    assert.equal(loaded, null);
  });

  it('handles corrupted JSON gracefully', () => {
    localStorage.setItem('corrupt:cache', '{invalid json');
    localStorage.setItem('corrupt:cache:t', String(Date.now()));

    const loaded = Storage.loadCache('corrupt:cache', 3600000);

    assert.equal(loaded, null);
  });
});