/**
 * Awareness Module - Barrel Export
 * Maintains backward compatibility with existing imports
 */

// Export event system
export { emitAwarenessEvent } from './events.js';

// Export DOM utilities
export { cacheAwarenessElements } from './dom.js';

// Export status functions
export {
  setStatusIcon,
  computeDawnStatus,
  computeWindStatus,
  computePrecipStatus,
  computeWetBulbStatus,
} from './status.js';

// Export display functions
export {
  updateDawnStatus,
  updateAwarenessDisplay,
  showAwarenessError,
  getCurrentDawn,
  setCurrentDawn,
} from './display.js';

// Export core functionality
export { refreshAwareness } from './core.js';

// Export handlers
export {
  handleUseMyLocation,
  handleLocationSearch,
  initializeAwareness,
  setupAwarenessListeners,
} from './handlers.js';
