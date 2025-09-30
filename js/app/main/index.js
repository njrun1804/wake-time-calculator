/**
 * Main App Module - Entry Point
 * Application initialization and export
 */

import { WakeTimeApp } from './app.js';

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    const app = new WakeTimeApp();
    await app.init();
  });
} else {
  const app = new WakeTimeApp();
  app.init();
}

// Export for testing
export { WakeTimeApp };
