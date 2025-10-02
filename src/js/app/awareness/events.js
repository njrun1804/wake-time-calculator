/**
 * Awareness Module - Event System
 * Event emission and tracking for awareness state changes
 */

/**
 * Emit awareness event for tracking and testing
 * @param {string} type - Event type
 * @param {object} detail - Event detail data
 */
export const emitAwarenessEvent = (type, detail = {}) => {
  if (typeof window === 'undefined') return;
  const payload = {
    type,
    detail,
    timestamp: Date.now(),
  };
  if (!Array.isArray(window.__awarenessEvents)) {
    window.__awarenessEvents = [];
  }
  window.__awarenessEvents.push(payload);
  if (typeof window.__onAwarenessEvent === 'function') {
    try {
      window.__onAwarenessEvent(payload);
    } catch (error) {
      console.error('awareness event callback failed', error);
    }
  }
};
