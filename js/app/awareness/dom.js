/**
 * Awareness Module - DOM Management
 * DOM element caching and utilities
 */

/**
 * Weather awareness UI elements cache
 */
let awarenessElements = null;

/**
 * Build awareness elements object from DOM
 * @returns {object} Elements object
 */
const buildAwarenessElements = () => {
  const awMsgEl = document.getElementById('awMsg');
  return {
    awCity: document.getElementById('awCity'),
    awDawn: document.getElementById('awDawn'),
    awMsg: awMsgEl,
    awWindChill: document.getElementById('awWindChill'),
    awPoP: document.getElementById('awPoP'),
    awWetBulb: document.getElementById('awWetBulb'),
    awDawnIcon: document.getElementById('awDawnIcon'),
    awWindChillIcon: document.getElementById('awWindChillIcon'),
    awPoPIcon: document.getElementById('awPoPIcon'),
    awWetBulbIcon: document.getElementById('awWetBulbIcon'),
    awWetness: document.getElementById('awWetness'),
    awDecisionIcon: document.getElementById('awDecisionIcon'),
    awDecisionText: document.getElementById('awDecisionText'),
    useLoc: document.getElementById('useMyLocation'),
    placeInput: document.getElementById('placeQuery'),
    setPlace: document.getElementById('setPlace'),
    defaultMsg: awMsgEl ? awMsgEl.textContent : '',
  };
};

/**
 * Check if DOM element is stale (disconnected)
 * @param {Element} el - Element to check
 * @returns {boolean} True if stale
 */
const isElementStale = (el) => {
  if (!el) return true;
  if (typeof Element !== 'undefined' && el instanceof Element) {
    return !el.isConnected;
  }
  return false;
};

/**
 * Cache awareness DOM elements with staleness check
 * @returns {object} Cached elements
 */
export const cacheAwarenessElements = () => {
  if (
    !awarenessElements ||
    isElementStale(awarenessElements.awMsg) ||
    isElementStale(awarenessElements.awCity)
  ) {
    awarenessElements = buildAwarenessElements();
  }
  return awarenessElements;
};
