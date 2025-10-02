/**
 * Location Module - Geolocation
 * Browser geolocation API wrapper
 */

/**
 * Get current location using browser geolocation
 * @returns {Promise<object>} Location data with lat, lon
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({ lat: latitude, lon: longitude });
      },
      (error) => {
        let message = 'Location access denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};
