/**
 * Awareness Module - Status Computation
 * Status computation and icon management
 */

/**
 * Set status icon appearance
 * @param {Element} iconEl - Icon element
 * @param {string} status - Status: 'ok', 'yield', 'warning', 'none'
 */
export const setStatusIcon = (iconEl, status) => {
  if (!iconEl) return;
  iconEl.classList.add('hidden');
  iconEl.classList.remove('icon-ok', 'icon-yield', 'icon-warning');
  if (status === 'ok') {
    iconEl.textContent = '✅';
    iconEl.classList.remove('hidden');
    iconEl.classList.add('icon-ok');
  } else if (status === 'yield') {
    iconEl.textContent = '⚠';
    iconEl.classList.remove('hidden');
    iconEl.classList.add('icon-yield');
  } else if (status === 'warning') {
    iconEl.textContent = '⛔';
    iconEl.classList.remove('hidden');
    iconEl.classList.add('icon-warning');
  }
};

/**
 * Compute dawn status based on run start time
 * @param {number} runStartMinutes - Run start time in minutes since midnight
 * @param {Date} dawnDate - Dawn date
 * @returns {string} Status: 'ok', 'yield', 'warning'
 */
export const computeDawnStatus = (runStartMinutes, dawnDate) => {
  if (!Number.isFinite(runStartMinutes) || !dawnDate) return 'ok';
  const dawnMinutes = dawnDate.getHours() * 60 + dawnDate.getMinutes();
  if (!Number.isFinite(dawnMinutes)) return 'ok';
  const diff = runStartMinutes - dawnMinutes;
  if (!Number.isFinite(diff)) return 'ok';
  if (diff <= 5 && diff >= -5) return 'yield';
  if (diff < -5) return 'warning';
  return 'ok';
};

/**
 * Compute wind chill status
 * @param {number} windChillF - Wind chill temperature
 * @returns {string} Status: 'ok', 'yield', 'warning'
 */
export const computeWindStatus = (windChillF) => {
  if (typeof windChillF !== 'number') return 'ok';
  if (windChillF <= 30) return 'warning';
  if (windChillF <= 40) return 'yield';
  return 'ok';
};

/**
 * Compute precipitation probability status
 * @param {number} pop - Probability of precipitation (0-100)
 * @returns {string} Status: 'ok', 'yield', 'warning'
 */
export const computePrecipStatus = (pop) => {
  if (typeof pop !== 'number') return 'ok';
  if (pop >= 60) return 'warning';
  if (pop >= 30) return 'yield';
  return 'ok';
};

/**
 * Compute wet bulb temperature status
 * @param {number} wetBulbF - Wet bulb temperature
 * @returns {string} Status: 'ok', 'yield', 'warning'
 */
export const computeWetBulbStatus = (wetBulbF) => {
  if (typeof wetBulbF !== 'number') return 'ok';
  if (wetBulbF >= 75) return 'warning';
  if (wetBulbF >= 65) return 'yield';
  return 'ok';
};
