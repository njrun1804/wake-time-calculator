import test from 'node:test';
import assert from 'node:assert/strict';

import { Storage } from '../../js/core/storage.js';
import {
  createMockLocalStorage,
  withPatchedGlobal,
} from './helpers/environment.js';

const runWithFreshStorage = (fn) =>
  withPatchedGlobal('localStorage', createMockLocalStorage(), fn);

test('storage: save/load handles primitive values', async () => {
  await runWithFreshStorage(() => {
    Storage.save('test:key', 'value');
    assert.strictEqual(Storage.load('test:key'), 'value');

    Storage.save('test:number', 123);
    assert.strictEqual(Storage.load('test:number'), '123');

    assert.strictEqual(Storage.load('missing', 'default'), 'default');
    assert.strictEqual(Storage.load('missing'), null);
  });
});

test('storage: saveFormValues and loadFormValues round-trip data', async () => {
  await runWithFreshStorage(() => {
    Storage.saveFormValues({
      firstMeeting: '09:00',
      run: 45,
      travel: 20,
      breakfast: 15,
      location: 'park',
    });

    const loaded = Storage.loadFormValues();
    assert.deepStrictEqual(loaded, {
      firstMeeting: '09:00',
      run: '45',
      travel: '20',
      breakfast: '15',
      location: 'park',
    });
  });
});

test('storage: loadFormValues returns defaults when empty', async () => {
  await runWithFreshStorage(() => {
    const loaded = Storage.loadFormValues();
    assert.deepStrictEqual(loaded, {
      firstMeeting: '08:30',
      run: '0',
      travel: '0',
      breakfast: '0',
      location: 'round-town',
    });
  });
});

test('storage: weather location save/load', async () => {
  await runWithFreshStorage(() => {
    const location = {
      lat: 42.3601,
      lon: -71.0589,
      city: 'Boston',
      tz: 'America/New_York',
    };

    Storage.saveWeatherLocation(location);
    const loaded = Storage.loadWeatherLocation();

    assert.deepStrictEqual(loaded, location);
  });
});

test('storage: invalid weather location returns null', async () => {
  await runWithFreshStorage(() => {
    Storage.saveWeatherLocation({ lat: 'invalid', lon: 'invalid' });
    assert.strictEqual(Storage.loadWeatherLocation(), null);
  });
});

test('storage: cache stores and retrieves JSON data', async () => {
  await runWithFreshStorage(() => {
    const data = { weather: 'sunny', temp: 72 };
    Storage.saveCache('test:cache', data);

    const loaded = Storage.loadCache('test:cache', 60_000);
    assert.deepStrictEqual(loaded, data);
  });
});

test('storage: expired cache returns null', async () => {
  await runWithFreshStorage(() => {
    Storage.saveCache('test:cache', { weather: 'cloudy' });

    const staleTime = String(Date.now() - 100_000);
    globalThis.localStorage.setItem('test:cache:t', staleTime);

    const loaded = Storage.loadCache('test:cache', 60_000);
    assert.strictEqual(loaded, null);
  });
});

test('storage: missing cache returns null', async () => {
  await runWithFreshStorage(() => {
    assert.strictEqual(Storage.loadCache('missing:cache', 60_000), null);
  });
});

test('storage: clear resets stored form and weather data', async () => {
  await runWithFreshStorage(() => {
    Storage.saveFormValues({
      firstMeeting: '10:00',
      run: 30,
    });
    Storage.saveWeatherLocation({ lat: 40.7128, lon: -74.006 });

    Storage.clear();

    const values = Storage.loadFormValues();
    const location = Storage.loadWeatherLocation();

    assert.deepStrictEqual(values, {
      firstMeeting: '08:30',
      run: '0',
      travel: '0',
      breakfast: '0',
      location: 'round-town',
    });
    assert.strictEqual(location, null);
  });
});
